import { ERROR_CODES } from "../../../shared/utils/types";
import { UserCancelBookingInput } from "../../dtos/booking.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { RefundFor, RefundReason } from "../../../domain/enums/payment.enum";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IPaymentServiceClient } from "../../../domain/interfaces/clients/IPaymentService.client";

export class CancelBookingUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly bookingRepository: IBookingRepository,
        private readonly paymentServiceClient: IPaymentServiceClient
    ) { };

    async execute(input: UserCancelBookingInput): Promise<void> {
        try {
            const { userId, bookingId, reason } = input;
            if (!userId || !bookingId) {
                throw new BadRequestError();
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            const booking = await this.bookingRepository.findById(bookingId);
            if (!booking) {
                throw new NotFoundError(
                    "Booking not found",
                    ERROR_CODES.BOOKING_NOT_FOUND
                );
            }

            if (booking.userId !== userId) {
                throw new BadRequestError(
                    "You are not authorized to cancel this booking",
                    ERROR_CODES.UNAUTHORIZED
                );
            }

            if (booking.appointmentStatus === AppointmentStatus.CANCELLED) {
                throw new BadRequestError(
                    "Booking already cancelled",
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            if (booking.appointmentStatus === AppointmentStatus.COMPLETED) {
                throw new BadRequestError(
                    "Appointment already completed",
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            if (booking.appointmentStatus === AppointmentStatus.REJECTED_BY_PROVIDER) {
                throw new BadRequestError(
                    "Appointment was rejected by provider",
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            if (!booking.paymentId) {
                throw new BadRequestError(
                    "No payment id found",
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            const refundResult = await this.paymentServiceClient.processRefund({
                paymentId: booking.paymentId,
                bookingId,
                reasonInDetail: reason ?? "Booking cancelled by user",
                refundFor: RefundFor.CANCEL_BOOKING,
                refundReason: RefundReason.REQUESTED_BY_CUSTOMER
            });

            if(!refundResult.success) {
                throw new AppError(
                    "Failed to process refund",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            }

            booking.cancelAppointment();
            const updatedBooking = await this.bookingRepository.update(booking);
            if (!updatedBooking) {
                throw new NotFoundError(
                    "Updated Booking not found",
                    ERROR_CODES.BOOKING_NOT_FOUND
                );
            }


        } catch (error) {
            throw toAppError(error, "Failed to cancel booking");
        };
    };
};
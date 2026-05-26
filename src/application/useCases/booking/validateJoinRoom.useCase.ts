import { isSameDay, startOfDay } from "date-fns";
import { Role } from "../../../domain/enums/common.enum";
import { ERROR_CODES } from "../../../shared/utils/types";
import { ValidateJoinRoomInput } from "../../dtos/booking.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../../shared/error/appError";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class ValidateJoinRoomUsecase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
    ) { };

    async execute(input: ValidateJoinRoomInput): Promise<void> {
        try {
            const { bookingId, roomId, userId, role } = input;
            if (!bookingId || !roomId || !userId || !role) {
                throw new BadRequestError()
            }

            const booking = await this.bookingRepository.findById(bookingId);
            if (!booking) {
                throw new NotFoundError(
                    "Booking not found",
                    ERROR_CODES.BOOKING_NOT_FOUND
                );
            }

            const today = startOfDay(new Date());

            if (!isSameDay(booking.appointmentDate, today)) {
                throw new BadRequestError(
                    "Booking is not scheduled for today",
                    ERROR_CODES.INVALID_REQUEST
                );
            };

            if (booking.appointmentStatus !== AppointmentStatus.CONFIRMED) {
                throw new BadRequestError(
                    "Booking is not confirmed",
                    ERROR_CODES.BOOKING_NOT_CONFIRMED
                );
            };

            if (role === Role.USER) {
                if (String(booking.userId) !== String(userId)) {
                    throw new ForbiddenError(
                        "You are not authorized for this booking",
                        ERROR_CODES.UNAUTHORIZED
                    );
                }
            } else if (role === Role.PROVIDER) {
                if (String(booking.serviceProviderId) !== String(userId)) {
                    throw new ForbiddenError(
                        "You are not authorized for this booking provider",
                        ERROR_CODES.UNAUTHORIZED
                    );
                }
            } else {
                throw new BadRequestError();
            };

            if (booking.videoCallRoomId !== roomId) {
                throw new BadRequestError();
            };

        } catch (error: unknown) {
            throw toAppError(error, "Failed to validate room");
        };
    };
};
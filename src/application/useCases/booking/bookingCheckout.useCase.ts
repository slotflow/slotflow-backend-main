import { generateId } from '../../../shared/utils/generateId';
import { PaymentFor } from "../../../domain/enums/payment.enum";
import { ERROR_CODES, IdType } from '../../../shared/utils/types';
import { Booking } from "../../../domain/entities/booking.entity";
import { FindProviderServiceOutput } from "../../dtos/common.dto";
import { toAppError } from '../../../shared/error/handleUnknownError';
import { UserAppointmentBookingViaStripeInput } from '../../dtos/booking.dto';
import { AppError, BadRequestError, NotFoundError } from '../../../shared/error/appError';
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";
import { IServiceAvailabilityQueries } from "../../queries/IServiceAvailability.queries";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IPaymentServiceClient } from "../../../domain/interfaces/clients/IPaymentService.client";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class BookingCheckoutUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly providerServiceQueries: IProviderServiceQueries,
        private readonly serviceAvailabilityQueries: IServiceAvailabilityQueries,
        private readonly userRepository: IUserRepository,
        private readonly paymentServiceClient: IPaymentServiceClient
    ) { };

    async execute(input: UserAppointmentBookingViaStripeInput): Promise<string> {
        try {
            const { userId, providerId, slotId, selectedServiceMode, date } = input;
            if (!userId ||
                !providerId ||
                !slotId ||
                !selectedServiceMode ||
                !date
            ) {
                throw new BadRequestError();
            }

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new NotFoundError(
                    "User not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }

            const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
            if (!providerProfile) {
                throw new NotFoundError(
                    "Profile not found",
                    ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
                );
            }

            const providerService = await this.providerServiceQueries.findByProviderId({ providerId });
            if (!providerService) {
                throw new NotFoundError(
                    "Service not found",
                    ERROR_CODES.SERVICE_NOT_FOUND
                );
            }

            function isServiceData(obj: any): obj is FindProviderServiceOutput {
                return obj && typeof obj === 'object' && '_id' in obj;
            }

            if (!isServiceData(providerService)) throw new BadRequestError("Invalid service data");
            if (!providerProfile.serviceAvailabilityId) {
                throw new NotFoundError(
                    "Service availability not found",
                    ERROR_CODES.SERVICE_AVAILABILITY_NOT_FOUND
                );
            }

            const providerServiceAvailability = await this.serviceAvailabilityQueries.findByProviderId({ date, availabilityId: providerProfile.serviceAvailabilityId });
            if (!providerServiceAvailability) {
                throw new NotFoundError(
                    "Availability not found",
                    ERROR_CODES.SERVICE_AVAILABILITY_NOT_FOUND
                );
            }

            const selectedSlot = providerServiceAvailability.slots.filter((slot) => slot._id.toString() === slotId.toString());
            if (!selectedSlot || selectedSlot.length === 0) {
                throw new NotFoundError(
                    "Slot not found",
                    ERROR_CODES.SLOT_NOT_FOUND
                );
            }

            if (!selectedSlot[0].available) {
                throw new NotFoundError(
                    "Slot is not available for today",
                    ERROR_CODES.SLOT_NOT_AVAILABLE
                );
            }

            const existBooking = await this.bookingRepository.findByUserId(userId, date, selectedSlot[0].time);
            if (existBooking && existBooking.length > 0) {
                throw new BadRequestError(
                    "You already have an appointment on the same time",
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            const booking = await this.bookingRepository.create(Booking.create({
                appointmentDate: date,
                appointmentMode: selectedServiceMode,
                appointmentStatus: AppointmentStatus.PENDING,
                appointmentTime: selectedSlot[0].time,
                serviceProviderId: providerId,
                slotId,
                userId,
                statusTrack: [
                    {
                        appointmentStatus: AppointmentStatus.PENDING,
                        time: new Date()
                    }
                ],
                videoCallRoomId: generateId({ type: IdType.ROOM }),
            }));

            if(!booking) {
                throw new AppError(
                    "Failed to create booking",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }

            const { data } = await this.paymentServiceClient.createBookingCheckoutSession({
                serviceName: providerService.service.serviceName,
                bookingId: booking._id,
                description: providerService.serviceDescription,
                initialAmount: providerService.servicePrice,
                paymentFor: PaymentFor.APPOINTMENT_BOOKING,
                providerId,
                selectedServiceMode,
                slotDuration: Number(providerServiceAvailability.duration),
                unitAmount: providerService.servicePrice,
                userId,
                userEmail: user.email,
                userName: user.username,
                pushNotification: user.allowPushNotification ?? false,
            });

            return data;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to checkout");
        }
    }
}
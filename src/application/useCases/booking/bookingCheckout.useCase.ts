import { fromZonedTime } from 'date-fns-tz';
import { addMinutes, parse } from "date-fns";
import { PaymentFor } from "../../../domain/enums/payment.enum";
import { Booking } from "../../../domain/entities/booking.entity";
import { FindProviderServiceOutput } from "../../dtos/common.dto";
import { toAppError } from '../../../shared/error/handleUnknownError';
import { generateId } from '../../../shared/utils/helpers/generateId';
import { ERROR_CODES, IdType } from '../../../shared/utils/types/enums';
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { IPaymentServiceClient } from "../../interfaces/clients/IPaymentService.client";
import { AppError, BadRequestError, NotFoundError } from '../../../shared/error/appError';
import { IProviderServiceQueries } from "../../interfaces/queries/IProviderService.queries";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IServiceAvailabilityQueries } from "../../interfaces/queries/IServiceAvailability.queries";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";
import { UserAppointmentBookingViaStripeInput, UserAppointmentBookingViaStripeOutput } from '../../dtos/booking.dto';

export class BookingCheckoutUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly providerServiceQueries: IProviderServiceQueries,
        private readonly serviceAvailabilityQueries: IServiceAvailabilityQueries,
        private readonly paymentServiceClient: IPaymentServiceClient
    ) { };

    async execute(input: UserAppointmentBookingViaStripeInput): Promise<UserAppointmentBookingViaStripeOutput> {
        try {
            const { userId, providerId, slotId, selectedServiceMode, date, email, name, role } = input;
            if (!userId ||
                !providerId ||
                !slotId ||
                !selectedServiceMode ||
                !date ||
                !email ||
                !name ||
                !role
            ) {
                throw new BadRequestError();
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

            if (!isServiceData(providerService)) {
                throw new AppError(
                    "Internal server error",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                );
            };

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

            if (!providerServiceAvailability.duration) {
                throw new NotFoundError(
                    "Availability duration missing",
                    ERROR_CODES.SLOT_NOT_AVAILABLE
                );
            }

            const slotTime = selectedSlot[0].time;

            const existBooking = await this.bookingRepository.findByUserId(userId, date, slotTime);
            if (existBooking && existBooking.length > 0) {
                throw new BadRequestError(
                    "You already have an appointment at the same time",
                    ERROR_CODES.INVALID_REQUEST
                );
            }
            
            const istDateTimeString = `${date} ${slotTime}`;
            const parsedDate = parse(istDateTimeString, 'yyyy-MM-dd hh:mm a', new Date());
            const sessionStartTime = fromZonedTime(parsedDate, 'Asia/Kolkata');
            const appointmentDate = sessionStartTime;
            const sessionEndTime = addMinutes(sessionStartTime, providerServiceAvailability.duration);

            const booking = await this.bookingRepository.create(Booking.create({
                appointmentDate,
                appointmentTime: slotTime,
                appointmentMode: selectedServiceMode,
                appointmentStatus: AppointmentStatus.PENDING,
                serviceProviderId: providerId,
                slotId,
                sessionDuration: providerServiceAvailability.duration,
                sessionStartTime,
                sessionEndTime,
                userId,
                statusTrack: [
                    {
                        appointmentStatus: AppointmentStatus.PENDING,
                        time: new Date()
                    }
                ],
                videoCallRoomId: generateId({ type: IdType.ROOM }),
            }));

            if (!booking) {
                throw new AppError(
                    "Failed to create booking",
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }
            const { data } = await this.paymentServiceClient.createBookingCheckoutSession({
                bookingData: {
                    serviceName: providerService.serviceId.serviceName,
                    bookingId: booking._id,
                    description: providerService.serviceDescription,
                    paymentFor: PaymentFor.APPOINTMENT_BOOKING,
                    providerId,
                    unitAmount: providerService.servicePrice,
                },
                user: {
                    email,
                    id: userId,
                    name,
                    role
                }
            });

            return {
                sessionId: data
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to checkout");
        }
    }
}
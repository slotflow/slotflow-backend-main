import { addMinutes } from "date-fns";
import { PaymentFor } from "../../../domain/enums/payment.enum";
import { Booking } from "../../../domain/entities/booking.entity";
import { FindProviderServiceOutput } from "../../dtos/common.dto";
import { toAppError } from '../../../shared/error/handleUnknownError';
import { generateId } from '../../../shared/utils/helpers/generateId';
import { ERROR_CODES, IdType } from '../../../shared/utils/types/enums';
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { IPaymentServiceClient } from "../../interfaces/clients/IPaymentService.client";
import { AppError, BadRequestError, NotFoundError } from '../../../shared/error/appError';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { IProviderServiceQueries } from "../../interfaces/queries/IProviderService.queries";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IServiceAvailabilityQueries } from "../../interfaces/queries/IServiceAvailability.queries";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";
import { UserAppointmentBookingViaStripeInput, UserAppointmentBookingViaStripeOutput } from '../../dtos/booking.dto';
import { getDayBoundaryMetrics } from "../../../shared/utils/helpers/getDateRangeMetrics";
import { defaultTimezone } from "../../../shared/utils/constants/constant";
import { parseZonedSlotToUtc } from "../../../shared/utils/helpers/parseZonedSlotToUtc";

export class BookingCheckoutUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly providerServiceQueries: IProviderServiceQueries,
        private readonly serviceAvailabilityQueries: IServiceAvailabilityQueries,
        private readonly paymentServiceClient: IPaymentServiceClient,
        private readonly userRepository: IUserRepository
    ) { };

    async execute(input: UserAppointmentBookingViaStripeInput): Promise<UserAppointmentBookingViaStripeOutput> {
        try {
            const { userId, providerId, slotId, selectedServiceMode, date, email, name, role, timeZone } = input;
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

            const provider = await this.userRepository.findById(providerId);
            if (!provider) {
                throw new NotFoundError(
                    "provider not found",
                    ERROR_CODES.USER_NOT_FOUND
                );
            }
            const providerTimeZone = provider.timeZone?.value || defaultTimezone;

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

            const providerServiceAvailability = await this.serviceAvailabilityQueries.findByProviderId({
                date,
                timeZone: providerTimeZone,
                availabilityId: providerProfile.serviceAvailabilityId
            });
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
            const { start: startOfDay, end: endOfDay } = getDayBoundaryMetrics(date, providerTimeZone);

            const existBooking = await this.bookingRepository.findByUserId(userId, startOfDay, endOfDay, slotTime);
            if (existBooking && existBooking.length > 0) {
                throw new BadRequestError(
                    "You already have an appointment at the same time",
                    ERROR_CODES.INVALID_REQUEST
                );
            }

            const sessionStartTime = parseZonedSlotToUtc(date, slotTime, providerTimeZone);
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
                    role,
                    timeZone
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
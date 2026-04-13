import { v4 as uuid } from 'uuid';
import { log } from "../../../shared/logger/logger";
import { PaymentFor } from "../../../domain/enums/payment.enum";
import { Booking } from "../../../domain/entities/booking.entity";
import { FindProviderServiceResponse } from "../../dtos/common.dto";
import { UserAppointmentBookingViaStripeInput } from '../../dtos/booking.dtos';
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
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
            if (!userId || !providerId || !slotId || !selectedServiceMode || !date) throw new Error("Invalid request");

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found");

            const providerProfile = await this.providerProfileRepository.findById(providerId);
            if (!providerProfile) throw new Error("No provider found");

            const providerService = await this.providerServiceQueries.findByProviderId(providerId);
            if (!providerService) throw new Error("No service found");

            function isServiceData(obj: any): obj is FindProviderServiceResponse {
                return obj && typeof obj === 'object' && '_id' in obj;
            }

            if (!isServiceData(providerService)) throw new Error("No service data found");
            if (!providerProfile.serviceAvailabilityId) throw new Error("No service availability found");

            const providerServiceAvailability = await this.serviceAvailabilityQueries.findByProviderId(date, providerProfile.serviceAvailabilityId);
            if (!providerServiceAvailability) throw new Error("No availability found");

            console.dir(providerServiceAvailability, { depth: null, colors: true });

            const selectedSlot = providerServiceAvailability.slots.filter((slot) => slot._id.toString() === slotId.toString());
            if (!selectedSlot || selectedSlot.length === 0) throw new Error("Not slot found");

            if (!selectedSlot[0].available) throw new Error("This slot is not available for today");

            const existBooking = await this.bookingRepository.findByUserId(userId, date, selectedSlot[0].time);
            if (existBooking && existBooking.length > 0) throw new Error("You have already an appointment on the same time");

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
                videoCallRoomId: uuid(),
            }));

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
        } catch (error) {
            log.error("BookingCheckoutUseCase failed", error as Error);
            throw error;
        }
    }
}
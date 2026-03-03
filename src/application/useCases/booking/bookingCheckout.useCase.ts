import { Booking } from "../../../domain/entities/booking.entity";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { PaymentFor } from "../../../domain/enums/payment.enum";
import { IPaymentServiceClient } from "../../../domain/interfaces/clients/IPaymentService.client";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { log } from "../../../shared/logger/logger";
import { FindProviderServiceResponse } from "../../dtos/common.dto";
import { UserAppointmentBookingViaStripeRequest } from "../../dtos/user.dto";
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";
import { IServiceAvailabilityQueries } from "../../queries/IServiceAvailability.queries";
import { v4 as uuid } from 'uuid';

export class BookingCheckoutUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private bookingRepository: IBookingRepository,
        private providerServiceQueries: IProviderServiceQueries,
        private serviceAvailabilityQueries: IServiceAvailabilityQueries,
        private userRepository: IUserRepository,
        private paymentServiceClient: IPaymentServiceClient
    ) { };

    async execute(payload: UserAppointmentBookingViaStripeRequest): Promise<string> {
        try {
            const { userId, providerId, slotId, selectedServiceMode, date } = payload;
            if (!userId || !providerId || !slotId || !selectedServiceMode || !date) throw new Error("Invalid request");

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("No provider found");

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found");

            const providerService = await this.providerServiceQueries.findByProviderId(providerId);
            if (!providerService) throw new Error("No service found");

            function isServiceData(obj: any): obj is FindProviderServiceResponse {
                return obj && typeof obj === 'object' && '_id' in obj;
            }

            if (!isServiceData(providerService)) throw new Error("No service data found");
            if (!provider.serviceAvailabilityId) throw new Error("No service availability found");

            const providerServiceAvailability = await this.serviceAvailabilityQueries.findByProviderId(date, provider.serviceAvailabilityId);
            if (!providerServiceAvailability) throw new Error("No availability found");

            console.dir(providerServiceAvailability, { depth: null, colors: true });

            const selectedSlot = providerServiceAvailability.slots.filter((slot) => slot._id.toString() === slotId.toString());
            if (!selectedSlot || selectedSlot.length === 0) throw new Error("Not slot found");

            if (!selectedSlot[0].available) throw new Error("This slot is not available for today");

            const existBooking = await this.bookingRepository.findByUserId(userId, date, selectedSlot[0].time);
            if (existBooking && existBooking.length > 0) throw new Error("You have already an appointment on the same time");

            const booking = Booking.create({
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
            });

            await this.bookingRepository.create(booking);

            const { data } = await this.paymentServiceClient.createBookingCheckoutSession({
                appointmentDate: date,
                serviceName: providerService.service.serviceName,
                bookingId: booking._id,
                description: providerService.serviceDescription,
                initialAmount: providerService.servicePrice,
                paymentFor: PaymentFor.APPOINTMENT_BOOKING,
                providerId,
                selectedServiceMode,
                slotDuration: providerServiceAvailability.duration,
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
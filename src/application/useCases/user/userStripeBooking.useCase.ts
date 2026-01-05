import { v4 as uuidv4 } from 'uuid';
import { log } from '../../../shared/logger/logger';
import { stripe } from '../../../infrastructure/lib/stripe';
import { Payment } from '../../../domain/entities/payment.entity';
import { Booking } from '../../../domain/entities/booking.entity';
import { PaymentFor } from '../../../domain/enums/paymentFor.enum';
import { FindProviderServiceResponse } from '../../dtos/common.dto';
import { PaymentStatus } from '../../../domain/enums/paymentStatus.enum';
import { PaymentMethod } from '../../../domain/enums/paymentMethod.enum';
import { PaymentGateway } from '../../../domain/enums/paymentGateway.enum';
import { AppointmentStatus } from '../../../domain/enums/appointmentStatus.enum';
import { IProviderServiceQueries } from '../../queries/IProviderService.queries';
import { IServiceAvailabilityQueries } from '../../queries/IServiceAvailability.queries';
import { IUserRepository } from '../../../domain/interfaces/repositories/IUser.repository';
import { IPaymentRepository } from '../../../domain/interfaces/repositories/IPayment.repository';
import { IBookingRepository } from '../../../domain/interfaces/repositories/IBooking.repository';
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';
import { ICredentialRepository } from '../../../domain/interfaces/repositories/ICredentialRepository';
import { UserAppointmentBookingViaStripeRequest, UserSaveAppoinmentBookingRequest } from '../../dtos/user.dto';
import { IKafkaService } from '../../../domain/interfaces/services/IKafka.service';
import { kafkaConfig } from '../../../config/env';
import { IGoogleCalendarGatewayService } from '../../../domain/interfaces/services/IGoogleCalendarGateway.service';
import { IGoogleTokenService } from '../../../domain/interfaces/services/IGoogleToken.service';

export class UserAppointmentBookingViaStripeUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private bookingRepository: IBookingRepository,
        private providerServiceQueries: IProviderServiceQueries,
        private serviceAvailabilityQueries: IServiceAvailabilityQueries
    ) { };

    async execute(payload: UserAppointmentBookingViaStripeRequest): Promise<string> {
        try {

            const { userId, providerId, slotId, selectedServiceMode, date } = payload;
            if (!userId || !providerId || !slotId || !selectedServiceMode || !date) throw new Error("Invalid request");

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("No provider found");

            const providerService = await this.providerServiceQueries.findByProviderId(providerId);
            if (!providerService) throw new Error("No service found");

            function isServiceData(obj: any): obj is FindProviderServiceResponse {
                return obj && typeof obj === 'object' && '_id' in obj;
            }

            if (!isServiceData(providerService)) throw new Error("No service data found");
            if(!provider.serviceAvailabilityId) throw new Error("No service availability found");

            const providerServiceAvailability = await this.serviceAvailabilityQueries.findByProviderId(date, provider.serviceAvailabilityId);
            console.log("providerServiceAvailability : ",providerServiceAvailability);
            if (!providerServiceAvailability) throw new Error("No availability found");

            console.log("usecase availability");
            console.dir(providerServiceAvailability, { depth: null, colors: true });

            const selectedSlot = providerServiceAvailability.slots.filter((slot) => slot._id.toString() === slotId.toString());
            console.log("selectedSlot : ", selectedSlot);
            if (!selectedSlot || selectedSlot.length === 0) throw new Error("Not slot found");

            if (!selectedSlot[0].available) throw new Error("This slot is not available for today");

            const existBooking = await this.bookingRepository.findByUserId(userId, providerServiceAvailability.day, date, selectedSlot[0].time);
            if (existBooking && existBooking.length > 0) throw new Error("You have already an appointment on the same time");

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                line_items: [{
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: providerService.serviceName,
                            description: providerService.serviceDescription,
                        },
                        unit_amount: providerService.servicePrice * 100,
                    },
                    quantity: 1
                }],
                success_url: `http://localhost:5173/user/payment-success/?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `http://localhost:5173/user/payment-failed/`,
                metadata: {
                    providerId: providerId.toString(),
                    selectedDay: providerServiceAvailability.day,
                    slotId: slotId.toString(),
                    slotDuration: providerServiceAvailability.duration,
                    appointmentDate: date.toString(),
                    selectedServiceMode: selectedServiceMode,
                    initialAmount: providerService.servicePrice * 100,
                    totalAmount: providerService.servicePrice * 100,
                }
            });
            return session.id;
        } catch (error) {
            log.error("UserAppointmentBookingViaStripeUseCase failed", error as Error);
            throw error;
        };
    };
};


export class UserSaveBookingAfterStripePaymentUseCase {
    constructor(
        private userRepository: IUserRepository,
        private paymentRepository: IPaymentRepository,
        private bookingRepository: IBookingRepository,
        private serviceAvailabilityQueries: IServiceAvailabilityQueries,
        private providerRepository: IProviderRepository,
        private kafkaService: IKafkaService,
        private googleCalendarGatewayService: IGoogleCalendarGatewayService,
        private googleTokenService: IGoogleTokenService
    ) { };

    async execute(payload: UserSaveAppoinmentBookingRequest): Promise<void> {
        try {
            const { userId, sessionId } = payload;
            console.log("saving booking");
            if (!userId || !sessionId) throw new Error("Invalid request");

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found");

            const session = await stripe.checkout.sessions.retrieve(sessionId);

            const providerId = session?.metadata?.providerId;
            const selectedDay = session?.metadata?.selectedDay;
            const slotId = session?.metadata?.slotId;
            const selectedServiceMode = session?.metadata?.selectedServiceMode;
            const initialAmount = session?.metadata?.initialAmount;
            const totalAmount = session?.metadata?.totalAmount;
            const paymentStatus = session?.payment_status === "paid" ? PaymentStatus.Paid : PaymentStatus.Pending;
            const paymentMethod = session?.payment_method_types[0] as PaymentMethod;
            const dateString = session?.metadata?.appointmentDate;
            const paymentIntent = session?.payment_intent;
            const slotDuration = session?.metadata?.slotDuration;

            if (!providerId || !selectedDay || !slotId || !selectedServiceMode || !initialAmount || !totalAmount || !paymentStatus || !paymentMethod || !dateString || !paymentIntent || !slotDuration) throw new Error("Unexpected error, please try again");

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("No provider found");
            if(!provider.serviceAvailabilityId) throw new Error("No service availability found");

            const providerServiceAvailability = await this.serviceAvailabilityQueries.findByProviderId(new Date(dateString), provider.serviceAvailabilityId);
            if (!providerServiceAvailability) throw new Error("No availability found");

            const selectedSlot = providerServiceAvailability.slots.filter((slot) => slot._id.toString() === slotId);
            console.log("selectedSlot : ",selectedSlot);
            if (!selectedSlot || selectedSlot.length === 0) throw new Error("No available slots found for this day");

            if (!selectedSlot[0].available) throw new Error("This slot is not available for today");

            try {
                const paymentData = Payment.createForBooking({
                    transactionId: paymentIntent.toString(),
                    paymentStatus,
                    paymentMethod,
                    paymentGateway: PaymentGateway.Stripe,
                    paymentFor: PaymentFor.AppointmentBooking,
                    initialAmount: Number(initialAmount) / 100,
                    discountAmount: 0,
                    totalAmount: Number(totalAmount) / 100,
                    userId,
                    providerId,
                });
                const payment = await this.paymentRepository.create(paymentData);
                if (!payment) throw new Error("Unexpected error, payment saving error.");

                const accessToken = await this.googleTokenService.getAccessToken(userId);
                let eventId: string | null = null;
                if (user.googleConnected) {
                    const { id: eventId } = await this.googleCalendarGatewayService.createEvent({
                        accessToken: accessToken,
                        appointmentDate: new Date(dateString),
                        appointmentStatus: AppointmentStatus.Booked,
                        slotDuration: Number(slotDuration),
                        userId,
                    });
                    if (!eventId) throw new Error("Booking saving failed");
                };

                    const bookingData = Booking.create({
                        serviceProviderId: providerId,
                        userId,
                        appointmentDate: new Date(dateString),
                        appointmentMode: selectedServiceMode,
                        appointmentStatus: AppointmentStatus.Booked,
                        appointmentTime: selectedSlot[0].time,
                        videoCallRoomId: "stw-" + uuidv4(),
                        googleEventId: eventId,
                        paymentId: payment._id,
                        slotId: selectedSlot[0]._id,
                        statusTrack: [{
                            appointmentStatus: AppointmentStatus.Booked,
                            time: new Date(),
                        }],
                    });
                    const newBooking = await this.bookingRepository.create(bookingData);
                    console.log("newBooking one : ", newBooking);
                    if (!newBooking) throw new Error("Failed to confirm slot, please try again");
                    console.log("newBooking two : ", newBooking);

                    await this.kafkaService.send({
                        topic: kafkaConfig.topics.gotAppointment,
                        key: provider.email,
                        message: {
                            name: user.username,
                            email: provider.email,
                            contentNumber: 1
                        },
                    });

                    await this.kafkaService.send({
                        topic: kafkaConfig.topics.userPayment,
                        key: user.email,
                        message: {
                            name: user.username,
                            email: user.email,
                            contentNumber: 1
                        },
                    });

            } catch (error) {
                log.error("UserSaveBookingAfterStripePaymentUseCase failed", error as Error);
                throw error;
            };
        } catch (error) {
            log.error("UserSaveBookingAfterStripePaymentUseCase failed", error as Error);
            throw error;
        };
    };
};
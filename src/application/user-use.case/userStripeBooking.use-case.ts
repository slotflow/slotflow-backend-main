import { v4 as uuidv4 } from 'uuid';
import {
    UserSaveAppoinmentBookingRequest,
    UserAppointmentBookingViaStripeRequest,
} from "../../infrastructure/dtos/user.dto";
import { startSession, Types } from "mongoose";
import { stripe } from "../../infrastructure/lib/stripe";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { appointmentStatusArray, paymentForArray, paymentGatewayArray } from '../../shared/utils/constants';
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { AddEventToGoogleCalendarService } from "../../infrastructure/services/googleCalendar";
import { FindProviderServiceResponse } from "../../domain/repositories/IProviderService.repository";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ProviderServiceRepositoryImpl } from "../../infrastructure/database/providerService/providerService.repository.impl";
import { ServiceAvailabilityRepositoryImpl } from "../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";

export class UserAppointmentBookingViaStripeUseCase {
    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl,
        private providerServiceRepositoryImpl: ProviderServiceRepositoryImpl,
        private serviceAvailabilityRepositoryImpl: ServiceAvailabilityRepositoryImpl,
        private bookingRepositoryImpl: BookingRepositoryImpl,
    ) { }

    async execute(payload: UserAppointmentBookingViaStripeRequest): Promise<ApiResponse<string>> {
        try {

            const { userId, providerId, slotId, selectedServiceMode, date } = payload;
            if (!userId || !providerId || !slotId || !selectedServiceMode || !date) throw new Error("Invalid request");

            const provider = await this.providerRepositoryImpl.findProviderById(providerId);
            if (!provider) throw new Error("No provider found");

            const providerService = await this.providerServiceRepositoryImpl.findProviderServiceByProviderId(providerId);
            if (!providerService) throw new Error("No service found");

            function isServiceData(obj: any): obj is FindProviderServiceResponse {
                return obj && typeof obj === 'object' && '_id' in obj;
            }

            if (!isServiceData(providerService)) throw new Error("No service data found");

            const providerServiceAvailability = await this.serviceAvailabilityRepositoryImpl.findServiceAvailabilityByProviderId(providerId, date);
            if (!providerServiceAvailability) throw new Error("No availability found");

            console.log("usecase availability");
            console.dir(providerServiceAvailability, { depth: null, colors: true });

            const selectedSlot = providerServiceAvailability.slots.filter((slot) => slot._id.toString() === slotId.toString());
            console.log("selectedSlot : ", selectedSlot);
            if (!selectedSlot || selectedSlot.length === 0) throw new Error("Not slot found");

            if (!selectedSlot[0].available) throw new Error("This slot is not available for today");

            const existBooking = await this.bookingRepositoryImpl.findBookingByUserId(userId, providerServiceAvailability.day, date, selectedSlot[0].time);
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
            return { success: true, message: "Session id generated.", data: session.id };
        } catch (error) {
            console.log("UserAppointmentBookingViaStripeUseCase error : ", error);
            throw new Error("Failed to save appointment booking");
        }

    }

}


export class UserSaveBookingAfterStripePaymentUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
        private paymentRepositoryImpl: PaymentRepositoryImpl,
        private bookingRepositoryImpl: BookingRepositoryImpl,
        private serviceAvailabilityRepositoryImpl: ServiceAvailabilityRepositoryImpl,
        private addEventToGoogleCalendarService: AddEventToGoogleCalendarService,
    ) { }

    async execute(payload: UserSaveAppoinmentBookingRequest): Promise<ApiResponse> {
        try {
            const { userId, sessionId } = payload;
            console.log("saving booking");
            if (!userId || !sessionId) throw new Error("Invalid request");

            const user = await this.userRepositoryImpl.findUserById(new Types.ObjectId(userId));
            if (!user) throw new Error("No user found");

            const session = await stripe.checkout.sessions.retrieve(sessionId);

            const providerId = session?.metadata?.providerId;
            const selectedDay = session?.metadata?.selectedDay;
            const slotId = session?.metadata?.slotId;
            const selectedServiceMode = session?.metadata?.selectedServiceMode;
            const initialAmount = session?.metadata?.initialAmount;
            const totalAmount = session?.metadata?.totalAmount;
            const paymentStatus = session?.payment_status === "paid" ? "Paid" : "Pending";
            const paymentType = session?.payment_method_types[0];
            const dateString = session?.metadata?.appointmentDate;
            const paymentIntent = session?.payment_intent;
            const slotDuration = session?.metadata?.slotDuration;

            if (!providerId || !selectedDay || !slotId || !selectedServiceMode || !initialAmount || !totalAmount || !paymentStatus || !paymentType || !dateString || !paymentIntent || !slotDuration) throw new Error("Unexpected error, please try again");

            const providerServiceAvailability = await this.serviceAvailabilityRepositoryImpl.findServiceAvailabilityByProviderId(new Types.ObjectId(providerId), new Date(dateString));
            if (!providerServiceAvailability) throw new Error("No availability found");

            const selectedSlot = providerServiceAvailability.slots.filter((slot) => slot._id.toString() === slotId);
            if (!selectedSlot || selectedSlot.length === 0) throw new Error("No available slots found for this day");

            if (!selectedSlot[0].available) throw new Error("This slot is not available for today");

            // TODO mongoSession not work with compass
            // const mongoSession = await startSession();
            // mongoSession.startTransaction();

            try {
                const payment = await this.paymentRepositoryImpl.createPaymentForBooking({
                    transactionId: paymentIntent.toString(),
                    paymentStatus: paymentStatus,
                    paymentMethod: paymentType,
                    paymentGateway: paymentGatewayArray[0],
                    paymentFor: paymentForArray[1],
                    initialAmount: Number(initialAmount) / 100,
                    discountAmount: 0,
                    totalAmount: Number(totalAmount) / 100,
                    userId: new Types.ObjectId(userId),
                    providerId: new Types.ObjectId(providerId),
                }, 
                // { session: mongoSession }
            );

                if (!payment) throw new Error("Unexpected error, payment saving error.");


                if (user.googleConnected) {
                    const response = await this.addEventToGoogleCalendarService.execute({
                        userId,
                        slotDuration: Number(slotDuration),
                        appointmentDate: new Date(dateString),
                        appointmentStatus: appointmentStatusArray[0],
                    });
                    if (!response.success) throw new Error("Booking saving failed");

                    const newBooking = await this.bookingRepositoryImpl.createBooking({
                        serviceProviderId: new Types.ObjectId(providerId),
                        userId: new Types.ObjectId(userId),
                        appointmentDate: new Date(dateString),
                        appointmentMode: selectedServiceMode,
                        appointmentStatus: appointmentStatusArray[0],
                        appointmentTime: selectedSlot[0].time,
                        videoCallRoomId: "stw-" + uuidv4(),
                        googleEventId: response.data?.id!,
                        paymentId: payment._id,
                        slotId: selectedSlot[0]._id,
                        statusTrack: [{
                            appointmentStatus: appointmentStatusArray[0],
                            time: new Date(),
                        }]
                    }, 
                    // { session: mongoSession }
                );

                console.log("newBooking one : ",newBooking);
                    if (!newBooking) throw new Error("Error in slot booking, please try again");
                    console.log("newBooking two : ",newBooking);

                }

                // await mongoSession.commitTransaction();
                // mongoSession.endSession();

                return { success: true, message: "Your booking have been confirmed" }
            } catch (error) {
                console.log("UserSaveBookingAfterStripePaymentUseCase error : ", error);
                // await mongoSession.abortTransaction();
                // mongoSession.endSession();
                throw new Error("Subscribing error.");
            }
        } catch (error) {
            console.log("UserSaveBookingAfterStripePaymentUseCase error : ", error);
            throw new Error("Failed to save booking");
        }
    }
}
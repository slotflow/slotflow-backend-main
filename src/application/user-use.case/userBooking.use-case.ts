import mongoose, { Types } from "mongoose";
import { stripe } from "../../infrastructure/lib/stripe";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { UserCancelBookingRequest } from "../../infrastructure/dtos/user.dto";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { UpdateEventFromGoogleCalendarService } from "../../infrastructure/services/googleCalendar";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { appointmentStatusArray } from "../../shared/utils/constants";

export class UserCancelBookingUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
        private bookingRepositoryImpl: BookingRepositoryImpl,
        private paymentRepositoryImpl: PaymentRepositoryImpl,
        private updateEventFromGoogleCalendarService: UpdateEventFromGoogleCalendarService,
    ) { }

    async execute(payload: UserCancelBookingRequest): Promise<ApiResponse> {
        try {
            const { userId, bookingId } = payload;

            const user = await this.userRepositoryImpl.findUserById(new Types.ObjectId(userId));
            if (!user) throw new Error("No user found");

            const booking = await this.bookingRepositoryImpl.findBookingById(new Types.ObjectId(bookingId));
            if (!booking) throw new Error("No booking found");

            if (booking.appointmentStatus === appointmentStatusArray[2]) {
                throw new Error("Already cancelled");
            } else if (booking.appointmentStatus === appointmentStatusArray[1]) {
                throw new Error("Appointment completed");
            } else if (booking.appointmentStatus === appointmentStatusArray[3]) {
                throw new Error("Appointment rejected by the Service provider");
            }

            if (!booking.paymentId) throw new Error("No payment id found");
            const payment = await this.paymentRepositoryImpl.findPaymentById(new Types.ObjectId(booking.paymentId));
            if (!payment) throw new Error("No payment found for this booking");

            const mongooseSession = await mongoose.startSession();
            mongooseSession.startTransaction();

            try {

                booking.appointmentStatus = appointmentStatusArray[2];
                booking.statusTrack.push({
                    appointmentStatus: appointmentStatusArray[2],
                    time: new Date(),
                });
                const updateBooking = await this.bookingRepositoryImpl.updateBooking(booking, { session: mongooseSession });
                if (!updateBooking) throw new Error("Booking status updating error");

                if (payment.paymentGateway === "Stripe") {

                    let refundAmount = 0
                    const currentDate = new Date();
                    const appointmentDate = new Date(booking.appointmentDate);
                    currentDate.setHours(0, 0, 0, 0);
                    appointmentDate.setHours(0, 0, 0, 0);

                    if (appointmentDate > currentDate) {
                        refundAmount = Math.round(payment.totalAmount * 0.90);
                    } else if (appointmentDate.getTime() === currentDate.getTime()) {
                        refundAmount = Math.round(payment.totalAmount * 0.50);
                    }

                    const refund = await stripe.refunds.create({
                        payment_intent: payment.transactionId,
                        amount: refundAmount,
                    });

                    if (!refund) throw new Error("Refund processinga failed");

                    const updatedPayment = await this.paymentRepositoryImpl.updateBooking({
                        _id: payment._id,
                        transactionId: payment.transactionId,
                        paymentStatus: "Refunded",
                        paymentMethod: payment.paymentMethod,
                        paymentGateway: payment.paymentGateway,
                        paymentFor: payment.paymentFor,
                        initialAmount: payment.initialAmount,
                        discountAmount: payment.discountAmount,
                        totalAmount: payment.totalAmount,
                        userId: payment.userId,

                        refundAmount: refund.amount,
                        refundAt: new Date(refund.created * 1000),
                        refundId: refund.id,
                        refundReason: "Booking cancelled",
                        refundStatus: refund.status ?? "Pending",
                        chargeId: typeof refund.charge === "string" ? refund.charge : refund.charge?.id ?? undefined,
                    }, { session: mongooseSession });
                    if (!updatedPayment) throw new Error("Refund failed");

                    if (booking.googleEventId) {
                        const response = await this.updateEventFromGoogleCalendarService.execute({
                            userId: booking.userId,
                            eventId: booking.googleEventId,
                            appointmentDate: booking.appointmentDate,
                            appointmentStatus: booking.appointmentStatus
                        });
                        if (!response.success) {
                            throw new Error("Booking cancel failed");
                        }
                    }

                    await mongooseSession.commitTransaction();
                    mongooseSession.endSession();

                    return { success: true, message: "Booking cancelled" }

                } else {
                    throw new Error(`Refund not supported for payment gateway: ${payment.paymentGateway}`);
                }

            } catch (error) {
                console.log("UserCancelBookingUseCase error : ", error);
                await mongooseSession.abortTransaction();
                mongooseSession.endSession();
                throw new Error("Booking cancel failed")
            }
        } catch (error) {
            console.log("UserCancelBookingUseCase error : ", error);
            throw new Error("Failed to save booking");
        }
    }
}
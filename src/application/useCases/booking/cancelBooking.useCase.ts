import { log } from "../../../shared/logger/logger";
import { UserCancelBookingInput } from "../../dtos/booking.dto";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

// TODO kafka event to refund

export class CancelBookingUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly bookingRepository: IBookingRepository,
    ) { };

    async execute(input: UserCancelBookingInput): Promise<void> {
        try {
            const { userId, bookingId } = input;

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found");

            const booking = await this.bookingRepository.findById(bookingId);
            if (!booking) throw new Error("No booking found");

            if (booking.appointmentStatus === AppointmentStatus.CANCELLED) {
                throw new Error("Already cancelled");
            } else if (booking.appointmentStatus === AppointmentStatus.COMPLETED) {
                throw new Error("Appointment completed");
            } else if (booking.appointmentStatus === AppointmentStatus.REJECTED_BY_PROVIDER) {
                throw new Error("Appointment rejected by the Service provider");
            };

            if (!booking.paymentId) throw new Error("No payment id found");
            // const payment = await this.paymentRepository.findById(booking.paymentId);
            // if (!payment) throw new Error("No payment found for this booking");

            try {

                booking.cancelAppointment();
                const updatedBooking = await this.bookingRepository.update(booking);
                if (!updatedBooking) throw new Error("Booking status updating error");

                // if (payment.paymentGateway === PaymentGateway.STRIPE) {

                // let refundAmount = 0
                // const currentDate = new Date();
                // const appointmentDate = new Date(booking.appointmentDate);
                // currentDate.setHours(0, 0, 0, 0);
                // appointmentDate.setHours(0, 0, 0, 0);

                // if (appointmentDate > currentDate) {
                //     refundAmount = Math.round(payment.totalAmount * 0.90);
                // } else if (appointmentDate.getTime() === currentDate.getTime()) {
                //     refundAmount = Math.round(payment.totalAmount * 0.50);
                // };

                // const refund = await stripe.refunds.create({
                //     payment_intent: payment.transactionId,
                //     amount: refundAmount,
                // });

                // if (!refund) throw new Error("Refund processinga failed");

                // payment.update({
                //     paymentStatus: PaymentStatus.REFUNDED,
                //     paymentMethod: payment.paymentMethod,
                //     paymentGateway: payment.paymentGateway,
                //     paymentFor: payment.paymentFor,
                //     initialAmount: payment.initialAmount,
                //     discountAmount: payment.discountAmount,
                //     totalAmount: payment.totalAmount,

                //     refundAmount: refund.amount,
                //     refundAt: new Date(refund.created * 1000),
                //     refundId: refund.id,
                //     refundReason: "Booking cancelled",
                //     refundStatus: refund.status as PaymentStatus ?? PaymentStatus.PENDING,
                //     chargeId: typeof refund.charge === "string" ? refund.charge : refund.charge?.id ?? undefined,
                // });

                // const updatedPayment = await this.paymentRepository.update(payment);
                // if (!updatedPayment) throw new Error("Refund failed");

                // const accessToken = await this.googleTokenService.getAccessToken(userId);


                // } else {
                //     throw new Error(`Refund not supported for payment gateway: ${payment.paymentGateway}`);
                // };

            } catch (error) {
                log.error("CancelBookingUseCase failed", error as Error);
                throw error;
            };
        } catch (error) {
            log.error("CancelBookingUseCase failed", error as Error);
            throw error;
        };
    };
};
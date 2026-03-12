import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { log } from "../../../shared/logger/logger";
import { UpdateBookingAfterPaymentFailedEventResult } from "../../dtos/common.dto";
import { EventEnvelope } from "../../dtos/kafka.dtos";

export class UpdateBookingAfterPaymentFailedUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository
    ) { }

    async execute(payload: EventEnvelope<UpdateBookingAfterPaymentFailedEventResult>): Promise<void> {
        try {
            const { eventId,
                attempt,
                maxAttempts,
                occurredAt,
                payload: {
                    mbsData: {
                        bookingId
                    }
                }
             } = payload;

             const booking = await this.bookingRepository.findById(bookingId);
             if(!booking) throw new Error("Booking not found.");

             booking.updateBookingAfterPayment({
                appointmentStatus: AppointmentStatus.PENDING,
                paymentId: null
             });

             await this.bookingRepository.update(booking);
        } catch (error) {
            log.error("UpdateBookingAfterPaymentFailedUseCase failed : ",error as Error);
            throw error;
        }
    }
}
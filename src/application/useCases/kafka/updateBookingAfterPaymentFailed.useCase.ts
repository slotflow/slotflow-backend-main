import { log } from "../../../shared/logger/logger";
import { EventEnvelope } from "../../dtos/kafka.dto";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { UpdateBookingAfterPaymentFailedEventResult } from "../../dtos/common.dto";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class UpdateBookingAfterPaymentFailedUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository
    ) { }

    async execute(input: EventEnvelope<UpdateBookingAfterPaymentFailedEventResult>): Promise<void> {
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
            } = input;

            const booking = await this.bookingRepository.findById(bookingId);
            if (!booking) throw new Error("Booking not found.");

            booking.updateBookingAfterPayment({
                appointmentStatus: AppointmentStatus.PENDING,
                paymentId: null
            });

            await this.bookingRepository.update(booking);
        } catch (error) {
            log.error("UpdateBookingAfterPaymentFailedUseCase failed : ", error as Error);
        }
    }
}
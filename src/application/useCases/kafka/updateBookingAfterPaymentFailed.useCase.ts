import { NotFoundError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ERROR_CODES, IdType } from "../../../shared/utils/types/enums";
import { UpdateBookingPaymentFailedEventInput } from "../../dtos/kafka.dto";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class UpdateBookingAfterPaymentFailedUseCase {

    constructor(
        private readonly bookingRepository: IBookingRepository,
    ) { }

    async execute(input: UpdateBookingPaymentFailedEventInput): Promise<void> {
        try {
            const { bookingId } = input;

            const booking = await this.bookingRepository.findById(bookingId);
            if (!booking) {
                throw new NotFoundError(
                    "Booking not found",
                    ERROR_CODES.BOOKING_NOT_FOUND
                )
            }

            booking.updateBookingAfterPaymentFailed();

            await this.bookingRepository.update(booking);

        } catch (error) {
            throw toAppError(error, "Failed to update booking after payment failed");
        }
    }
}
import dayjs from "../../../shared/config/dayjs";
import { CheckBookingInput } from "../../dtos/booking.dto";
import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class CheckBookingUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository
    ) { }

    async execute(input: CheckBookingInput): Promise<boolean> {
        try {
            const { userId } = input;
            if (!userId) {
                throw new BadRequestError()
            }

            const booking = await this.bookingRepository.getLatestBookingByUserId(userId);
            if (!booking) {
                return false;
            }

            const isToday = dayjs(booking.createdAt).isSame(dayjs(), "day");
            if (
                isToday &&
                booking.paymentId &&
                booking.appointmentStatus === AppointmentStatus.BOOKED
            ) {
                return true;
            }

            return false;

        } catch (error: unknown) {
            throw toAppError(error, "Failed to check booking");
        }
    }
}
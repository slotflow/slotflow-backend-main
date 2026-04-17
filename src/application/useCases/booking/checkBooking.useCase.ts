import dayjs from "../../../shared/config/dayjs";
import { log } from "../../../shared/logger/logger";
import { CheckBookingInput } from "../../dtos/booking.dto";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";

export class CheckBookingUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository
    ) { }

    async execute(input: CheckBookingInput): Promise<boolean> {
        try {
            const { userId } = input;

            const booking = await this.bookingRepository.findOneByUserId(userId);
            console.log("booking : ", booking)
            if (!booking) {
                return false;
            }

            const isToday = dayjs(booking.createdAt).isSame(dayjs(), "day");
            console.log("isToday : ", isToday)
            if (
                isToday &&
                booking.paymentId &&
                booking.appointmentStatus === AppointmentStatus.BOOKED
            ) {
                return true;
            }

            return false;

        } catch (error) {
            log.error("CheckBookingUseCase failed : ", error as Error);
            throw error;
        }
    }
}
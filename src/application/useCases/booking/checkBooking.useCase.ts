import dayjs from "../../../shared/config/dayjs";
import { log } from "../../../shared/logger/logger";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { CheckBookingRequest } from "../../dtos/booking.dtos";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";

export class CheckBookingUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository
    ) { }

    async execute(payload: CheckBookingRequest): Promise<boolean> {
        try {
            const { userId } = payload;

            const booking = await this.bookingRepository.findOneByUserId(userId);
            console.log("booking : ",booking)
            if (!booking) {
                return false;
            }

            const isToday = dayjs(booking.createdAt).isSame(dayjs(), "day");
            console.log("isToday : ",isToday)
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
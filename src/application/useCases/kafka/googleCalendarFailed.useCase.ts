import { log } from "../../../shared/logger/logger";
import { GoogleCalendarCreateEventEventFailedInput } from "../../dtos/kafka.dto";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class GoogleCalendarCreateEventFailedUseCases {
    constructor(
        private readonly bookingRepository: IBookingRepository,
    ) { };

    async execute(input: GoogleCalendarCreateEventEventFailedInput): Promise<void> {
        try {
            const { bookingId, role } = input;

            const booking = await this.bookingRepository.findById(bookingId);
            if (!booking) return;

            if (booking.appointmentStatus === AppointmentStatus.CANCELLED) {
                return;
            };

            booking.createCalendarDataFailed({ role });

            await this.bookingRepository.update(booking);
        } catch (error) {
            log.error("GoogleCalendarCreateEventFailedUseCases error", error as Error);
        };
    };
};
import { log } from "../../../shared/logger/logger";
import { CreateGoogleCalendarEventFailedResult, EventEnvelope } from "../../dtos/kafka.dtos";
import { AppointmentStatus } from "../../../domain/enums/appointmentStatus.enum";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class GoogleCalendarFailedUseCases {
    constructor(
        private readonly bookingRepository: IBookingRepository,
    ) { };

    async execute(payload: EventEnvelope<CreateGoogleCalendarEventFailedResult>): Promise<void> {
        try {
            const { payload: { mbsData: { bookingId, role } } } = payload;

            const booking = await this.bookingRepository.findById(bookingId);
            if (!booking) return;

            if (booking.appointmentStatus === AppointmentStatus.CANCELLED) {
                return;
            };

            booking.createCalendarDataFailed({ role });

            await this.bookingRepository.update(booking);
        } catch (error) {
            log.error("GoogleCalendarFailedUseCases.execute error", error as Error);
        };
    };
};
import { log } from "../../../shared/logger/logger";
import { CalendarStatus } from "../../../domain/enums/common.enum";
import { GoogleCalendarCreateResultEvent } from "../../dtos/kafka.dtos";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class GoogleCalendarSuccessUseCases {
    constructor(
        private readonly bookingRepository: IBookingRepository
    ) { };

    async execute(payload: GoogleCalendarCreateResultEvent): Promise<void> {
        try {
            const { bookingId, user, provider } = payload;

            const booking = await this.bookingRepository.findById(bookingId);

            if (!booking || booking?.googleEventId) {
                return;
            } else {
                booking.createCalendarData({
                    user: user.eventId ? {
                        googleEventId: user.eventId,
                        calendarStatus: CalendarStatus.CREATED,
                    } : null,
                    provider: provider.eventId ? {
                        googleEventId: provider.eventId,
                        calendarStatus: CalendarStatus.CREATED,
                    } : null
                });
                await this.bookingRepository.update(booking);
            };
        } catch (error) {
            log.error("GoogleCalendarSuccessUseCases.execute error", error as Error);
        };
    };
};
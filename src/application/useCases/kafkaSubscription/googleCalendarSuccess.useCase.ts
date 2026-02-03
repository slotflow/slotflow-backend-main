import { log } from "../../../shared/logger/logger";
import { Role } from "../../../domain/enums/common.enum";
import { CreateGoogleCalendarEventSuccessResult } from "../../dtos/kafka.dtos";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class GoogleCalendarSuccessUseCases {
    constructor(
        private readonly bookingRepository: IBookingRepository
    ) { };

    async execute(payload: CreateGoogleCalendarEventSuccessResult): Promise<void> {
        try {
            const { bookingId, role, eventId } = payload;

            const booking = await this.bookingRepository.findById(bookingId);

            if (!booking) {
                return;
            } else {
                if (role === Role.USER && booking.calendarData.user.googleEventId) {
                    return;
                };
                if (role === Role.PROVIDER && booking.calendarData.provider.googleEventId) {
                    return;
                };
                booking.createCalendarDataSuccess({
                    eventId: eventId,
                    role: role,
                });
                await this.bookingRepository.update(booking);
            };
        } catch (error) {
            log.error("GoogleCalendarSuccessUseCases.execute error", error as Error);
        };
    };
};
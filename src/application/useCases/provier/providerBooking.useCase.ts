import { log } from "../../../shared/logger/logger";
import { ProviderChangeBookingAppoinmentStatusRequest } from "../../dtos/provider.dto";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";

export class ProviderChangeBookingAppointmentStatusUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
    ) { };

    async execute(payload: ProviderChangeBookingAppoinmentStatusRequest): Promise<void> {
        try {
            const { _id, appointmentStatus } = payload;

            const booking = await this.bookingRepository.findById(_id);
            if (!booking) throw new Error("No booking found");

            booking.updateAppointment({appointmentStatus});

            // TODO update event
            // const response = await this.updateEventFromGoogleCalendarService.execute({
            //     userId: booking.userId,
            //     eventId: booking.googleEventId,
            //     appointmentDate: booking.appointmentDate,
            //     appointmentStatus: appointmentStatus
            // });

            // if (!response.success) throw new Error("Booking status updating failed");

            await this.bookingRepository.update(booking);

        } catch (error) {
            log.error("ProviderChangeBookingAppointmentStatus failed", error as Error);
            throw error;
        };
    };
};
import { ApiResponse } from "../../dtos/common.dto";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { UpdateEventFromGoogleCalendarService } from "../../../infrastructure/services/googleCalendar";
import { ProviderChangeBookingAppoinmentStatusRequest } from "../../dtos/provider.dto";

export class ProviderChangeBookingAppointmentStatusUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
        private updateEventFromGoogleCalendarService: UpdateEventFromGoogleCalendarService
    ) { }

    async execute(payload: ProviderChangeBookingAppoinmentStatusRequest): Promise<ApiResponse> {
        try {
            const { _id, appointmentStatus } = payload;

            const booking = await this.bookingRepository.findBookingById(_id);
            if (!booking) throw new Error("No booking found");

            booking.appointmentStatus = appointmentStatus;
            booking.statusTrack.push({
                appointmentStatus: appointmentStatus,
                time: new Date(),
            });

            const response = await this.updateEventFromGoogleCalendarService.execute({
                userId: booking.userId,
                eventId: booking.googleEventId,
                appointmentDate: booking.appointmentDate,
                appointmentStatus: appointmentStatus
            });

            if (!response.success) throw new Error("Booking status updating failed");

            const updatedBooking = await this.bookingRepository.updateBooking(booking);
            if (!updatedBooking) throw new Error("Status updating failed");

            return { success: true, message: "Status updated successfully" };
        } catch (error) {
            console.log("ProviderChangeBookingAppointmentStatus error : ", error);
            throw new Error('Failed to update booking appointment status');
        }
    }
}
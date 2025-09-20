import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderChangeBookingAppoinmentStatusRequest } from "../../infrastructure/dtos/provider.dto";


export class ProviderChangeBookingAppointmentStatusUseCase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl
    ) { }

    async execute(payload: ProviderChangeBookingAppoinmentStatusRequest): Promise<ApiResponse> {
        try {
            const { _id, appointmentStatus } = payload;

            const booking = await this.bookingRepositoryImpl.findBookingById(_id);
            if(!booking) throw new Error("No booking found");

            booking.appointmentStatus = appointmentStatus;

            const updatedBooking = await this.bookingRepositoryImpl.updateBooking(booking);
            if(!updatedBooking) throw new Error("Status updating failed");

            return { success: true, message: "Status updated successfully" };
        } catch(error) {
            console.log("ProviderChangeBookingAppointmentStatus error : ",error);
            throw new Error('Status updating failed');
        }
    }
}
import { Validator } from "../../infrastructure/validator/validator";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ApiResponse, FetchBookingsRequest, FetchBookingsResponse } from "../../infrastructure/dtos/common.dto";
import { ProviderChangeBookingAppoinmentStatusRequest } from "../../infrastructure/dtos/provider.dto";


export class ProviderFetchBookingAppointmentsUseCase {
    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl,
        private bookingRepositoryImpl: BookingRepositoryImpl,
    ) { }

    async execute({ serviceProviderId, page, limit } : FetchBookingsRequest): Promise<ApiResponse<FetchBookingsResponse>> {

        if(!serviceProviderId) throw new Error("Invalid request");

        Validator.validateObjectId(serviceProviderId, "providerId");
        
        const provider = await this.providerRepositoryImpl.findProviderById(serviceProviderId);
        if(!provider) throw new Error("No user found");

        const result = await this.bookingRepositoryImpl.findAllBookings({page, limit, serviceProviderId});
        if(!result) throw new Error("Appointments fetching error");

        return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
    }
}


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
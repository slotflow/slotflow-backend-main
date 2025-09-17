import { Validator } from "../../infrastructure/validator/validator";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ApiResponse, FetchBookingsRequest, FetchBookingsResponse, FetchOnlineBookingsForProviderResponse, FetchOnlineBookingsForUserResponse } from "../../infrastructure/dtos/common.dto";

export class FetchBookingAppointmentsUseCase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl,
    ) { }

    async execute({ serviceProviderId, userId, page, limit, online, raw, role } : FetchBookingsRequest): Promise<ApiResponse<FetchBookingsResponse | FetchOnlineBookingsForProviderResponse | FetchOnlineBookingsForUserResponse>> {
        if(role === "PROVIDER") {
            if(!serviceProviderId) throw new Error("Invalid request");
            Validator.validateObjectId(serviceProviderId, "providerId");
        }
        if(role === "USER") {
            if(!userId) throw new Error("Invalid request");
            Validator.validateObjectId(userId, "userId");
        }
        Validator.validateBooleanValue(online, "Onnline filter");
        Validator.validateBooleanValue(raw, "Raw filter");

        const result = await this.bookingRepositoryImpl.findAllBookings({
            page, 
            limit, 
            serviceProviderId,
            userId, 
            online, 
            raw, 
            role
        });
        if(!result) throw new Error("Appointments fetching error");

        return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
    }
}
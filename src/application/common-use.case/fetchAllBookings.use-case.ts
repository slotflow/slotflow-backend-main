import { roleArray } from "../../utils/constants";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ApiResponse, FetchBookingsRequest, FetchBookingsResponse, FetchOnlineBookingsForProviderResponse, FetchOnlineBookingsForUserResponse } from "../../infrastructure/dtos/common.dto";

export class FetchBookingAppointmentsUseCase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl,
    ) { }

    async execute(payload: FetchBookingsRequest): Promise<ApiResponse<FetchBookingsResponse | FetchOnlineBookingsForProviderResponse | FetchOnlineBookingsForUserResponse>> {
        try {
            const { serviceProviderId, userId, page, limit, online, raw, role } = payload;
            if (role === roleArray[2]) {
                if (!serviceProviderId) throw new Error("Invalid request");
            }
            if (role === roleArray[1]) {
                if (!userId) throw new Error("Invalid request");
            }

            const result = await this.bookingRepositoryImpl.findAllBookings({
                page,
                limit,
                serviceProviderId,
                userId,
                online,
                raw,
                role
            });
            if (!result) throw new Error("Appointments fetching error");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("FetchBookingAppointmentsUseCase error : ", error);
            throw new Error("Failed to fetch appointment bookings");
        }
    }
}
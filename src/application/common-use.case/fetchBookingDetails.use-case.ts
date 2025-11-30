import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ApiResponse, FetchBookingDetailsRequest, FetchBookingDetailsResponse } from "../../infrastructure/dtos/common.dto";

export class FetchBookingDetailsUsecase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl,
    ) { }

    async execute(payload: FetchBookingDetailsRequest): Promise<ApiResponse<FetchBookingDetailsResponse>> {
        try {
            const { bookingId } = payload;

            const result = await this.bookingRepositoryImpl.findBookingDetails(bookingId);
            if (!result) throw new Error("Booking details fetching failed");

            return { success: true, message: "Booking details fetched", data: result };
        } catch (error) {
            console.log("FetchBookingDetailsUsecase error : ", error);
            throw new Error("Failed to fetch booking details");
        }
    }
}
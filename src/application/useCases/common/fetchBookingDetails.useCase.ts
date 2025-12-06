import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { ApiResponse, FetchBookingDetailsRequest, FetchBookingDetailsResponse } from "../../../infrastructure/dtos/common.dto";

export class FetchBookingDetailsUsecase {
    constructor(
        private bookingRepository: IBookingRepository,
    ) { }

    async execute(payload: FetchBookingDetailsRequest): Promise<ApiResponse<FetchBookingDetailsResponse>> {
        try {
            const { bookingId } = payload;

            const result = await this.bookingRepository.findBookingDetails(bookingId);
            if (!result) throw new Error("Booking details fetching failed");

            return { success: true, message: "Booking details fetched", data: result };
        } catch (error) {
            console.log("FetchBookingDetailsUsecase error : ", error);
            throw new Error("Failed to fetch booking details");
        }
    }
}
import { Types } from "mongoose";
import { Validator } from "../../infrastructure/validator/validator";
import { ApiResponse, FetchBookingDetailsResponse } from "../../infrastructure/dtos/common.dto";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";

export class FetchBookingDetailsUsecase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl,
    ) { }

    async execute(bookingId: Types.ObjectId): Promise<ApiResponse<FetchBookingDetailsResponse>> {

        if (!bookingId) throw new Error("Invalid request");
        Validator.validateObjectId(bookingId, "Booking Id");

        const result = await this.bookingRepositoryImpl.findBookingDetails(bookingId);
        if (!result) throw new Error("Booking details fetching failed");

        return { success: true, message: "Booking details fetched", data: result };
    }
}
import { log } from "../../../shared/logger/logger";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { FetchBookingDetailsRequest, FetchBookingDetailsResponse } from "../../dtos/common.dto";

export class FetchBookingDetailsUsecase {
    constructor(
        private bookingQueries: IBookingQueries,
    ) { };

    async execute(payload: FetchBookingDetailsRequest): Promise<FetchBookingDetailsResponse | null> {
        try {
            const { bookingId } = payload;

            const result = await this.bookingQueries.findDetails(bookingId);
            if(!result) return null;

            return result;
        } catch (error) {
            log.error("FetchBookingDetailsUsecase failed", error as Error);
            throw error;
        };
    };
};
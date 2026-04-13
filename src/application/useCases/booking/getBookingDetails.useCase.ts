import { log } from "../../../shared/logger/logger";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { GetBookingDetailsRequest, GetBookingDetailsResponse } from "../../dtos/common.dto";

export class GetBookingDetailsUsecase {
    constructor(
        private bookingQueries: IBookingQueries,
    ) { };

    async execute(payload: GetBookingDetailsRequest): Promise<GetBookingDetailsResponse | null> {
        try {
            const { bookingId } = payload;

            const result = await this.bookingQueries.findDetails(bookingId);
            if (!result) return null;

            return result;
        } catch (error) {
            log.error("GetBookingDetailsUsecase failed", error as Error);
            throw error;
        };
    };
};
import { log } from "../../../shared/logger/logger";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { GetBookingDetailsInput, GetBookingDetailsOutput } from "../../dtos/booking.dto";

export class GetBookingDetailsUsecase {
    constructor(
        private readonly bookingQueries: IBookingQueries,
    ) { };

    async execute(input: GetBookingDetailsInput): Promise<GetBookingDetailsOutput | null> {
        try {
            const { bookingId } = input;

            const result = await this.bookingQueries.findDetails({ bookingId });
            if (!result) return null;

            return result;
        } catch (error) {
            log.error("GetBookingDetailsUsecase failed", error as Error);
            throw error;
        };
    };
};
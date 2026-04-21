import { BadRequestError } from "../../../shared/error/appError";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetBookingDetailsInput, GetBookingDetailsOutput } from "../../dtos/booking.dto";

export class GetBookingDetailsUsecase {
    constructor(
        private readonly bookingQueries: IBookingQueries,
    ) { };

    async execute(input: GetBookingDetailsInput): Promise<GetBookingDetailsOutput | null> {
        try {
            const { bookingId } = input;
            if (!bookingId) {
                throw new BadRequestError();
            }

            const result = await this.bookingQueries.findDetails({ bookingId });
            if (!result) return null;

            return result;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get booking details");
        };
    };
};
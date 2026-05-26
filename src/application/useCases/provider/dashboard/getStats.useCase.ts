import { IBookingQueries } from "../../../queries/IBooking.queries";
import { BadRequestError } from "../../../../shared/error/appError";
import { toAppError } from "../../../../shared/error/handleUnknownError";
import { GetProviderStatsInput, GetProviderStatsOutput } from "../../../dtos/provider.dto";

export class GetProviderStatsUseCase {
    constructor(
        private bookingQueries: IBookingQueries,
    ) { };

    async execute(input: GetProviderStatsInput): Promise<GetProviderStatsOutput> {
        try {
            const { providerId } = input;
            if (!providerId) {
                throw new BadRequestError();
            }

            const [
                bookingStatsArray,
            ] = await Promise.all([
                this.bookingQueries.findStatsDataForProviderDashboard(input),
            ]);

            return { ...bookingStatsArray };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get stats");
        };
    };
};
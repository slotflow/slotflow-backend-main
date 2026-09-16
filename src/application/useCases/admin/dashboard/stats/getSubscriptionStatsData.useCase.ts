import { toAppError } from "../../../../../shared/error/handleUnknownError";
import { ISubscriptionQueries } from "../../../../queries/ISubscription.queries";
import { GetSubscriptionStatsDataInput, GetSubscriptionStatsDataOutput } from "../../../../dtos/admin.dto";

export class GetSubscriptionStatsDataUseCase {
    constructor(
        private subscriptionQueries: ISubscriptionQueries
    ) { };

    async execute(input: GetSubscriptionStatsDataInput): Promise<GetSubscriptionStatsDataOutput> {
        try {
            return await this.subscriptionQueries.findStatsForAdminDashboard(input);
        } catch (error: unknown) {
            throw toAppError(error, "Failed to fetch subscription data");
        };
    };
};
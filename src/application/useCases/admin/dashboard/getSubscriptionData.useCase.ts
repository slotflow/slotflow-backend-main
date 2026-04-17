import { log } from "../../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../../queries/ISubscription.queries";
import { GetSubscriptionDataInput, GetSubscriptionDataOutput } from "../../../dtos/subscription.dto";

export class GetSubscriptionDataUseCase {
    constructor(
        private subscriptionQueries: ISubscriptionQueries
    ) { };

    async execute(input: GetSubscriptionDataInput): Promise<GetSubscriptionDataOutput> {
        try {
            return await this.subscriptionQueries.findStatsForAdminDashboard(input);
        } catch (error) {
            log.error("GetSubscriptionDataUseCase failed", error as Error);
            throw error;
        };
    };
};
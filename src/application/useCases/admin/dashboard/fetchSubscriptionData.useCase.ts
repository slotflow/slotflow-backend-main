import { log } from "../../../../shared/logger/logger";
import { FetchSubscriptionDataResponse } from "../../../dtos/admin.dto";
import { ISubscriptionQueries } from "../../../queries/ISubscription.queries";

export class FetchSubscriptionDataUseCase {
    constructor(
        private subscriptionQueries: ISubscriptionQueries
    ) { };

    async execute(): Promise<FetchSubscriptionDataResponse> {
        try {
            return await this.subscriptionQueries.findStatsForAdminDashboard();
        } catch (error) {
            log.error("FetchSubscriptionDataUseCase failed", error as Error);
            throw error;
        };
    };
};
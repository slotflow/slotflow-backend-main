import { log } from "../../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../../queries/ISubscription.queries";
import { FetchSubscriptionDataRequest, FetchSubscriptionDataResponse } from "../../../dtos/admin.dto";

export class FetchSubscriptionDataUseCase {
    constructor(
        private subscriptionQueries: ISubscriptionQueries
    ) { };

    async execute(payload: FetchSubscriptionDataRequest): Promise<FetchSubscriptionDataResponse> {
        try {
            return await this.subscriptionQueries.findStatsForAdminDashboard(payload);
        } catch (error) {
            log.error("FetchSubscriptionDataUseCase failed", error as Error);
            throw error;
        };
    };
};
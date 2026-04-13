import { log } from "../../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../../queries/ISubscription.queries";
import { GetSubscriptionDataRequest, GetSubscriptionDataResponse } from "../../../dtos/admin.dto";

export class GetSubscriptionDataUseCase {
    constructor(
        private subscriptionQueries: ISubscriptionQueries
    ) { };

    async execute(payload: GetSubscriptionDataRequest): Promise<GetSubscriptionDataResponse> {
        try {
            return await this.subscriptionQueries.findStatsForAdminDashboard(payload);
        } catch (error) {
            log.error("GetSubscriptionDataUseCase failed", error as Error);
            throw error;
        };
    };
};
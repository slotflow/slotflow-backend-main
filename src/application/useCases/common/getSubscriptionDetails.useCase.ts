import { log } from "../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
import { GetSubscriptionDetailsRequest, GetSubscriptionDetailsResponse } from "../../dtos/common.dto";

export class GetSubscriptionDetailsUseCase {
    constructor(
        private subscirptionQueries: ISubscriptionQueries
    ) { };

    async execute(payload: GetSubscriptionDetailsRequest): Promise<GetSubscriptionDetailsResponse | null> {
        try {
            const { subscriptionId } = payload;
            const subscriptionDetails = await this.subscirptionQueries.findDetails(subscriptionId);
            if (!subscriptionDetails) return null;
            return subscriptionDetails;
        } catch (error) {
            log.error("GetSubscriptionDetailsUseCase failed", error as Error);
            throw error;
        };
    };
};
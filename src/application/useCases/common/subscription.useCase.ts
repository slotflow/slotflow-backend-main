import { log } from "../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
import { FetchSubscriptionDetailsRequest, FetchSubscriptionDetailsResponse } from "../../dtos/common.dto";

export class FetchSubscriptionDetailsUseCase {
    constructor(
        private subscirptionQueries: ISubscriptionQueries
    ) { };

    async execute(payload: FetchSubscriptionDetailsRequest): Promise<FetchSubscriptionDetailsResponse> {
        try {
            const { subscriptionId } = payload;
            const subscriptionDetails = await this.subscirptionQueries.findDetails(subscriptionId);
            if (!subscriptionDetails) return null;
            return subscriptionDetails;
        } catch (error) {
            log.error("FetchSubscriptionDetailsUseCase failed", error as Error);
            throw error;
        };
    };

}
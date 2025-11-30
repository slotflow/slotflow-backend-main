import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";
import { FetchSubscriptionDetailsRequest, FetchSubscriptionDetailsResponse } from "../../infrastructure/dtos/common.dto";

export class FetchSubscriptionDetailsUseCase {
    constructor(
        private subscriptionRepositoryImpl: SubscriptionRepositoryImpl,
    ) { }

    async execute(payload: FetchSubscriptionDetailsRequest): Promise<FetchSubscriptionDetailsResponse> {
        try {
            const { subscriptionId } = payload;

            const subscriptionDetails = await this.subscriptionRepositoryImpl.findSubscriptionFullDetails(subscriptionId);
            if (Object.keys(subscriptionDetails).length === 0) return { success: true, message: "Subscription details not found.", subscriptionDetails: {} };
            return { success: true, message: "Subscription details fetched successfully.", subscriptionDetails };
        } catch (error) {
            console.log("FetchSubscriptionDetailsUseCase error : ", error);
            throw new Error("Failed to fetch subscription details");
        }
    }
}
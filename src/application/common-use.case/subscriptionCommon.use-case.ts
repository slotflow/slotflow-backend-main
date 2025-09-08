import { Validator } from "../../infrastructure/validator/validator";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";
import { FetchSubscriptionDetailsRequest, FetchSubscriptionDetailsResponse } from "../../infrastructure/dtos/common.dto";

export class FetchSubscriptionDetailsUseCase {
    constructor(
        private subscriptionRepositoryImpl: SubscriptionRepositoryImpl,
    ) { }

    async execute(data: FetchSubscriptionDetailsRequest): Promise<FetchSubscriptionDetailsResponse> {
        const { subscriptionId } = data;
        if(!subscriptionId) throw new Error("Invalid request.");
        
        Validator.validateObjectId(subscriptionId, "subscriptionId");

        const subscriptionDetails = await this.subscriptionRepositoryImpl.findSubscriptionFullDetails(subscriptionId);
        if (Object.keys(subscriptionDetails).length === 0) return { success: true, message: "Subscription details not found.", subscriptionDetails : {}};
        return { success: true, message: "Subscription details fetched successfully.", subscriptionDetails};
    }
}
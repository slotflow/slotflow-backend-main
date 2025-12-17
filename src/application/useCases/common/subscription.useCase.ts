import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { FetchSubscriptionDetailsRequest, FetchSubscriptionDetailsResponse } from "../../dtos/common.dto";

export class FetchSubscriptionDetailsUseCase {
    constructor(
        private subscriptionRepository: ISubscriptionRepository,
    ) { }

    async execute(payload: FetchSubscriptionDetailsRequest): Promise<FetchSubscriptionDetailsResponse> {
        try {
            const { subscriptionId } = payload;

            const subscriptionDetails = await this.subscriptionRepository.findSubscriptionFullDetails(subscriptionId);
            if (Object.keys(subscriptionDetails).length === 0) return { success: true, message: "Subscription details not found.", subscriptionDetails: {} };
            return { success: true, message: "Subscription details fetched successfully.", subscriptionDetails };
        } catch (error) {
            console.log("FetchSubscriptionDetailsUseCase error : ", error);
            throw new Error("Failed to fetch subscription details");
        }
    }
}
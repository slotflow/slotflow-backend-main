import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";

export class UpdateSubscriptionStatusUseCase {
    constructor(
        private subscriptionRepositoryImpl: SubscriptionRepositoryImpl
    ) { }

    async execute(): Promise<boolean> {
        try {
            const updatedSubscriptions = await this.subscriptionRepositoryImpl.findSubscriptionsForUpdatinStatus();
            return updatedSubscriptions;
        } catch (error) {
            console.log("UpdateSubscriptionStatusUseCase error : ", error);
            throw new Error("Failed to update subscription status");
        }
    }
}
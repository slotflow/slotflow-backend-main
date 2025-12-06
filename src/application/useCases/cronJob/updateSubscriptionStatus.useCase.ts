import { SubscriptionRepositoryImpl } from "../../../infrastructure/database/subscription/subscription.repository.impl";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

export class UpdateSubscriptionStatusUseCase {
    constructor(
        private subscriptionRepository: ISubscriptionRepository
    ) { }

    async execute(): Promise<boolean> {
        try {
            const updatedSubscriptions = await this.subscriptionRepository.findSubscriptionsForUpdatinStatus();
            return updatedSubscriptions;
        } catch (error) {
            console.log("UpdateSubscriptionStatusUseCase error : ", error);
            throw new Error("Failed to update subscription status");
        }
    }
}
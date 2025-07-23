import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";

export class UpdateSubscriptionStatusUseCase {
    constructor(
        private subscriptionRepositoryImpl: SubscriptionRepositoryImpl
    ) {}

    async execute(): Promise<boolean> {
        const updatedSubscriptions = await  this.subscriptionRepositoryImpl.findSbuscriptionsForUpdatinStatus();
        return updatedSubscriptions;
    }
}
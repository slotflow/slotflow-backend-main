import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";

export class UpdateSubscriptionStatusCronUseCase {
    constructor(
        private subscriptionRepositoryImpl: SubscriptionRepositoryImpl,
    ) { }

    async execute(): Promise<any> {
        try {
            const todaysExhaustedSubscriptions = await this.subscriptionRepositoryImpl.findTodaysBookingForCronjob();
            return todaysExhaustedSubscriptions;
        } catch {
            return false
        }
    }
}
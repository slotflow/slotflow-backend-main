import { log } from "../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";

export class UpdateSubscriptionStatusUseCase {
    constructor(
        private subscriptionQuerie: ISubscriptionQueries,
    ) { };

    async execute(): Promise<boolean> {
        try {
            const updatedSubscriptions = await this.subscriptionQuerie.findSubscriptionsForUpdatinStatus();
            return updatedSubscriptions;
        } catch (error) {
            log.error("UpdateSubscriptionStatusUseCase failed", error as Error);
            throw error;
        };
    };
};
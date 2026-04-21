import { toAppError } from "../../../shared/error/handleUnknownError";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";

export class UpdateSubscriptionStatusUseCase {
    constructor(
        private subscriptionQuerie: ISubscriptionQueries,
    ) { };

    async execute(): Promise<boolean> {
        try {
            const updatedSubscriptions = await this.subscriptionQuerie.findSubscriptionsForUpdatinStatus();
            return updatedSubscriptions;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to update subscription status");
        };
    };
};
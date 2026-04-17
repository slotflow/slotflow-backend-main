import { log } from "../../../shared/logger/logger";
import { GetSubscriptionDetailsInput, GetSubscriptionDetailsOutput } from "../../dtos/subscription.dto";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";

export class GetSubscriptionDetailsUseCase {
    constructor(
        private subscirptionQueries: ISubscriptionQueries
    ) { };

    async execute(input: GetSubscriptionDetailsInput): Promise<GetSubscriptionDetailsOutput | null> {
        try {
            const { subscriptionId } = input;
            const subscriptionDetails = await this.subscirptionQueries.findDetails({ subscriptionId });
            if (!subscriptionDetails) return null;
            return subscriptionDetails;
        } catch (error) {
            log.error("GetSubscriptionDetailsUseCase failed", error as Error);
            throw error;
        };
    };
};
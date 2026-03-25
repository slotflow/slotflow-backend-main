import { log } from "../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
import { GetSubscribedPlanRequest, GetSubscribedPlanResponse } from "../../dtos/subscription";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class GetSubscribedPlanUseCase {
    constructor(
        private readonly providerRepository: IProviderRepository,
        private readonly subscriptionQueries: ISubscriptionQueries
    ) { };

    async execute(payload: GetSubscribedPlanRequest): Promise<GetSubscribedPlanResponse> {
        console.log("Provider fetching subscription");
        const { providerId } = payload;
        try {
            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("Invalid request.");
            if (!provider.subscription.length) throw new Error("No subscription found.");

            const result = await this.subscriptionQueries.findMySubscritpion(provider.subscription.at(-1)!);
            if (!result) throw new Error("No subscription found.");

            return {
                providerId,
                subscribedPlan: result.subscribedPlan,
                startDate: result.startDate,
                endDate: result.endDate,
                subscriptionStatus: result.subscriptionStatus
            };
        } catch (error) {
            log.error("GetSubscribedPlanUseCase failed", error as Error);
            throw error;
        };
    };
};
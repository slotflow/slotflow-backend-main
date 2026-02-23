import { log } from "../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ProviderFetchSubscribedPlanRequest, ProviderFetchSubscribedPlanResponse } from "../../dtos/provider.dto";

export class ProviderFetchSubscribedPlanUseCase {
    constructor(
        private readonly providerRepository: IProviderRepository,
        private readonly subscriptionQueries: ISubscriptionQueries
    ) { };

    async execute(payload: ProviderFetchSubscribedPlanRequest): Promise<ProviderFetchSubscribedPlanResponse> {
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
            log.error("ProviderFetchAllSubscriptionsUseCase failed", error as Error);
            throw error;
        };
    };
};
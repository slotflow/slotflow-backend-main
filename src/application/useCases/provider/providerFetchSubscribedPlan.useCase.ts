import { log } from "../../../shared/logger/logger";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { FetchProviderSubscribedPlanRequest, FetchProviderSubscribedPlanResponse } from "../../dtos/provider.dto";

export class ProviderFetchSubscribedPlanUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private planRepository: IPlanRepository
    ) { };

    async execute(payload: FetchProviderSubscribedPlanRequest): Promise<FetchProviderSubscribedPlanResponse> {
        try {
            const { providerId } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("Invalid request.");
            if (!provider.subscription.length) throw new Error("No subscription found.");

            const subscription = await this.subscriptionRepository.findById(provider.subscription.at(-1)!);
            if (!subscription) throw new Error("No subscription found.");

            const plan = await this.planRepository.findById(subscription.subscriptionPlanId);
            if (!plan) throw new Error("No subscription found.");

            return {
                planName: plan.planName,
            };
        } catch (error) {
            log.error("ProviderFetchAllSubscriptionsUseCase failed", error as Error);
            throw error;
        };
    };
};
import { log } from "../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
import { GetSubscribedPlanRequest, GetSubscribedPlanResponse } from "../../dtos/subscription";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class GetSubscribedPlanUseCase {
    constructor(
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly subscriptionQueries: ISubscriptionQueries
    ) { };

    async execute(payload: GetSubscribedPlanRequest): Promise<GetSubscribedPlanResponse> {
        const { providerId } = payload;
        try {
            const providerProfile = await this.providerProfileRepository.findById(providerId);
            if (!providerProfile) throw new Error("Profile not found.");
            if (!providerProfile.subscription.length) throw new Error("No subscription found.");

            const result = await this.subscriptionQueries.findMySubscritpion(providerProfile.subscription.at(-1)!);
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
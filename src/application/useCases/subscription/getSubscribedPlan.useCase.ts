import { log } from "../../../shared/logger/logger";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";
import { GetSubscribedPlanInput, GetSubscribedPlanOutput } from "../../dtos/subscription";

export class GetSubscribedPlanUseCase {
    constructor(
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly subscriptionQueries: ISubscriptionQueries
    ) { };

    async execute(input: GetSubscribedPlanInput): Promise<GetSubscribedPlanOutput> {
        try {
            const { providerId } = input;
            const providerProfile = await this.providerProfileRepository.findById(providerId);
            if (!providerProfile) throw new Error("Profile not found.");
            if (!providerProfile.subscription.length) throw new Error("No subscription found.");

            const result = await this.subscriptionQueries.findMySubscritpion({ subscriptionId: providerProfile.subscription.at(-1)! });
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
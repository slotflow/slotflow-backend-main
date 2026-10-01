import { ERROR_CODES } from "../../../shared/utils/types/enums";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ISubscriptionQueries } from "../../interfaces/queries/ISubscription.queries";
import { BadRequestError, NotFoundError } from "../../../shared/error/appError";
import { GetSubscribedPlanInput, GetSubscribedPlanOutput } from "../../dtos/subscription.dto";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class GetSubscribedPlanUseCase {
    constructor(
        private readonly providerProfileRepository: IProviderProfileRepository,
        private readonly subscriptionQueries: ISubscriptionQueries
    ) { };

    async execute(input: GetSubscribedPlanInput): Promise<GetSubscribedPlanOutput> {
        try {
            const { providerId } = input;
            if (!providerId) {
                throw new BadRequestError();
            }

            const providerProfile = await this.providerProfileRepository.findByUserId(providerId);
            if (!providerProfile) {
                throw new NotFoundError(
                    "Profile not found.",
                    ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
                );
            }

            if (!providerProfile.subscriptions.length) {
                throw new NotFoundError(
                    "Subsctiption not found.",
                    ERROR_CODES.SUBSCRIPTION_NOT_FOUND
                );
            }

            const result = await this.subscriptionQueries.findMySubscritpion({ subscriptionId: providerProfile.subscriptions.at(-1)! });
            if (!result) {
                throw new NotFoundError(
                    "Subsctiption not found.",
                    ERROR_CODES.SUBSCRIPTION_NOT_FOUND
                );
            }

            return {
                providerId,
                subscribedPlan: result.subscribedPlan,
                currentPeriodStart: result.currentPeriodStart,
                currentPeriodEnd: result.currentPeriodEnd,
                subscriptionStatus: result.subscriptionStatus
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get subscribed plan");
        };
    };
};
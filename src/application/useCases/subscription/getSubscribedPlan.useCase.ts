import { ERROR_CODES } from "../../../shared/utils/types";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ISubscriptionQueries } from "../../queries/ISubscription.queries";
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

            const providerProfile = await this.providerProfileRepository.findById(providerId);
            if (!providerProfile) {
                throw new NotFoundError(
                    "Profile not found.",
                    ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
                );
            }
            if (!providerProfile.subscription.length) {
                throw new NotFoundError(
                    "Subsctiption not found.",
                    ERROR_CODES.SUBSCRIPTION_NOT_FOUND
                );
            }

            const result = await this.subscriptionQueries.findMySubscritpion({ subscriptionId: providerProfile.subscription.at(-1)! });
            if (!result) {
                throw new NotFoundError(
                    "Subsctiption not found.",
                    ERROR_CODES.SUBSCRIPTION_NOT_FOUND
                );
            }

            return {
                providerId,
                subscribedPlan: result.subscribedPlan,
                startDate: result.startDate,
                endDate: result.endDate,
                subscriptionStatus: result.subscriptionStatus
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get subscribed plan");
        };
    };
};
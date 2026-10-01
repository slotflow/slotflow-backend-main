import { ERROR_CODES } from '../../../shared/utils/types/enums';
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, NotFoundError } from "../../../shared/error/appError";
import { ProviderSubscriptionPaymentFailedEventInput } from "../../dtos/kafka.dto";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

export class UpdateSubscriptionAfterPaymentFailedUseCase {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository,
    ) { };

    async execute(input: ProviderSubscriptionPaymentFailedEventInput): Promise<void> {
        try {
            const {
                subscriptionId,
            } = input;


            const subscription = await this.subscriptionRepository.findById(subscriptionId);
            if (!subscription) {
                throw new NotFoundError(
                    "Subscription not found",
                    ERROR_CODES.SUBSCRIPTION_NOT_FOUND
                );
            }

            subscription.subscriptionPaymentFailed();

            const updatedSubscription = await this.subscriptionRepository.update(subscription);
            if (!updatedSubscription) {
                throw new AppError(
                    'Internal server error',
                    500,
                    true,
                    ERROR_CODES.INTERNAL_ERROR
                )
            }

        } catch (error) {
            throw toAppError(error, "Failed to update subscription");
        }
    };
};

import { log } from "../../../shared/logger/logger";
import { EventEnvelope } from "../../dtos/kafka.dtos";
import { getDateAfterDays, getNumberOfMonths } from "../../../shared/utils/dateTime";
import { ProviderCreatePaymentSuccessEventResult } from "../../dtos/common.dto";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

export class UpdateSubscriptionAfterPaymentSuccessUseCase {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly providerRepository: IProviderRepository
    ) { };

    async execute(payload: EventEnvelope<ProviderCreatePaymentSuccessEventResult>) {
        try {
            const {
                payload: {
                    mbsData: {
                        subscriptionId,
                        paymentId,
                        planDuration,
                        providerId
                    }
                }
            } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            provider.pushSubscriptionId(subscriptionId);
            await this.providerRepository.update(provider);

            const subscription = await this.subscriptionRepository.findById(subscriptionId);
            if (!subscription) throw new Error("Subscription not found.");

            subscription.subscriptionPaymentSuccess({
                paymentId,
                startDate: new Date(),
                endDate: getDateAfterDays(getNumberOfMonths(planDuration)),
            });
            await this.subscriptionRepository.update(subscription);
        } catch (error) {
            log.error("UpdateSubscriptionAfterPaymentSuccessUseCase failed", error as Error);
        };
    };
};

import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { log } from "../../../shared/logger/logger";
import { getDateAfterDays } from "../../../shared/utils/dateTime";
import { ProviderCreatePaymentSuccessEvent } from "../../dtos/kafka.dtos";

export class UpdateSubscriptionAfterPaymentSuccessUseCase {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository
    ) { };

    async execute(payload: ProviderCreatePaymentSuccessEvent) {
        try {
            const { subscriptionId, paymentId, planDuration } = payload;

            const subscription = await this.subscriptionRepository.findById(subscriptionId);
            if(!subscription) return;

            subscription.subscriptionPaymentSusccess({
                paymentId,
                startDate: new Date(),
                endDate: getDateAfterDays(planDuration),
            });
            await this.subscriptionRepository.update(subscription);
        } catch (error) {
            log.error("UpdateSubscriptionAfterPaymentSuccessUseCase failed", error as Error);
        };
    };
};
    
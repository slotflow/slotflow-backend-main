import { log } from "../../../shared/logger/logger";
import { EventEnvelope } from "../../dtos/kafka.dtos";
import { ProviderCreatePaymentFailedEventResult } from "../../dtos/common.dto";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

export class UpdateSubscriptionAfterPaymentFailedUseCase {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository
    ) { };

    async execute(payload: EventEnvelope<ProviderCreatePaymentFailedEventResult>) {
        try {
            const { payload: { 
                mbsData: { 
                    subscriptionId 
                } 
            } 
        } = payload;

            const subscription = await this.subscriptionRepository.findById(subscriptionId);
            if (!subscription) return;

            subscription.subscriptionPaymentFailed();
            await this.subscriptionRepository.update(subscription);
        } catch (error) {
            log.error("UpdateSubscriptionAfterPaymentFailedUseCase failed", error as Error);
        };
    };
};
    
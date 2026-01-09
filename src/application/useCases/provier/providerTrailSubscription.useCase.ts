import dayjs from "dayjs";
// import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { PlanName } from "../../../domain/enums/planName.enum";
import { ProviderTrialSubscriptionRequest } from "../../dtos/provider.dto";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { SubscriptionStatus } from "../../../domain/enums/subscriptionStatus.enum";
// import { IKafkaService } from "../../../domain/interfaces/services/IKafka.service";
import { SubscriptionValidity } from "../../../domain/enums/subscriptionValidity.enum";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

export class ProviderTrialSubscriptionUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private planRepository: IPlanRepository,
        // private kafkaService: IKafkaService
    ) { };

    async execute(payload: ProviderTrialSubscriptionRequest): Promise<void> {
        try {
            const { providerId } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");
            
            const providerSubscriptions = provider.subscription;
            if (providerSubscriptions.length > 0) {
                const providerLastSubscriptionId = providerSubscriptions.pop();
                const subscription = await this.subscriptionRepository.findById(providerLastSubscriptionId!);
                const isSubscriptionExpired = dayjs().isAfter(dayjs(subscription?.endDate), "day");
                if (!isSubscriptionExpired) throw new Error("Your current subscription is on live.");
            };
            
            const trialPlan = await this.planRepository.findByNameOrPrice("TRIAL", 0);
            if (!trialPlan) throw new Error("No trial plan found.");
            
            const trialPlanId = trialPlan._id;
            const checkTrialIsAlreadyUsed = providerSubscriptions.includes(trialPlanId);
            if (checkTrialIsAlreadyUsed) throw new Error("You have already used the free trial, please go for the paid plan.");
            
            const subscriptionData = Subscription.create({
                providerId,
                subscriptionPlanId: trialPlanId,
                startDate: new Date(),
                endDate: dayjs().add(Number(7), "day").toDate(),
                subscriptionStatus: SubscriptionStatus.Active,
            });

            const subscription = await this.subscriptionRepository.create(subscriptionData);
            if (!subscription) throw new Error("Trial plan activating error.");

            provider.activateSubscription(subscription._id);
            const updatedProvider = await this.providerRepository.update(provider);
            if (!updatedProvider) throw new Error("Trail plan activating error.");

            const startDate = new Date();
            const endDate = dayjs(startDate).add(SubscriptionValidity.SevenDays, "day");

            // await this.kafkaService.send({
            //     topic: kafkaConfig.topics.confirmSubscription,
            //     key: provider.email,
            //     message: {
            //         name: provider.username,
            //         email: provider.email,
            //         subscription: PlanName.Trial,
            //         duration: SubscriptionValidity.SevenDays,
            //         startDate,
            //         endDate,
            //         contentNumber: 1
            //     },
            // });

        } catch (error) {
            log.error("ProviderTrialSubscriptionUseCase failed", error as Error);
            throw error;
        };
    };
};
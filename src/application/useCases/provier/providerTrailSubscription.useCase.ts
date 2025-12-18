import dayjs from "dayjs";
import { Types } from "mongoose";
import { ApiResponse } from "../../dtos/common.dto";
import { subscriptionStatusArray } from "../../../shared/utils/constants";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { ProviderTrialSubscriptionRequest } from "../../dtos/provider.dto";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

export class ProviderTrialSubscriptionUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private planRepository: IPlanRepository,
    ) { }

    async execute(payload: ProviderTrialSubscriptionRequest): Promise<ApiResponse> {
        try {
            const { providerId } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            const providerSubscriptions = provider.subscription;
            if (providerSubscriptions.length > 0) {
                const providerLastSubscriptionId = providerSubscriptions.pop();
                const subscription = await this.subscriptionRepository.findSubscriptionById(new Types.ObjectId(providerLastSubscriptionId));
                const isSubscriptionExpired = dayjs().isAfter(dayjs(subscription?.endDate), "day");
                if (!isSubscriptionExpired) throw new Error("Your current subscription is on live.");
            }

            const trialPlan = await this.planRepository.findPlanByNameOrPrice({ planName: "TRIAL", price: 0 })
            if (!trialPlan) throw new Error("No trial plan found.");

            const trialPlanId = trialPlan._id;
            const checkTrialIsAlreadyUsed = providerSubscriptions.includes(trialPlanId);
            if (checkTrialIsAlreadyUsed) throw new Error("You have already used the free trial, please go for the paid plan.");

            const subscription = await this.subscriptionRepository.createSubscription({
                providerId: new Types.ObjectId(providerId),
                subscriptionPlanId: new Types.ObjectId(trialPlanId),
                startDate: new Date(),
                endDate: dayjs().add(Number(7), "day").toDate(),
                subscriptionStatus: subscriptionStatusArray[0],
                paymentId: null
            });

            if (!subscription) throw new Error("Trial plan activating error.");

            provider.activateSubscription(subscription._id);
            const updatedProvider = await this.providerRepository.update(provider);

            if (!updatedProvider) throw new Error("Trail plan activating error.");

            return { success: true, message: "Your trial plan is on live." };
        } catch (error) {
            console.log("ProviderTrialSubscriptionUseCase error : ", error);
            throw new Error("Failed to save trial subscription");
        }
    }
}
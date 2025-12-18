import dayjs from "dayjs";
import { startSession, Types } from "mongoose";
import {
    ProviderSaveSubscriptionRequest,
    ProviderSaveSubscriptionResponse,
    ProviderStripeSubscriptionCreateSessionIdRequest,
    ProviderStripeSubscriptionCreateSessionIdResponse,
} from "../../dtos/provider.dto";
import { stripe } from "../../../infrastructure/lib/stripe";
import { ApiResponse } from "../../dtos/common.dto";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";
import { paymentForArray, paymentGatewayArray, subscriptionStatusArray } from "../../../shared/utils/constants";

export class ProviderStripeSubscriptionCreateSessionIdUseCase {
    constructor(
        private planRepository: IPlanRepository,
        private providerRepository: IProviderRepository,
        private subscriptionRepository: ISubscriptionRepository,
    ) { }

    async execute(payload: ProviderStripeSubscriptionCreateSessionIdRequest): Promise<ApiResponse<ProviderStripeSubscriptionCreateSessionIdResponse>> {
        try {
            const { providerId, planId, duration } = payload;

            let planDuration: number = parseInt(duration.trim().split(" ")[0]);

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("No user found, please logout and try again.");

            const plan = await this.planRepository.findPlanById(planId);
            if (!plan) throw new Error("Unexpected error, please try again after sometimes.");

            const providerLastSubscriptionsId = provider.subscription.pop();

            if (providerLastSubscriptionsId) {
                const subscription = await this.subscriptionRepository.findSubscriptionById(providerLastSubscriptionsId!);
                if (subscription) {
                    if (subscription.subscriptionStatus === "Active") throw new Error("Your subscription is on live.");
                    const isSubscriptionExpired = dayjs().isAfter(dayjs(subscription.endDate), "day");
                    if (!isSubscriptionExpired) throw new Error("Your subscription is on live.");
                }
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                line_items: [{
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: plan.planName,
                            description: plan.description,
                        },
                        unit_amount: plan.price * planDuration * 100,
                    },
                    quantity: 1
                }],
                success_url: `http://localhost:5173/provider/payment-success/?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `http://localhost:5173/provider/payment-failed/`,
                metadata: {
                    planName: plan.planName,
                    providerId: providerId.toString(),
                    planId: planId.toString(),
                    planDuration: planDuration,
                    initialAmount: plan.price * planDuration * 100,
                    totalAmount: plan.price * planDuration * 100,
                }
            });
            return { success: true, message: "Session id generated.", data: session.id };
        } catch (error) {
            console.log("ProviderStripeSubscriptionCreateSessionIdUseCase error : ", error);
            throw new Error("Failed to subscribe");
        }
    }
}

export class ProviderSaveSubscriptionUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private paymentRepository: IPaymentRepository,
        private subscriptionRepository: ISubscriptionRepository,
    ) { }

    async execute(payload: ProviderSaveSubscriptionRequest): Promise<ApiResponse<ProviderSaveSubscriptionResponse>> {
        try {
            const { providerId, sessionId } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            const session = await stripe.checkout.sessions.retrieve(sessionId);

            const pId = session?.metadata?.providerId;
            const planName = session?.metadata?.planName;
            const totalAmount = Number(session?.metadata?.totalAmount);
            const initialAmount = Number(session?.metadata?.initialAmount);
            const paymentStatus = session?.payment_status === "paid" ? "Paid" : "Pending";
            const paymentType = session?.payment_method_types[0];
            const subscriptionPlanId = session?.metadata?.planId;
            const planDuration = Number(session?.metadata?.planDuration);
            const paymentIntent = session?.payment_intent;

            if (!pId || isNaN(totalAmount) || isNaN(initialAmount) || !paymentStatus || !paymentType || !subscriptionPlanId || !planDuration || !paymentIntent) throw new Error("Unexpected error, please try again.");

            const mongoSession = await startSession();
            mongoSession.startTransaction();
            try {

                const payment = await this.paymentRepository.createPaymentForSubscription({
                    transactionId: paymentIntent.toString(),
                    paymentStatus: paymentStatus,
                    paymentMethod: paymentType,
                    paymentGateway: paymentGatewayArray[0],
                    paymentFor: paymentForArray[0],
                    initialAmount: Number(initialAmount) / 100,
                    discountAmount: 0,
                    totalAmount: Number(totalAmount) / 100,
                    providerId: new Types.ObjectId(pId),
                }, { session: mongoSession });

                if (!payment) throw new Error("Unexpected error, payment saving error.");

                const subscription = await this.subscriptionRepository.createSubscription({
                    providerId: new Types.ObjectId(pId),
                    subscriptionPlanId: new Types.ObjectId(subscriptionPlanId),
                    startDate: new Date(),
                    endDate: dayjs().add(Number(planDuration * 30), "day").toDate(),
                    subscriptionStatus: subscriptionStatusArray[0],
                    paymentId: payment._id,
                }, { session: mongoSession });

                if (!subscription) throw new Error("Subscription saving error.");

                provider.addSubscription(subscription._id);

                const updatedProvider = await this.providerRepository.update(provider);
                if (!updatedProvider) throw new Error("Unexpected error, subscription adding error.");

                await mongoSession.commitTransaction();
                mongoSession.endSession();

                return { success: true, message: "Your Subscription has been activated.", data: { planName } };
            } catch (error) {
                await mongoSession.abortTransaction();
                mongoSession.endSession();
                throw new Error("Subscribing error."+error);
            }
        } catch (error) {
            console.log("ProviderSaveSubscriptionUseCase error : ", error);
            throw new Error("Failed to save subscription");
        }
    }
}
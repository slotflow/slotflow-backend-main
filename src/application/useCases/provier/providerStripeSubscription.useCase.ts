import dayjs from "dayjs";
import {
    ProviderSaveSubscriptionRequest,
    ProviderSaveSubscriptionResponse,
    ProviderStripeSubscriptionCreateSessionIdRequest,
    ProviderStripeSubscriptionCreateSessionIdResponse,
} from "../../dtos/provider.dto";
import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { stripe } from "../../../infrastructure/lib/stripe";
import { PlanName } from "../../../domain/enums/planName.enum";
import { Payment } from "../../../domain/entities/payment.entity";
import { PaymentFor } from "../../../domain/enums/paymentFor.enum";
import { PaymentMethod } from "../../../domain/enums/paymentMethod.enum";
import { PaymentStatus } from "../../../domain/enums/paymentStatus.enum";
import { PaymentGateway } from "../../../domain/enums/paymentGateway.enum";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { SubscriptionStatus } from "../../../domain/enums/subscriptionStatus.enum";
import { IKafkaService } from "../../../domain/interfaces/services/IKafka.service";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

// TODO can make the payment another service

export class ProviderStripeSubscriptionCreateSessionIdUseCase {
    constructor(
        private planRepository: IPlanRepository,
        private providerRepository: IProviderRepository,
        private subscriptionRepository: ISubscriptionRepository,
    ) { };

    async execute(payload: ProviderStripeSubscriptionCreateSessionIdRequest): Promise<ProviderStripeSubscriptionCreateSessionIdResponse> {
        try {
            const { providerId, planId, duration } = payload;

            let planDuration: number = duration / 30;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("No user found, please logout and try again.");

            const plan = await this.planRepository.findById(planId);
            if (!plan) throw new Error("Unexpected error, please try again after sometimes.");

            const providerLastSubscriptionsId = provider.subscription.pop();

            if (providerLastSubscriptionsId) {
                const subscription = await this.subscriptionRepository.findById(providerLastSubscriptionsId!);
                if (subscription) {
                    if (subscription.subscriptionStatus === SubscriptionStatus.Active) throw new Error("Your subscription is on live.");
                    const isSubscriptionExpired = dayjs().isAfter(dayjs(subscription.endDate), "day");
                    if (!isSubscriptionExpired) throw new Error("Your current subscription is on live.");
                };
            };

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
                },
            });
            return session.id;
        } catch (error) {
            log.error("ProviderStripeSubscriptionCreateSessionIdUseCase failed", error as Error);
            throw error;
        };
    };
};

export class ProviderSaveSubscriptionUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private paymentRepository: IPaymentRepository,
        private subscriptionRepository: ISubscriptionRepository,
        private kafkaService: IKafkaService
    ) { };

    async execute(payload: ProviderSaveSubscriptionRequest): Promise<ProviderSaveSubscriptionResponse> {
        try {
            const { providerId, sessionId } = payload;

            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("User not found.");

            const session = await stripe.checkout.sessions.retrieve(sessionId);

            const pId = session?.metadata?.providerId;
            const planName = session?.metadata?.planName as PlanName;
            const totalAmount = Number(session?.metadata?.totalAmount);
            const initialAmount = Number(session?.metadata?.initialAmount);
            const paymentStatus = session?.payment_status === "paid" ? PaymentStatus.Paid : PaymentStatus.Pending;
            const paymentMethod = session?.payment_method_types[0] as PaymentMethod;
            const subscriptionPlanId = session?.metadata?.planId;
            const planDuration = Number(session?.metadata?.planDuration);
            const paymentIntent = session?.payment_intent;

            if (!pId || isNaN(totalAmount) || isNaN(initialAmount) || !paymentStatus || !paymentMethod || !subscriptionPlanId || !planDuration || !paymentIntent || !planName) throw new Error("Unexpected error, please try again.");

            try {

                const paymentData = Payment.createforSubscription({
                    transactionId: paymentIntent.toString(),
                    paymentStatus: paymentStatus,
                    paymentMethod: paymentMethod,
                    paymentGateway: PaymentGateway.Stripe,
                    paymentFor: PaymentFor.ProviderSubscription,
                    initialAmount: Number(initialAmount) / 100,
                    discountAmount: 0,
                    totalAmount: Number(totalAmount) / 100,
                    providerId: pId,
                });

                const payment = await this.paymentRepository.create(paymentData);
                if (!payment) throw new Error("Unexpected error, payment saving error.");

                const subscriptionData = Subscription.create({
                    providerId: pId,
                    subscriptionPlanId: subscriptionPlanId,
                    startDate: new Date(),
                    endDate: dayjs().add(Number(planDuration * 30), "day").toDate(),
                    subscriptionStatus: SubscriptionStatus.Active,
                    paymentId: payment._id,
                });

                const subscription = await this.subscriptionRepository.create(subscriptionData);
                if (!subscription) throw new Error("Subscription saving error.");

                provider.activateSubscription(subscription._id);

                const updatedProvider = await this.providerRepository.update(provider);
                if (!updatedProvider) throw new Error("Unexpected error, subscription adding error.");

                const startDate = new Date();
                const endDate = dayjs(startDate).add(planDuration * 30, "day");

                await this.kafkaService.send({
                    topic: kafkaConfig.topics.confirmSubscription,
                    key: provider.email,
                    message: {
                        name: provider.username,
                        email: provider.email,
                        subscription: planName,
                        duration: planDuration,
                        startDate,
                        endDate,
                        contentNumber: 1
                    },
                });

                return { planName };
            } catch (error) {
                throw error;
            };
        } catch (error) {
            log.error("ProviderSaveSubscriptionUseCase failed", error as Error);
            throw error;
        };
    };
};
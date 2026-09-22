import { kafkaProducer } from "../../infrastructure/messaging";
import { paymentServiceClient } from "../../infrastructure/clients";
import { subscriptionQueries } from "../../infrastructure/queries";
import { GetSubscriptionsUseCase } from "../../application/useCases/subscription/getSubscriptions.useCase";
import { GetSubscribedPlanUseCase } from "../../application/useCases/subscription/getSubscribedPlan.useCase";
import { SubscriptionCheckoutUseCase } from "../../application/useCases/subscription/subscriptionCheckout.useCase";
import { GetSubscriptionDetailsUseCase } from "../../application/useCases/subscription/getSubscriptionDetails.useCase";
import { planRepository, providerProfileRepository, subscriptionRepository, userRepository } from "../../infrastructure/repository";

export const getSubscriptionsUseCase = new GetSubscriptionsUseCase(subscriptionQueries);

export const getSubscriptionDetailsUseCase = new GetSubscriptionDetailsUseCase(subscriptionQueries);

export const subscriptionCheckoutUseCase = new SubscriptionCheckoutUseCase(planRepository, providerProfileRepository, subscriptionRepository, paymentServiceClient);

export const getSubscribedPlanUseCase = new GetSubscribedPlanUseCase(providerProfileRepository, subscriptionQueries);
import { kafkaProducer } from "../../infrastructure/messaging";
import { paymentServiceClient } from "../../infrastructure/clients";
import { subscriptionQueries } from "../../infrastructure/queriesImpls";
import { GetSubscriptionsUseCase } from "../../application/useCases/subscription/getSubscriptions.useCase";
import { TrialSubscriptionUseCase } from "../../application/useCases/subscription/trailSubscription.useCase";
import { GetSubscribedPlanUseCase } from "../../application/useCases/subscription/getSubscribedPlan.useCase";
import { SubscriptionCheckoutUseCase } from "../../application/useCases/subscription/subscriptionCheckout.useCase";
import { GetSubscriptionDetailsUseCase } from "../../application/useCases/subscription/getSubscriptionDetails.useCase";
import { planRepository, providerProfileRepository, subscriptionRepository, userRepository } from "../../infrastructure/repositoryImpls";

export const getSubscriptionsUseCase = new GetSubscriptionsUseCase(subscriptionQueries);

export const getSubscriptionDetailsUseCase = new GetSubscriptionDetailsUseCase(subscriptionQueries);

export const trialSubscriptionUseCase = new TrialSubscriptionUseCase(userRepository, providerProfileRepository, subscriptionRepository, planRepository, kafkaProducer);

export const subscriptionCheckoutUseCase = new SubscriptionCheckoutUseCase(planRepository, userRepository, providerProfileRepository, subscriptionRepository, paymentServiceClient);

export const getSubscribedPlanUseCase = new GetSubscribedPlanUseCase(providerProfileRepository, subscriptionQueries);
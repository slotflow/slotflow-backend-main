import { subscriptionQueries } from "../../infrastructure/queriesImpls";
import { GetSubscriptionDetailsUseCase } from "../../application/useCases/subscription/getSubscriptionDetails.useCase";
import { GetSubscriptionsUseCase } from "../../application/useCases/subscription/getSubscriptions.useCase";
import { TrialSubscriptionUseCase } from "../../application/useCases/subscription/trailSubscription.useCase";
import { SubscriptionCheckoutUseCase } from "../../application/useCases/subscription/subscriptionCheckout.useCase";
import { GetSubscribedPlanUseCase } from "../../application/useCases/subscription/getSubscribedPlan.useCase";
import { planRepository, providerRepository, subscriptionRepository } from "../../infrastructure/repositoryImpls";
import { kafkaProducer } from "../../infrastructure/messaging";
import { paymentServiceClient } from "../../infrastructure/clients";

export const getSubscriptionsUseCase = new GetSubscriptionsUseCase(subscriptionQueries);

export const getSubscriptionDetailsUseCase = new GetSubscriptionDetailsUseCase(subscriptionQueries);

export const trialSubscriptionUseCase = new TrialSubscriptionUseCase(providerRepository, subscriptionRepository, planRepository, kafkaProducer);

export const subscriptionCheckoutUseCase = new SubscriptionCheckoutUseCase(planRepository, providerRepository, subscriptionRepository, paymentServiceClient);

export const getSubscribedPlanUseCase = new GetSubscribedPlanUseCase(providerRepository, subscriptionQueries);
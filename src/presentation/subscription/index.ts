import { subscriptionQueries } from "../../infrastructure/queriesImpls";
import { GetSubscriptionDetailsUseCase } from "../../application/useCases/subscription/getSubscriptionDetails.useCase";
import { GetSubscriptionsUseCase } from "../../application/useCases/subscription/getSubscriptions.useCase";

//
export const getSubscriptionsUseCase = new GetSubscriptionsUseCase(subscriptionQueries);
// provider subscription controller dependency injection
export const getSubscriptionDetailsUseCase = new GetSubscriptionDetailsUseCase(subscriptionQueries);
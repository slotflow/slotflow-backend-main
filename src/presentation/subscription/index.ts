import { subscriptionQueries } from "../../infrastructure/queriesImpls";
import { GetSubscriptionDetailsUseCase } from "../../application/useCases/common/getSubscriptionDetails.useCase";
import { GetSubscriptionsUseCase } from "../../application/useCases/common/getSubscriptions.useCase";

//
export const getSubscriptionsUseCase = new GetSubscriptionsUseCase(subscriptionQueries);
// provider subscription controller dependency injection
export const getSubscriptionDetailsUseCase = new GetSubscriptionDetailsUseCase(subscriptionQueries);
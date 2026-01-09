import { SubscriptionMappingImpl } from "./subscriptionMapping";
import { ISubscriptionMapping } from "../../domain/interfaces/helper/ISubscriptionMapping.helper";

// subscription mapping helper instance
export const subscriptionMapping: ISubscriptionMapping = new SubscriptionMappingImpl();
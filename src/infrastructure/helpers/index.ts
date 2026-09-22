import { SubscriptionMappingImpl } from "./subscriptionMapping.helper.impl";
import { ISubscriptionMapping } from "../../application/interfaces/helper/ISubscriptionMapping.helper";

// subscription mapping helper instance
export const subscriptionMapping: ISubscriptionMapping = new SubscriptionMappingImpl();
import { SubscriptionPlan } from "../../application/dtos/common.dto";
import { ISubscriptionMapping } from "../../domain/interfaces/helper/ISubscriptionMapping.helper";

export class SubscriptionMappingImpl implements ISubscriptionMapping {
  getLevel(plan?: SubscriptionPlan): number {
    if (!plan || plan === "NoSubscription" || plan === "Free") return 0;

    switch (plan) {
      case "Starter":
        return 1;
      case "Professional":
        return 2;
      case "Enterprise":
        return 3;
      default:
        return 0;
    }
  }
}
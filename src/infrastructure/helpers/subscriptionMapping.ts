import { SubscriptionPlan } from "../dtos/common.dto";

export class SubscriptionHelper {
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
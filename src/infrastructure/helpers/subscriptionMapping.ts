import { PlanName } from "../../domain/enums/planName.enum";
import { ISubscriptionMapping } from "../../domain/interfaces/helper/ISubscriptionMapping.helper";

export class SubscriptionMappingImpl implements ISubscriptionMapping {
  getLevel(plan?: PlanName): number {
    if (!plan || plan === PlanName.NoSubscription || plan === PlanName.Trial) return 0;

    switch (plan) {
      case PlanName.Starter:
        return 1;
      case PlanName.Professional:
        return 2;
      case PlanName.Enterprise:
        return 3;
      default:
        return 0;
    }
  }
}
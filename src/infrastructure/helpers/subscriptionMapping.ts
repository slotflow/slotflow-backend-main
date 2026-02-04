import { PlanName } from "../../domain/enums/plan.enum";
import { ISubscriptionMapping } from "../../domain/interfaces/helper/ISubscriptionMapping.helper";

export class SubscriptionMappingImpl implements ISubscriptionMapping {
  getLevel(plan?: PlanName): number {
    if (!plan || plan === PlanName.NO_SUBSCRIPTION || plan === PlanName.TRIAL) return 0;

    switch (plan) {
      case PlanName.STARTER:
        return 1;
      case PlanName.PROFESSIONAL:
        return 2;
      case PlanName.ENTERPRISE:
        return 3;
      default:
        return 0;
    }
  }
}
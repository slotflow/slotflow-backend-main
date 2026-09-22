import { PlanName } from "../../../domain/enums/plan.enum";

export interface ISubscriptionMapping {

    getLevel(plan?: PlanName): number;

}
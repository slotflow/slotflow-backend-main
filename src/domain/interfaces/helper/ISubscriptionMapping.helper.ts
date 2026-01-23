import { PlanName } from "../../enums/plan.enum";

export interface ISubscriptionMapping {

    getLevel(plan?: PlanName): number;

}
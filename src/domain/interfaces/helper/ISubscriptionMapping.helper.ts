import { PlanName } from "../../enums/planName.enum";

export interface ISubscriptionMapping {

    getLevel(plan?: PlanName): number;
    
}
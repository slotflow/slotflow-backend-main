import { SubscriptionPlan } from "../../../infrastructure/dtos/common.dto";

export interface ISubscriptionMapping {

    getLevel(plan?: SubscriptionPlan): number;
    
}
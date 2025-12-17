import { SubscriptionPlan } from "../../../application/dtos/common.dto";

export interface ISubscriptionMapping {

    getLevel(plan?: SubscriptionPlan): number;
    
}
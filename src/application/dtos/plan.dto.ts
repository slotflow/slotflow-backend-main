import { ApiPaginationInput, PlanDTO } from "./common.dto";

//// **** plan dtos **** ////

/**
 * CreatePlan usecase input and output
 */
export type CreatePlanInput = Pick<PlanDTO, "planName" | "description" | "monthlyPrice" | "yearlyPrice" | "features" | "maxBookingPerMonth" | "adVisibility" | "hasTrial" | "trialDays">;
export type CreatePlanOutput = Omit<PlanDTO, "createdAt" | "updatedAt">;


/**
 * GetPlans usecase input and output
 */
export interface GetPlansInput extends ApiPaginationInput {
    isProvider: boolean;
}
export type GetPlansOutput = Array<Pick<PlanDTO, "_id" | "planName" | "isBlocked" | "monthlyPrice" | "yearlyPrice">> & Partial<Pick<PlanDTO, "maxBookingPerMonth" | "adVisibility" | "features" | "description" | "stripeSync">>;


/**
 * ChangePlanBlockStatus usecase input and output
 */
export type ChangePlanBlockStatusInput = ChangePlanBlockStatusOutput;
export type ChangePlanBlockStatusOutput = {
    planId: PlanDTO["_id"];
    isBlocked: PlanDTO["isBlocked"];
};


/**
 * ProviderGetPlans usecase output
 */
export type ProviderGetPlansOutput = Array<Pick<PlanDTO, "_id" | "planName" | "monthlyPrice" | "yearlyPrice" | "features" | "description">> | [];


/**
 * ResyncPlanStripe usecase input and output
 */
export type ResyncStripePlanInput = {
    planId: PlanDTO["_id"];
};
export type ResyncStripePlanOutput = {
    planId: PlanDTO["_id"];
    stripePlanDetails: PlanDTO["stripePlanDetails"];
    stripeSync: PlanDTO["stripeSync"];
};


/**
 * GetPlanDetails usecase input and output
 */
export type GetPlanDetailsInput = {
    planId: PlanDTO["_id"];
};
export type GetPlanDetailsOutput = Omit<PlanDTO, "createdAt" | "updatedAt">;


/**
 * UpdatePlan usecase input and output
 */
export type UpdatePlanInput = Partial<Pick<
  PlanDTO,
  | 'planName'
  | 'description'
  | 'monthlyPrice'
  | 'yearlyPrice'
  | 'features'
  | 'maxBookingPerMonth'
  | 'adVisibility'
  | 'hasTrial'
  | 'trialDays'
>> & {
  planId: PlanDTO["_id"];
}
export type UpdatePlanOutput = Omit<PlanDTO, "createdAt" | "updatedAt">;
import { PlanDTO } from "./common.dto";

// type for create plan
export type CreatePlanInput = Pick<PlanDTO, "planName" | "description" | "price" | "features" | "maxBookingPerMonth" | "adVisibility">;

// type for get plans
export type GetPlansOutput = Array<Pick<PlanDTO, "_id" | "planName" | "isBlocked" | "price" | "maxBookingPerMonth" | "adVisibility">>;

// type for change plan block status
export type ChangePlanBlockStatusOutput = {
    planId: PlanDTO["_id"];
    isBlocked: PlanDTO["isBlocked"];
};

// type for change plan block status
export type ChangePlanBlockStatusInput = ChangePlanBlockStatusOutput;

// type for provider get plans
export type ProviderGetPlansOutput = Array<Pick<PlanDTO, "_id" | "planName" | "price" | "features" | "description">> | [];

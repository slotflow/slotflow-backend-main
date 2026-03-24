import { PlanDTO } from "./common.dto";

// type for create plan
export type CreatePlanRequest = Pick<PlanDTO, "planName" | "description" | "price" | "features" | "maxBookingPerMonth" | "adVisibility">;

// type for get plans
export type GetPlansResponse = Array<Pick<PlanDTO, "_id" | "planName" | "isBlocked" | "price" | "maxBookingPerMonth" | "adVisibility">>;

// type for change plan block status
export type ChangePlanBlockStatusResponse = {
    planId: PlanDTO["_id"];
    isBlocked: PlanDTO["isBlocked"];
};

// type for change plan block status
export type ChangePlanBlockStatusRequest = ChangePlanBlockStatusResponse;

// type for provider get plans
export type ProviderGetPlansResponse = Array<Pick<PlanDTO, "_id" | "planName" | "price" | "features" | "description">> | [];

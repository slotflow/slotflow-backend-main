import { PlanDTO } from "./common.dto";

//// **** plan dtos **** ////

// CreatePlan usecase input
export type CreatePlanInput = Pick<PlanDTO, "planName" | "description" | "price" | "features" | "maxBookingPerMonth" | "adVisibility">;

// GetPlans usecase output
export type GetPlansOutput = Array<Pick<PlanDTO, "_id" | "planName" | "isBlocked" | "price" | "maxBookingPerMonth" | "adVisibility">>;

// ChangePlanBlockStatus usecase output
export type ChangePlanBlockStatusOutput = {
    planId: PlanDTO["_id"];
    isBlocked: PlanDTO["isBlocked"];
};

// ChangePlanBlockStatus usecase input
export type ChangePlanBlockStatusInput = ChangePlanBlockStatusOutput;

// ProviderGetPlans usecase output
export type ProviderGetPlansOutput = Array<Pick<PlanDTO, "_id" | "planName" | "price" | "features" | "description">> | [];

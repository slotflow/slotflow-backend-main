import { ApiPaginationInput, PlanDTO, StripePlanDetailsDTO } from "./common.dto";

/**
 * Plan usecase dtos
 */

// Create plan
export type CreatePlanInput = Pick<PlanDTO, "planName" | "description" | "monthlyPrice" | "yearlyPrice" | "features" | "maxBookingPerMonth" | "adVisibility" | "hasTrial" | "trialDays">;
export type CreatePlanOutput = Omit<PlanDTO, "createdAt" | "updatedAt">;


// Get plans ( by admin )
export interface GetPlansInput extends ApiPaginationInput {
  isProvider: boolean;
}
export type GetPlansOutput = Array<Pick<PlanDTO, "_id" | "planName" | "isBlocked" | "monthlyPrice" | "yearlyPrice">> & Partial<Pick<PlanDTO, "maxBookingPerMonth" | "adVisibility" | "features" | "description" | "stripeSync">>;


// Change plan block status
export type ChangePlanBlockStatusInput = {
  planId: PlanDTO['_id'];
} & Pick<PlanDTO, "isBlocked">;
export type ChangePlanBlockStatusOutput = Pick<PlanDTO, "_id" | "isBlocked">;


// Get plans ( by provider )
export type ProviderGetPlansOutput = Array<Pick<PlanDTO, "_id" | "planName" | "monthlyPrice" | "yearlyPrice" | "features" | "description">> | [];


// Resync plan with stripe
export type ResyncStripePlanInput = {
  planId: PlanDTO["_id"];
};
export type ResyncStripePlanOutput = Pick<PlanDTO, "_id" | "stripePlanDetails" | "stripeSync">;


// Get plan details
export type GetPlanDetailsInput = {
  planId: PlanDTO["_id"];
};
export type GetPlanDetailsOutput = Omit<PlanDTO, "createdAt" | "updatedAt">;


// Update plan
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





/**
 * Stripe plan service dtos
 */

export type CreateStripePlanInput = Pick<
  PlanDTO,
  | "planName"
  | "description"
  | "monthlyPrice"
  | "yearlyPrice"
  | "features"
  | "maxBookingPerMonth"
>;

export type CreateStripePlanOutput = StripePlanDetailsDTO;

export type UpdateStripePlanInput = Partial<
  Pick<
    PlanDTO,
    | "planName"
    | "description"
    | "features"
    | "maxBookingPerMonth"
  >
> & {
  productId: StripePlanDetailsDTO["productId"];
  monthlyPrice?: {
    amount: PlanDTO["monthlyPrice"];
    oldPriceId?: StripePlanDetailsDTO["monthlyPriceId"];
  };
  yearlyPrice?: {
    amount: PlanDTO["yearlyPrice"];
    oldPriceId?: StripePlanDetailsDTO["yearlyPriceId"];
  };
};

export type UpdateStripePlanOutput = {
  productId: StripePlanDetailsDTO["productId"];
  monthlyPriceId?: StripePlanDetailsDTO["monthlyPriceId"];
  yearlyPriceId?: StripePlanDetailsDTO["yearlyPriceId"];
};
import { ApiPaginationInput } from "./common.dto";
import { PlanProps } from "../../domain/contracts/plan.contract";
import { StripePlanDetails } from "../../domain/commands/plan.commands";

/**
 * Plan usecase dtos
 */

// Create plan
export type CreatePlanInput = Pick<
  PlanProps,
  | "planName"
  | "description"
  | "monthlyPrice"
  | "yearlyPrice"
  | "features"
  | "maxBookingPerMonth"
  | "adVisibility"
  | "hasTrial"
  | "trialDays"
>;
export type CreatePlanOutput = Omit<PlanProps, "createdAt" | "updatedAt">;

// Get plans ( by admin )
export interface GetPlansInput extends ApiPaginationInput {
  isProvider: boolean;
}
export type GetPlansOutput = Array<
  Pick<PlanProps, "_id" | "planName" | "isBlocked" | "monthlyPrice" | "yearlyPrice">
> &
  Partial<
    Pick<
      PlanProps,
      "maxBookingPerMonth" | "adVisibility" | "features" | "description" | "stripeSync"
    >
  >;

// Change plan block status
export type ChangePlanBlockStatusInput = {
  planId: PlanProps["_id"];
} & Pick<PlanProps, "isBlocked">;
export type ChangePlanBlockStatusOutput = Pick<PlanProps, "_id" | "isBlocked">;

// Get plans ( by provider )
export type ProviderGetPlansOutput =
  | Array<
      Pick<
        PlanProps,
        "_id" | "planName" | "monthlyPrice" | "yearlyPrice" | "features" | "description"
      >
    >
  | [];

// Resync plan with stripe
export type ResyncStripePlanInput = {
  planId: PlanProps["_id"];
};
export type ResyncStripePlanOutput = Pick<PlanProps, "_id" | "stripePlanDetails" | "stripeSync">;

// Get plan details
export type GetPlanDetailsInput = {
  planId: PlanProps["_id"];
};
export type GetPlanDetailsOutput = Omit<PlanProps, "createdAt" | "updatedAt">;

// Update plan
export type UpdatePlanInput = Partial<
  Pick<
    PlanProps,
    | "planName"
    | "description"
    | "monthlyPrice"
    | "yearlyPrice"
    | "features"
    | "maxBookingPerMonth"
    | "adVisibility"
    | "hasTrial"
    | "trialDays"
  >
> & {
  planId: PlanProps["_id"];
};
export type UpdatePlanOutput = Omit<PlanProps, "createdAt" | "updatedAt">;

/**
 * Stripe plan service dtos
 */

// Create stripe plan
export type CreateStripePlanInput = Pick<
  PlanProps,
  "planName" | "description" | "monthlyPrice" | "yearlyPrice" | "features" | "maxBookingPerMonth"
>;
export type CreateStripePlanOutput = StripePlanDetails;

// Update stripe plan
export type UpdateStripePlanInput = Partial<
  Pick<PlanProps, "planName" | "description" | "features" | "maxBookingPerMonth">
> & {
  productId: StripePlanDetails["productId"];
  monthlyPrice?: {
    amount: PlanProps["monthlyPrice"];
    oldPriceId?: StripePlanDetails["monthlyPriceId"];
  };
  yearlyPrice?: {
    amount: PlanProps["yearlyPrice"];
    oldPriceId?: StripePlanDetails["yearlyPriceId"];
  };
};
export type UpdateStripePlanOutput = {
  productId: StripePlanDetails["productId"];
  monthlyPriceId?: StripePlanDetails["monthlyPriceId"];
  yearlyPriceId?: StripePlanDetails["yearlyPriceId"];
};

import { PlanProps } from "../contracts/plan.contract";

export interface StripePlanDetails {
    productId: string;
    monthlyPriceId: string;
    yearlyPriceId: string;
}

export type CreatePlanProps = Omit<PlanProps, "_id" | "createdAt" | "updatedAt" | "isBlocked" | "stripePlanDetails" | "stripeSync">;

export type UpdatePlanProps = Partial<Omit<PlanProps, "_id" | "createdAt" | "updatedAt">>;
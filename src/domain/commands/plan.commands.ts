import { PlanProps } from "../contracts/plan.contract";

export type CreatePlanProps = Omit<PlanProps, "_id" | "createdAt" | "updatedAt" | "isBlocked" | "stripePlanDetails" | "stripeSync">;

export type UpdatePlanProps = Partial<Omit<PlanProps, "_id" | "createdAt" | "updatedAt">>;
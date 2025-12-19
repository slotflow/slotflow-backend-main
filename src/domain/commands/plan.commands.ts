import { PlanProps } from "../contracts/plan.contract";

export type CreatePlanProps = Omit<PlanProps, "_id" | "createdAt" | "updatedAt">;

export type UpdatePlanProps = Omit<PlanProps, "_id" | "createdAt" | "updatedAt">;
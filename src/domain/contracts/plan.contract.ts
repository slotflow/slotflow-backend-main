import { StripePlanDetails } from "../commands/plan.commands";
import { PlanName, StripeSyncStatus } from "../enums/plan.enum";

export interface PlanProps {
  _id: string;
  planName: PlanName;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  maxBookingPerMonth: number;
  adVisibility: boolean;
  isBlocked: boolean;
  stripePlanDetails: StripePlanDetails | null;
  stripeSync: StripeSyncStatus;
  hasTrial: boolean;
  trialDays: number;
  createdAt: Date;
  updatedAt: Date;
}

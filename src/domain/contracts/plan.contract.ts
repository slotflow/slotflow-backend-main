import { PlanName } from "../enums/plan.enum";

export interface StripePlanDetails {
    productId: string;
    monthlyPriceId: string;
    yearlyPriceId: string;
}

export enum StripeSyncStatus {
    PENDING = "pending",
    SYNCED = "synced",
}

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
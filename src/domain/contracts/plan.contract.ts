import { PlanName } from "../enums/planName.enum";

export interface PlanProps {
    _id: string,
    planName: PlanName,
    description: string,
    price: number,
    features: string[],
    maxBookingPerMonth: number,
    adVisibility: boolean,
    isBlocked: boolean,
    createdAt: Date,
    updatedAt: Date,
}
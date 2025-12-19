export interface PlanProps {
    _id: string,
    planName: string,
    description: string,
    price: number,
    features: string[],
    maxBookingPerMonth: number,
    adVisibility: boolean,
    isBlocked: boolean,
    createdAt: Date,
    updatedAt: Date,
}
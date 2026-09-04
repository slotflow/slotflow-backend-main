import { PlanProps, StripePlanDetails } from "../../contracts/plan.contract";

export type CreateStripePlanInput = Pick<
    PlanProps,
    | "planName"
    | "description"
    | "monthlyPrice"
    | "yearlyPrice"
    | "features"
    | "maxBookingPerMonth"
>;

export type CreateStripePlanOutput = StripePlanDetails;

export type UpdateStripePlanInput = Partial<
    Pick<
        PlanProps,
        | "planName"
        | "description"
        | "features"
        | "maxBookingPerMonth"
    >
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

export interface IStripePlanService {
    createPlan(params: CreateStripePlanInput): Promise<CreateStripePlanOutput>;
    updatePlan(params: UpdateStripePlanInput): Promise<UpdateStripePlanOutput>;
}

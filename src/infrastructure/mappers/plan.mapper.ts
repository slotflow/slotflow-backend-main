import { IPlan } from "../models/plan.model";
import { Plan } from "../../domain/entities/plan.entity";

export class PlanMapper {

    static toDomain(doc: IPlan): Plan {
        return new Plan({
            _id: doc._id.toString(),
            adVisibility: doc.adVisibility,
            description: doc.description,
            features: doc.features,
            isBlocked: doc.isBlocked,
            maxBookingPerMonth: doc.maxBookingPerMonth,
            planName: doc.planName,
            monthlyPrice: doc.monthlyPrice,
            yearlyPrice: doc.yearlyPrice,
            stripePlanDetails: doc.stripePlanDetails,
            stripeSync: doc.stripeSync,
            hasTrial: doc.hasTrial,
            trialDays: doc.trialDays,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    static toPersistence(entity: Plan) {
        const props = entity.getProps();

        return {
            adVisibility: props.adVisibility,
            description: props.description,
            features: props.features,
            isBlocked: props.isBlocked,
            maxBookingPerMonth: props.maxBookingPerMonth,
            planName: props.planName,
            monthlyPrice: props.monthlyPrice,
            yearlyPrice: props.yearlyPrice,
            stripePlanDetails: props.stripePlanDetails,
            stripeSync: props.stripeSync,
            hasTrial: props.hasTrial,
            trialDays: props.trialDays,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt
        };
    }
}

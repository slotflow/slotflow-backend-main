import { IPlan } from "../database/plan/plan.model";
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
            price: doc.price,
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
            price: props.price,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt
        };
    }
}

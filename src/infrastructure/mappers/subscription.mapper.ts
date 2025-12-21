import { Types } from "mongoose";
import { Subscription } from "../../domain/entities/subscription.entity";
import { ISubscription } from "../database/subscription/subscription.model";

export class SubscriptionMapper {

    static toDomain(doc: ISubscription): Subscription {
        return new Subscription({
            _id: doc._id.toString(),
            endDate: doc.endDate,
            paymentId: doc.paymentId.toString(),
            providerId: doc.providerId.toString(),
            startDate: doc.startDate,
            subscriptionPlanId: doc.subscriptionPlanId.toString(),
            subscriptionStatus: doc.subscriptionStatus,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static toPersistence(entity: Subscription) {
        const props = entity.getProps();

        return {
            endDate: props.endDate,
            paymentId: new Types.ObjectId(props.paymentId),
            providerId: new Types.ObjectId(props.providerId),
            startDate: props.startDate,
            subscriptionPlanId: new Types.ObjectId(props.subscriptionPlanId),
            subscriptionStatus: props.subscriptionStatus,
            updatedAt: props.updatedAt,
        };
    }
}

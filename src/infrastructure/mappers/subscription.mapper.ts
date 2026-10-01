import { Types } from "mongoose";
import { ISubscription } from "../models/subscription.model";
import { Subscription } from "../../domain/entities/subscription.entity";

export class SubscriptionMapper {
  static toDomain(doc: ISubscription): Subscription {
    return new Subscription({
      _id: doc._id.toString(),
      providerId: doc.providerId.toString(),
      subscribedPlanId: doc.subscribedPlanId.toString(),
      currentPeriodStart: doc.currentPeriodStart,
      currentPeriodEnd: doc.currentPeriodEnd,
      subscriptionStatus: doc.subscriptionStatus,
      cancelAtPeriodEnd: doc.cancelAtPeriodEnd,
      cancelAt: doc.cancelAt,
      lastEventAt: doc.lastEventAt,
      paymentId: doc.paymentId ? doc.paymentId.toString() : null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(entity: Subscription) {
    const props = entity.getProps();

    return {
      providerId: new Types.ObjectId(props.providerId),
      subscribedPlanId: new Types.ObjectId(props.subscribedPlanId),
      currentPeriodStart: props.currentPeriodStart,
      currentPeriodEnd: props.currentPeriodEnd,
      subscriptionStatus: props.subscriptionStatus,
      cancelAtPeriodEnd: props.cancelAtPeriodEnd,
      cancelAt: props.cancelAt,
      lastEventAt: props.lastEventAt,
      paymentId: props.paymentId ? new Types.ObjectId(props.paymentId) : null,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
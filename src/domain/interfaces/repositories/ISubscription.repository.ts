import { ClientSession } from "mongoose";
import { Subscription } from "../../entities/subscription.entity";

export interface ISubscriptionRepository {

    create(subscription: Subscription, session?: ClientSession): Promise<Subscription>;

    update(subscription: Subscription, session?: ClientSession): Promise<Subscription | null>;

    findById(subscriptionId: string): Promise<Subscription | null>;

}

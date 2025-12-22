import { Subscription } from "../../entities/subscription.entity";

export interface ISubscriptionRepository {

    create(subscription: Subscription, options?: { session: any }): Promise<Subscription>;

    update(subscription: Subscription): Promise<Subscription>;

    findById(subscriptionId: string): Promise<Subscription | null>;

}

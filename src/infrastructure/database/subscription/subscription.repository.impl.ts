import { SubscriptionModel } from "./subscription.model";
import { SubscriptionMapper } from "../../mappers/subscription.mapper";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

export class SubscriptionRepositoryImpl implements ISubscriptionRepository {

    async create(subscription: Subscription): Promise<Subscription> {
        const persistence = SubscriptionMapper.toPersistence(subscription);
        const doc = await SubscriptionModel.create(persistence);
        return SubscriptionMapper.toDomain(doc);
    };

    async update(subscription: Subscription): Promise<Subscription> {
        const persistence = SubscriptionMapper.toPersistence(subscription);

        const doc = await SubscriptionModel.findByIdAndUpdate(
            subscription._id,
            persistence,
            { new: true }
        );

        if (!doc) {
            throw new Error("Service not found");
        };

        return SubscriptionMapper.toDomain(doc);
    };

    async findById(subscriptionId: string): Promise<Subscription | null> {
        const doc = await SubscriptionModel.findById(subscriptionId);
        return doc ? SubscriptionMapper.toDomain(doc) : null;
    };

};
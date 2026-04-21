import { ClientSession } from "mongoose";
import { SubscriptionModel } from "../models/subscription.model";
import { SubscriptionMapper } from "../mappers/subscription.mapper";
import { Subscription } from "../../domain/entities/subscription.entity";
import { ISubscriptionRepository } from "../../domain/interfaces/repositories/ISubscription.repository";

export class SubscriptionRepositoryImpl implements ISubscriptionRepository {

    async create(subscription: Subscription, session?: ClientSession): Promise<Subscription> {
        const doc = await SubscriptionModel.create(
            [SubscriptionMapper.toPersistence(subscription)],
            { session }
        );
        return SubscriptionMapper.toDomain(doc[0]);
    };

    async update(subscription: Subscription, session?: ClientSession): Promise<Subscription | null> {
        const persistence = SubscriptionMapper.toPersistence(subscription);

        const doc = await SubscriptionModel.findByIdAndUpdate(
            subscription._id,
            persistence,
            { new: true, session }
        );

        return doc ? SubscriptionMapper.toDomain(doc) : null;
    };

    async findById(subscriptionId: string): Promise<Subscription | null> {
        const doc = await SubscriptionModel.findById(subscriptionId);
        return doc ? SubscriptionMapper.toDomain(doc) : null;
    };

};
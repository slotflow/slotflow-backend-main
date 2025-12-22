import { Types } from "mongoose";
import { SubscriptionModel } from "./subscription.model";
import { SubscriptionMapper } from "../../mappers/subscription.mapper";
import { Subscription } from "../../../domain/entities/subscription.entity";
import { ISubscriptionRepository } from "../../../domain/interfaces/repositories/ISubscription.repository";

export class SubscriptionRepositoryImpl implements ISubscriptionRepository {

    async create(subscription: Subscription): Promise<Subscription> {
        const persistence = SubscriptionMapper.toPersistence(subscription);
        const created = await SubscriptionModel.create(persistence);
        return SubscriptionMapper.toDomain(created);
    }

    async update(subscription: Subscription): Promise<Subscription> {
        const persistence = SubscriptionMapper.toPersistence(subscription);

        const updated = await SubscriptionModel.findByIdAndUpdate(
            new Types.ObjectId(subscription._id),
            persistence,
            { new: true }
        );

        if (!updated) {
            throw new Error("Service not found");
        };

        return SubscriptionMapper.toDomain(updated);
    }

    async findById(subscriptionId: string): Promise<Subscription | null> {
        const service = await SubscriptionModel.findById(subscriptionId);
        return service ? SubscriptionMapper.toDomain(service) : null;
    }

}
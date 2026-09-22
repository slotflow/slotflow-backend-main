import { ClientSession } from "mongoose";
import { PlanName } from "../../domain/enums/plan.enum";
import { SubscriptionModel } from "../models/subscription.model";
import { SubscriptionMapper } from "../mappers/subscription.mapper";
import { Subscription } from "../../domain/entities/subscription.entity";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";
import { ISubscriptionRepository } from "../../domain/interfaces/repositories/ISubscription.repository";

export class SubscriptionRepositoryImpl implements ISubscriptionRepository {

    async create(subscription: Subscription, session?: ClientSession): Promise<Subscription | null> {
        const doc = await SubscriptionModel.create(
            [SubscriptionMapper.toPersistence(subscription)],
            { session }
        );
        return doc && doc.length > 0 ? SubscriptionMapper.toDomain(doc[0]) : null;
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

    async getLatestSubscriptionByUserId(userId: string): Promise<Subscription | null> {
        const doc = await SubscriptionModel.findOne({ userId }).sort({ createdAt: -1 });
        return doc ? SubscriptionMapper.toDomain(doc) : null;
    }

    async getFirstPaidSubscriptionByUserId(userId: string): Promise<Subscription | null> {
        const doc = await SubscriptionModel.findOne({
            providerId: userId,
            subscriptionStatus: SubscriptionStatus.ACTIVE
        }).populate("subscriptionPlanId").sort({ createdAt: 1 });
        if (!doc) return null;
        const plan = doc.subscriptionPlanId as any;
        if (plan.planName === PlanName.TRIAL) {
            return null;
        }
        return SubscriptionMapper.toDomain(doc);
    }

};
import { Types } from "mongoose";
import { PlanModel } from "./plan.model";
import { PlanMapper } from "../../mappers/plan.mapper";
import { Plan } from "../../../domain/entities/plan.entity";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

export class PlanRepositoryImpl implements IPlanRepository {

    async create(plan: Plan): Promise<Plan> {
        const persistence = PlanMapper.toPersistence(plan);
        const created = await PlanModel.create(persistence);
        return PlanMapper.toDomain(created);
    }

    async findById(planId: string): Promise<Plan | null> {
        const doc = await PlanModel.findById(new Types.ObjectId(planId));
        return doc ? PlanMapper.toDomain(doc) : null;
    }

    async findByName(name: string): Promise<Plan | null> {
        const doc = await PlanModel.findOne({ planName: name });
        return doc ? PlanMapper.toDomain(doc) : null;
    }

    async findByPrice(price: number): Promise<Plan | null> {
        const doc = await PlanModel.findOne({ price });
        return doc ? PlanMapper.toDomain(doc) : null;
    }

    async update(plan: Plan): Promise<Plan> {
        const persistence = PlanMapper.toPersistence(plan);

        const updated = await PlanModel.findByIdAndUpdate(
            new Types.ObjectId(plan._id),
            persistence,
            { new: true }
        );

        if (!updated) {
            throw new Error("Plan not found");
        }

        return PlanMapper.toDomain(updated);
    }
}
import { PlanModel } from "./plan.model";
import { PlanMapper } from "../../mappers/plan.mapper";
import { Plan } from "../../../domain/entities/plan.entity";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

export class PlanRepositoryImpl implements IPlanRepository {

    async create(plan: Plan): Promise<Plan> {
        const persistence = PlanMapper.toPersistence(plan);
        const doc = await PlanModel.create(persistence);
        return PlanMapper.toDomain(doc);
    };

    async findById(planId: string): Promise<Plan | null> {
        const doc = await PlanModel.findById(planId);
        return doc ? PlanMapper.toDomain(doc) : null;
    };

    async findByName(name: string): Promise<Plan | null> {
        const doc = await PlanModel.findOne({ planName: name });
        return doc ? PlanMapper.toDomain(doc) : null;
    };

    async findByPrice(price: number): Promise<Plan | null> {
        const doc = await PlanModel.findOne({ price });
        return doc ? PlanMapper.toDomain(doc) : null;
    };

    async update(plan: Plan): Promise<Plan> {
        const persistence = PlanMapper.toPersistence(plan);

        const doc = await PlanModel.findByIdAndUpdate(
            plan._id,
            { $set: persistence },
            { new: true }
        );

        if (!doc) {
            throw new Error("Plan not found");
        }

        return PlanMapper.toDomain(doc);
    };

};
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

    async findByNameOrPrice(name: string, price: number): Promise<Plan | null> {
        const doc = await PlanModel.findOne({ 
             $or: [
                    { planName: name },
                    { price }
                ]
         });
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

    async findAll(page: number, limit: number): Promise<{ data: Array<Plan>, totalPages: number; currentPage: number; totalCount: number; }> {
        const skip = (page - 1) * limit;
        const [plans, totalCount] = await Promise.all([
            PlanModel.find({}, {
                _id: 1,
                planName: 1,
                price: 1,
                maxBookingPerMonth: 1,
                isBlocked: 1,
                adVisibility: 1,
            }).skip(skip).limit(limit).lean(),
            PlanModel.countDocuments(),
        ]);
        const totalPages = Math.ceil(totalCount / limit);
        return {
            data: plans.map(plan => PlanMapper.toDomain(plan)),
            totalPages,
            currentPage: page,
            totalCount
        }
    };

    async findAllForDisplay(): Promise<Array<Plan>> {
        const plans = await PlanModel.find({}, {
            _id: 1,
            planName: 1,
            price: 1,
            features: 1,
            description: 1
        });
        return plans.map(plan => PlanMapper.toDomain(plan));
    };

};
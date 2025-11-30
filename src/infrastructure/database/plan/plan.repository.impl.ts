import { Types } from "mongoose";
import { IPlan, PlanModel } from "./plan.model";
import { Plan } from "../../../domain/entities/plan.entity";
import { CreatePlanProps, findAllPlansForDisplayResProps, findPlanByNameOrPriceProps, IPlanRepository } from "../../../domain/repositories/IPlan.repository";
import { ApiPaginationRequest, ApiResponse } from "../../dtos/common.dto";
import { AdminPlanListResponse } from "../../dtos/admin.dto";

export class PlanRepositoryImpl implements IPlanRepository {
    private mapToEntity(plan: IPlan): Plan {
        return new Plan(
            plan._id,
            plan.planName,
            plan.description,
            plan.price,
            plan.features,
            plan.maxBookingPerMonth,
            plan.adVisibility,
            plan.isBlocked,
            plan.createdAt,
            plan.updatedAt,
        )
    }

    async createPlan(plan: CreatePlanProps): Promise<Plan> {
        try {
            const newPlan = await PlanModel.create(plan);
            return this.mapToEntity(newPlan);
        } catch (error) {
            console.log("createPlan error : ",error);
            throw new Error("Failed to create plan")
        }
    }

    async updatePlan(planId: Types.ObjectId, plan: Plan): Promise<Plan | null> {
        try {
            const updatedPlan = await PlanModel.findByIdAndUpdate(planId, plan, { new: true });
            return updatedPlan ? this.mapToEntity(updatedPlan) : null;
        } catch (error) {
            console.log("updatePlan error : ",error);
            throw new Error("Fialed to updated plan.");
        }
    }

    async findPlanById(planId: Types.ObjectId): Promise<Plan | null> {
        try {
            const plan = await PlanModel.findById(planId);
            return plan || null;
        } catch (error) {
            console.log("findPlanById error : ",error);
            throw new Error("Failed to find plan");
        }
    }

    async findAllPlans({ page, limit }: ApiPaginationRequest): Promise<ApiResponse<AdminPlanListResponse>> {
        try {
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
                data: plans.map(this.mapToEntity),
                totalPages,
                currentPage: page,
                totalCount
            }
        } catch (error) {
            console.log("findAllPlans error : ",error);
            throw new Error("Failed to find all plans");
        }
    }

    async findPlanByNameOrPrice(plan: findPlanByNameOrPriceProps): Promise<Plan | null> {
        try {
            const existingPlan = await PlanModel.findOne({
                $or: [
                    { planName: plan.planName },
                    { price: plan.price }
                ]
            });
            return existingPlan ? this.mapToEntity(existingPlan) : null;
        } catch (error) {
            console.log("findPlanByNameOrPrice error : ",error);
            throw new Error("Failed to find plan by name or price");
        }
    }

    async findAllPlansForDisplay(): Promise<Array<findAllPlansForDisplayResProps>> {
        try {
            const plans = await PlanModel.find({}, { _id: 1, planName: 1, price: 1, features: 1, description: 1 });
            return plans.map((plan) => this.mapToEntity(plan));
        } catch (error) {
            console.log("findAllPlansForDisplay error : ",error);
            throw new Error("Failed to find all plans");
        }
    }
}
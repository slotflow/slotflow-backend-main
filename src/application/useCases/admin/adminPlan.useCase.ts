import {
    AdminPlanListResponse,
    AdminCreatePlanRequest,
    AdminChangeBlockStatusResponse,
    AdminChangePlanIsBlockedStatusRequest,
} from "../../dtos/admin.dto";
import { log } from "../../../shared/logger/logger";
import { Plan } from "../../../domain/entities/plan.entity";
import { ApiPaginationRequest, TableData } from "../../dtos/common.dto";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";


export class AdminPlanListUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { }

    async execute(payload: ApiPaginationRequest): Promise<TableData<AdminPlanListResponse>> {
        try {
            const { page, limit } = payload;

            const result = await this.planRepository.findAll(page, limit);
            const { data: plans, currentPage, totalCount, totalPages } = result;
            return {
                data: plans.map(plan => ({
                    _id: plan._id,
                    adVisibility: plan.adVisibility,
                    isBlocked: plan.isBlocked,
                    maxBookingPerMonth: plan.maxBookingPerMonth,
                    planName: plan.planName,
                    price: plan.price,
                })),
                totalPages,
                currentPage,
                totalCount,
            };
        } catch (error) {
            log.error("AdminPlanListUseCase failed", error as Error);
            throw error;
        }
    }
}


export class AdminCreatePlanUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { }

    async execute(payload: AdminCreatePlanRequest): Promise<void> {
        try {
            const { planName, description, price, features, maxBookingPerMonth, adVisibility } = payload;

            const existingPlan = await this.planRepository.findByNameOrPrice(planName, price);
            const responseText: string = existingPlan?.planName === planName ? "name" : "price";
            if (existingPlan) throw new Error(`Plan with same ${responseText} already exists.`);

            const plan = Plan.create({
                planName,
                description,
                price,
                features,
                maxBookingPerMonth,
                adVisibility,
            });

            await this.planRepository.create(plan);
        } catch (error) {
            log.error("AdminCreatePlanUseCase failed", error as Error);
            throw error;
        }
    }

}


export class AdminChangePlanBlockStatusUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { }

    async execute(payload: AdminChangePlanIsBlockedStatusRequest): Promise<AdminChangeBlockStatusResponse> {
        try {
            const { planId, isBlocked } = payload;

            const plan = await this.planRepository.findById(planId);
            if (!plan) throw new Error("Plan does not exists.");

            if(plan.isBlocked === isBlocked) {
                isBlocked ? plan.unblock() : plan.block();
            };

            const updatedPlan = await this.planRepository.update(plan);

            return { planId, isBlocked: updatedPlan.isBlocked};
        } catch (error) {
            console.log("AdminChangePlanBlockStatusUseCase error :", error);
            throw new Error("Failed to change plan block status");
        }
    }
}

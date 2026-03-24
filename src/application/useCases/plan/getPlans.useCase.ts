import { log } from "../../../shared/logger/logger";
import { GetPlansResponse } from "../../dtos/plan.dto";
import { ApiPaginationRequest, TableData } from "../../dtos/common.dto";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

export class GetPlansUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { };

    async execute(payload: ApiPaginationRequest): Promise<TableData<GetPlansResponse>> {
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
            log.error("GetPlansUseCase failed", error as Error);
            throw error;
        };
    };
};
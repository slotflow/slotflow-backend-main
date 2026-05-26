import { TableData } from "../../dtos/common.dto";
import { GetPlansInput, GetPlansOutput } from "../../dtos/plan.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

export class GetPlansUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { };

    async execute(input: GetPlansInput): Promise<TableData<GetPlansOutput>> {
        try {
            const { page, limit, isProvider } = input;

            const result = await this.planRepository.findAll(page, limit);
            const { items: plans, currentPage, totalCount, totalPages } = result;
            return {
                items: plans.map(plan => ({
                    _id: plan._id,
                    adVisibility: !isProvider ? plan.adVisibility : undefined,
                    isBlocked: plan.isBlocked,
                    features: isProvider ? plan.features : undefined,
                    description: isProvider ? plan.description : undefined,
                    maxBookingPerMonth: !isProvider ? plan.maxBookingPerMonth : undefined,
                    planName: plan.planName,
                    price: plan.price,
                })),
                totalPages,
                currentPage,
                totalCount,
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get plans");
        };
    };
};
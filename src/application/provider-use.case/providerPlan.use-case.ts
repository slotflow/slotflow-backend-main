import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { ProviderFetchAllPlansResponse } from "../../infrastructure/dtos/provider.dto";
import { PlanRepositoryImpl } from "../../infrastructure/database/plan/plan.repository.impl";

export class ProviderFetchAllPlansUseCase {
    constructor(private planRepositoryImpl: PlanRepositoryImpl) { }

    async execute(): Promise<ApiResponse<ProviderFetchAllPlansResponse>> {
        try {
            const plans = await this.planRepositoryImpl.findAllPlansForDisplay();
            if (!plans) throw new Error("Plans Fetching error");
            return { success: true, message: "Plans fetched.", data: plans };
        } catch (error) {
            console.log("ProviderFetchAllPlansUseCase error : ", error);
            throw new Error("Failed to fetch all plans");
        }
    }
}
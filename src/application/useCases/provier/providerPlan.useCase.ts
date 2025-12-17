import { ApiResponse } from "../../dtos/common.dto";
import { ProviderFetchAllPlansResponse } from "../../dtos/provider.dto";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

export class ProviderFetchAllPlansUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { }

    async execute(): Promise<ApiResponse<ProviderFetchAllPlansResponse>> {
        try {
            const plans = await this.planRepository.findAllPlansForDisplay();
            if (!plans) throw new Error("Plans Fetching error");
            return { success: true, message: "Plans fetched.", data: plans };
        } catch (error) {
            console.log("ProviderFetchAllPlansUseCase error : ", error);
            throw new Error("Failed to fetch all plans");
        }
    }
}
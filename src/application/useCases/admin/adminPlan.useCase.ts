import { 
    AdminPlanListResponse, 
    AdminAddNewPlanRequest, 
    AdminChangePlanIsBlockedStatusRequest,
} from "../../../infrastructure/dtos/admin.dto";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";
import { ApiPaginationRequest, ApiResponse } from "../../../infrastructure/dtos/common.dto";


export class AdminPlanListUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { }

    async execute(payload: ApiPaginationRequest): Promise<ApiResponse<AdminPlanListResponse>> {
        try {
            const { page, limit } = payload;

            const result = await this.planRepository.findAllPlans({ page, limit });
            if (!result) throw new Error("Plans fetching failed");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminPlanListUseCase error :", error);
            throw new Error("Failed to fetch all plans");
        }
    }
}


export class AdminCreatePlanUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { }

    async execute(payload : AdminAddNewPlanRequest): Promise<ApiResponse> {
        try {
            const {planName, description, price, features, maxBookingPerMonth, adVisibility} = payload;

            const existingPlan = await this.planRepository.findPlanByNameOrPrice({planName, price});
            const responseText: string = existingPlan?.planName === planName ? "name" : "price";
            if(existingPlan) throw new Error(`Plan with same ${responseText} already exists.`);

            const newPlan = await this.planRepository.createPlan({ planName, description, price, features, maxBookingPerMonth, adVisibility, isBlocked: false });
            if(!newPlan) throw new Error("Plan adding failed, please try again.");

            return { success: true, message: "Plan created successfully." };
        } catch (error) {
            console.log("AdminCreatePlanUseCase error :", error);
            throw new Error("Failed to create plan");
        }
    }

}


export class AdminChangePlanBlockStatusUseCase {
    constructor(
        private planRepository: IPlanRepository
    ) { }

    async execute(payload: AdminChangePlanIsBlockedStatusRequest): Promise<ApiResponse> {
        try {
            const {planId, isBlocked} = payload;

            const existingPlan = await this.planRepository.findPlanById(planId);
            if(!existingPlan) throw new Error("Plan does not exists.");

            existingPlan.isBlocked = !isBlocked;
            const updatedPlan = await this.planRepository.updatePlan(planId, existingPlan);
            if(!updatedPlan) throw new Error("Plan status changing failed.");
            
            return { success: true, message: `Plan ${isBlocked ? "unblocked" : "blocked"} successfully.` };
        } catch (error) {
            console.log("AdminChangePlanBlockStatusUseCase error :", error);
            throw new Error("Failed to change plan block status");
        }
    }
}

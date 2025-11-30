import { 
    AdminAddServiceRequest, 
    AdminServiceListResponse, 
    AdminChnageServiceIsBlockedStatusRequest,
} from "../../infrastructure/dtos/admin.dto";
import { ApiPaginationRequest, ApiResponse } from "../../infrastructure/dtos/common.dto";
import { ServiceRepositoryImpl } from "../../infrastructure/database/appservice/service.repository.impl";

export class AdminServiceListUseCase {
    constructor(
        private seriveRepositoryImpl: ServiceRepositoryImpl
    ) { }

    async execute(payload: ApiPaginationRequest): Promise<ApiResponse<AdminServiceListResponse>> {
        try {
            const result = await this.seriveRepositoryImpl.findAllServices(payload);
            if (!result) throw new Error("Services fetching failed");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminServiceListUseCase error :", error);
            throw new Error("Failed to fetch services");
        }
    }
}

export class AdminAddServiceUseCase {
    constructor(
        private seriveRepositoryImpl: ServiceRepositoryImpl
    ) { }

    async execute(payload: AdminAddServiceRequest): Promise<ApiResponse> {
        try {
            const { serviceName } = payload;

            const existService = await this.seriveRepositoryImpl.findServiceByName(serviceName);
            if (existService) throw new Error("Service already exist.");

            const service = await this.seriveRepositoryImpl.createService(serviceName);
            if (!service) throw new Error("Service adding error, please try again.");

            return { success: true, message: "Service added successfully." };
        } catch (error) {
            console.log("AdminAddServiceUseCase error :", error);
            throw new Error("Failed to add service");
        }
    }
}

export class AdminChnageServiceBlockStatusUseCase {
    constructor(
        private seriveRepositoryImpl: ServiceRepositoryImpl
    ) { }

    async execute(payload: AdminChnageServiceIsBlockedStatusRequest): Promise<ApiResponse> {
        try {
            const { serviceId, isBlocked } = payload;

            const existingService = await this.seriveRepositoryImpl.findServiceById(serviceId);
            if (!existingService) throw new Error("No service found.");

            existingService.isBlocked = !isBlocked;

            const updatedService = await this.seriveRepositoryImpl.updateService(serviceId, existingService);
            if (!updatedService) throw new Error("Service status changing error.");
            
            return { success: true, message: `Service ${isBlocked ? "unblocked" : "blocked"} successfully.` };
        } catch (error) {
            console.log("AdminChnageServiceBlockStatusUseCase error :", error);
            throw new Error("Failed to change service block status");
        }
    }
}

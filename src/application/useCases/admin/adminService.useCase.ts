import { 
    AdminAddServiceRequest, 
    AdminServiceListResponse, 
    AdminChnageServiceIsBlockedStatusRequest,
} from "../../dtos/admin.dto";
import { ApiPaginationRequest, ApiResponse } from "../../dtos/common.dto";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";

export class AdminServiceListUseCase {
    constructor(
        private seriveRepository: IServiceRepository
    ) { }

    async execute(payload: ApiPaginationRequest): Promise<ApiResponse<AdminServiceListResponse>> {
        try {
            const result = await this.seriveRepository.findAllServices(payload);
            if (!result) throw new Error("Services fetching failed");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminServiceListUseCase error :", error);
            throw new Error("Failed to fetch services");
        }
    }
}

export class AdminCreateServiceUseCase {
    constructor(
        private seriveRepository: IServiceRepository
    ) { }

    async execute(payload: AdminAddServiceRequest): Promise<ApiResponse> {
        try {
            const { serviceName } = payload;

            const existService = await this.seriveRepository.findServiceByName(serviceName);
            if (existService) throw new Error("Service already exist.");

            const service = await this.seriveRepository.createService({ ...payload });
            if (!service) throw new Error("Service adding error, please try again.");

            return { success: true, message: "Service added successfully." };
        } catch (error) {
            console.log("AdminCreateServiceUseCase error :", error);
            throw new Error("Failed to add service");
        }
    }
}

export class AdminChnageServiceBlockStatusUseCase {
    constructor(
        private seriveRepository: IServiceRepository
    ) { }

    async execute(payload: AdminChnageServiceIsBlockedStatusRequest): Promise<ApiResponse> {
        try {
            const { serviceId, isBlocked } = payload;

            const existingService = await this.seriveRepository.findServiceById(serviceId);
            if (!existingService) throw new Error("No service found.");

            existingService.isBlocked = !isBlocked;

            const updatedService = await this.seriveRepository.updateService(serviceId, existingService);
            if (!updatedService) throw new Error("Service status changing error.");
            
            return { success: true, message: `Service ${isBlocked ? "unblocked" : "blocked"} successfully` };
        } catch (error) {
            console.log("AdminChnageServiceBlockStatusUseCase error :", error);
            throw new Error("Failed to change service block status");
        }
    }
}

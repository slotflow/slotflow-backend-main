import {
    AdminAddServiceRequest,
    AdminServiceListResponse,
    AdminChnageServiceIsBlockedStatusRequest,
    AdminChnageServiceIsBlockedStatusResponse,
} from "../../dtos/admin.dto";
import { log } from "../../../shared/logger/logger";
import { Service } from "../../../domain/entities/service.entity";
import { ApiPaginationRequest, ApiResponse } from "../../dtos/common.dto";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";

export class AdminServiceListUseCase {
    constructor(
        private seriveRepository: IServiceRepository,
    ) { }

    async execute(payload: ApiPaginationRequest): Promise<ApiResponse<AdminServiceListResponse>> {
        try {
            const { page, limit } = payload;
            const result = await this.seriveRepository.findAll(page, limit);
            const { data: services, currentPage, totalCount, totalPages } = result;

            return {
                data: services.map(service => ({
                    _id: service._id,
                    isBlocked: service.isBlocked,
                    serviceName: service.serviceName,
                    serviceCategory: service.serviceCategory
                })),
                totalPages,
                currentPage,
                totalCount,
            };
        } catch (error) {
            log.error("AdminServiceListUseCase failed", error as Error);
            throw error;
        }
    }
}

export class AdminCreateServiceUseCase {
    constructor(
        private seriveRepository: IServiceRepository
    ) { }

    async execute(payload: AdminAddServiceRequest): Promise<void> {
        try {
            const { serviceName, serviceCategory } = payload;

            const existService = await this.seriveRepository.findByName(serviceName);
            if (existService) throw new Error("Service already exist.");

            const service = Service.create({
                serviceCategory,
                serviceName
            });

            await this.seriveRepository.create(service);
        } catch (error) {
            log.error("AdminCreateServiceUseCase failed", error as Error);
            throw error;
        }
    }
}

export class AdminChnageServiceBlockStatusUseCase {
    constructor(
        private seriveRepository: IServiceRepository
    ) { }

    async execute(payload: AdminChnageServiceIsBlockedStatusRequest): Promise<AdminChnageServiceIsBlockedStatusResponse> {
        try {
            const { serviceId, isBlocked } = payload;

            const service = await this.seriveRepository.findById(serviceId);
            if (!service) throw new Error("No service found.");

            if (service.isBlocked !== isBlocked) {
                isBlocked ? service.block() : service.unblock();
            };

            const updatedService = await this.seriveRepository.update(service);
            if (!updatedService) throw new Error("Service status changing error.");

            return { serviceId, isBlocked: updatedService.isBlocked };
        } catch (error) {
            log.error("AdminChnageServiceBlockStatusUseCase failed", error as Error);
            throw error;
        }
    }
}

import { log } from "../../../shared/logger/logger";
import { ApiResponse } from "../../dtos/common.dto";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";
import { GetServiceRequest, GetServiceResponse } from "../../dtos/service.dto";

export class GetServicesUseCase {
    constructor(
        private seriveRepository: IServiceRepository,
    ) { };

    async execute(payload: GetServiceRequest): Promise<ApiResponse<GetServiceResponse>> {
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
            log.error("GetServicesUseCase failed", error as Error);
            throw error;
        };
    };
};
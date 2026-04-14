import { log } from "../../../shared/logger/logger";
import { ApiOutput } from "../../dtos/common.dto";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";
import { GetServiceRequest, GetServiceResponse } from "../../dtos/service.dto";

export class GetServicesUseCase {
    constructor(
        private seriveRepository: IServiceRepository,
    ) { };

    async execute(input: GetServiceRequest): Promise<ApiOutput<GetServiceResponse>> {
        try {
            const { page, limit } = input;
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
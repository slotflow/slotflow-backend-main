import { TableData } from "../../dtos/common.dto";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { GetServiceInput, GetServiceOutput } from "../../dtos/service.dto";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";

export class GetServicesUseCase {
    constructor(
        private seriveRepository: IServiceRepository,
    ) { };

    async execute(input: GetServiceInput): Promise<TableData<GetServiceOutput>> {
        try {
            const { page, limit } = input;
            const result = await this.seriveRepository.findAll(page, limit);
            const { items: services, currentPage, totalCount, totalPages } = result;

            return {
                items: services.map(service => ({
                    _id: service._id,
                    isBlocked: service.isBlocked,
                    serviceName: service.serviceName,
                    serviceCategory: service.serviceCategory
                })),
                totalPages,
                currentPage,
                totalCount,
            };
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get services");
        };
    };
};
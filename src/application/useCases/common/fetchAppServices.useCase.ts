import { log } from "../../../shared/logger/logger";
import { FetchAllAppServiceRequest, FetchAllAppServicesResponse } from "../../dtos/common.dto";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";

export class FetchAllAppServicesUseCase {

    constructor(
        private serviceRepository: IServiceRepository
    ) { };

    async execute(payload: FetchAllAppServiceRequest): Promise<FetchAllAppServicesResponse> {
        try {
            const { categories } = payload;
            const services = await this.serviceRepository.findAllByCategory(categories);
            if (!services) return null;
        
            const filteredServices = services.map(service => ({
                _id: service._id,
                serviceName: service.serviceName,
            }));

            return filteredServices;
        } catch (error) {
            log.error("FetchAllAppServicesUseCase failed", error as Error);
            throw error;
        };
    };
};
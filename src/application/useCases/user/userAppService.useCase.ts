import { log } from "../../../shared/logger/logger";
import { FetchAllAppServicesResponse } from "../../dtos/common.dto";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";

export class UserFetchAllAppServiceUseCase {

    constructor(
        private serviceRepository: IServiceRepository
    ) { };

    async execute(): Promise<FetchAllAppServicesResponse> {
        try {
            const services = await this.serviceRepository.findAllServiceNames();
            if (!services) return null;

            const filteredServices = services.map(service => ({
                _id: service._id,
                serviceName: service.serviceName,
            }));
            
            return filteredServices;
        } catch (error) {
            log.error("UserFetchAllAppServiceUseCase failed ", error as Error);
            throw error;
        };
    };

};
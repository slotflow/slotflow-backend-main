import { log } from '../../../shared/logger/logger';
import { IServiceRepository } from '../../../domain/interfaces/repositories/IService.repository';
import { FetchAllAppServiceRequest, FetchAllAppServicesResponse } from '../../dtos/common.dto';

export class ProviderFetchAllAppServicesUseCase {

    constructor(
        private serviceRepository: IServiceRepository
    ) { };

    async execute(payload: FetchAllAppServiceRequest): Promise<FetchAllAppServicesResponse> {
        try {
            const { serviceCategory } = payload;
            const services = await this.serviceRepository.findAllByCategory(serviceCategory);
            if (!services) return null;
        
            const filteredServices = services.map(service => ({
                _id: service._id,
                serviceName: service.serviceName,
            }));

            return filteredServices;
        } catch (error) {
            log.error("ProviderFetchAllAppServicesUseCase failed", error as Error);
            throw error;
        };
    };
};
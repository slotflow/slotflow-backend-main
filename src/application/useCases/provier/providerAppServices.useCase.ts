import { IServiceRepository } from '../../../domain/interfaces/repositories/IService.repository';
import { ApiResponse, FetchAllAppServiceRequest, FetchAllAppServicesResponse } from '../../dtos/common.dto';


export class ProviderFetchAllAppServicesUseCase {

    constructor(
        private serviceRepository: IServiceRepository
    ) { }

    async execute(payload: FetchAllAppServiceRequest): Promise<ApiResponse<FetchAllAppServicesResponse>> {
        try {
            const { serviceCategory } = payload;
            const services = await this.serviceRepository.findAllServicesByCategory(serviceCategory);
            if (services === null) return { success: true, message: "No servicec found.", data: [] };
            if (!services) throw new Error("No services found.");
            const filteredServices = services.map(service => ({
                _id: service._id,
                serviceName: service.serviceName,
            }));
            return { success: true, message: "Services fetched successfully.", data: filteredServices };
        } catch (error) {
            console.log("ProviderFetchAllAppServicesUseCase error : ", error);
            throw new Error("Failed to fetch all application services");
        }
    }
}
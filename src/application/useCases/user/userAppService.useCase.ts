import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";
import { ApiResponse, FetchAllAppServicesResponse } from "../../dtos/common.dto";

export class UserFetchAllAppServiceUseCase {

    constructor(
        private serviceRepository: IServiceRepository
    ) { }

    async execute(): Promise<ApiResponse<FetchAllAppServicesResponse>> {
        try {
            const services = await this.serviceRepository.findAllServiceNames();
            if (services === null) return { success: true, message: "No servicec found.", data: [] };
            if (!services) throw new Error("No services found.");

            const filteredServices = services.map(service => ({
                _id: service._id,
                serviceName: service.serviceName,
            }));
            
            return { success: true, message: "Services fetched successfully.", data: filteredServices };
        } catch (error) {
            console.log("UserFetchAllAppServiceUseCase error : ", error);
            throw new Error("Failed to fetch all application services");
        }
    }

}
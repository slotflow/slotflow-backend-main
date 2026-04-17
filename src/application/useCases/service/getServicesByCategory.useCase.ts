import { log } from "../../../shared/logger/logger";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";
import { GetServicesByCategoryInput, GetServicesByCategoryOutput } from "../../dtos/service.dto";

export class GetServicesByCategoryUseCase {

    constructor(
        private serviceRepository: IServiceRepository
    ) { };

    async execute(input: GetServicesByCategoryInput): Promise<GetServicesByCategoryOutput> {
        try {
            const { categories } = input;
            const services = await this.serviceRepository.findAllByCategory(categories);
            if (!services) return null;

            return services.map(service => ({
                _id: service._id,
                serviceName: service.serviceName,
            }));
        } catch (error) {
            log.error("GetServicesByCategoryUseCase failed", error as Error);
            throw error;
        };
    };
};
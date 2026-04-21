import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";
import { GetServicesByCategoryInput, GetServicesByCategoryOutput } from "../../dtos/service.dto";

export class GetServicesByCategoryUseCase {

    constructor(
        private serviceRepository: IServiceRepository
    ) { };

    async execute(input: GetServicesByCategoryInput): Promise<GetServicesByCategoryOutput> {
        try {
            const { categories } = input;
            if(!categories) {
                throw new BadRequestError();
            }

            const services = await this.serviceRepository.findAllByCategory(categories);
            if (!services) return null;

            return services.map(service => ({
                _id: service._id,
                serviceName: service.serviceName,
            }));
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get services by categories");
        };
    };
};
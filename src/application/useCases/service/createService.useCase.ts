import { log } from "../../../shared/logger/logger";
import { Service } from "../../../domain/entities/service.entity";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";
import { CreateServiceRequest } from "../../dtos/service.dto";

export class CreateServiceUseCase {
    constructor(
        private seriveRepository: IServiceRepository
    ) { };

    async execute(payload: CreateServiceRequest): Promise<void> {
        try {
            const { serviceName, serviceCategory } = payload;

            const existService = await this.seriveRepository.findByName(serviceName);
            if (existService) throw new Error("Service already exist.");

            const service = Service.create({
                serviceCategory,
                serviceName
            });

            await this.seriveRepository.create(service);
        } catch (error) {
            log.error("CreateServiceUseCase failed", error as Error);
            throw error;
        };
    };
};
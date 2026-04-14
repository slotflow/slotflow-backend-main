import { log } from "../../../shared/logger/logger";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";
import { ChangeServiceBlockStatusRequest, ChangeServiceBlockStatusResponse } from "../../dtos/service.dto";

export class ChangeServiceBlockStatusUseCase {
    constructor(
        private seriveRepository: IServiceRepository
    ) { };

    async execute(input: ChangeServiceBlockStatusRequest): Promise<ChangeServiceBlockStatusResponse> {
        try {
            const { serviceId, isBlocked } = input;

            const service = await this.seriveRepository.findById(serviceId);
            if (!service) throw new Error("No service found.");

            if (service.isBlocked !== isBlocked) {
                isBlocked ? service.block() : service.unblock();
            };

            const updatedService = await this.seriveRepository.update(service);
            if (!updatedService) throw new Error("Service status changing error.");

            return { serviceId, isBlocked: updatedService.isBlocked };
        } catch (error) {
            log.error("ChangeServiceBlockStatusUseCase failed", error as Error);
            throw error;
        };
    };
};
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { IProviderServiceRepository } from "../../../domain/interfaces/repositories/IProviderService.repository";
import { ProviderService } from "../../../domain/entities/providerService.entity";
import { log } from "../../../shared/logger/logger";
import { CreateProviderServiceRequest } from "../../dtos/providerService";

export class CreateProviderServiceUseCase {

    constructor(
        private providerRepository: IProviderRepository,
        private providerServiceRepository: IProviderServiceRepository,
    ) { };

    async execute(payload: CreateProviderServiceRequest): Promise<void> {
        try {
            const provider = await this.providerRepository.findById(payload.providerId);
            if (!provider) throw new Error("Please logout and try again.");

            const providerService = ProviderService.create({
                ...payload
            });

            const serivce = await this.providerServiceRepository.create(providerService);

            if (provider && serivce) {
                provider.attachService(serivce._id);
                const updatedProvider = await this.providerRepository.update(provider);
                if (!updatedProvider) throw new Error("Failed to update provider with service ID.");
            };

        } catch (error) {
            log.error("CreateProviderServiceUseCase failed", error as Error);
            throw error;
        };
    };
};
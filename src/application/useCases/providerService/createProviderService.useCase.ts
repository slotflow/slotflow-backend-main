import { log } from "../../../shared/logger/logger";
import { CreateProviderServiceRequest } from "../../dtos/providerService";
import { ProviderService } from "../../../domain/entities/providerService.entity";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";
import { IProviderServiceRepository } from "../../../domain/interfaces/repositories/IProviderService.repository";

export class CreateProviderServiceUseCase {

    constructor(
        private providerProfileRepository: IProviderProfileRepository,
        private providerServiceRepository: IProviderServiceRepository,
    ) { };

    async execute(payload: CreateProviderServiceRequest): Promise<void> {
        try {
            const providerProfile = await this.providerProfileRepository.findById(payload.providerId);
            if (!providerProfile) throw new Error("Profile not found.");

            const providerService = ProviderService.create({
                ...payload
            });

            const newSerivce = await this.providerServiceRepository.create(providerService);

            if (providerProfile && newSerivce) {
                providerProfile.attachService(newSerivce._id);
                const updatedProviderProfile = await this.providerProfileRepository.update(providerProfile);
                if (!updatedProviderProfile) throw new Error("Failed to update provider with service.");
            };

        } catch (error) {
            log.error("CreateProviderServiceUseCase failed", error as Error);
            throw error;
        };
    };
};
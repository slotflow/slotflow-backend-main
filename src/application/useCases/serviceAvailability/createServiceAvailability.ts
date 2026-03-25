import { log } from "../../../shared/logger/logger";
import { CreateServiceAvailabilityRewuest } from "../../dtos/serviceAvailability.dto";
import { ServiceAvailability } from "../../../domain/entities/serviceAvailability.entity";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { FrontendAvailabilityForRequest, FrontendAvailabilityUpdatedSlots } from "../../dtos/common.dto";
import { IServiceAvailabilityRepository } from "../../../domain/interfaces/repositories/IServiceAvailability.repository";

export class CreateServiceAvailabilitiesUseCase {
    constructor(
        private providerRepository: IProviderRepository,
        private serviceAvailabilityRepository: IServiceAvailabilityRepository,
    ) { };

    async execute(payload: CreateServiceAvailabilityRewuest): Promise<void> {
        try {
            const { providerId, availabilities } = payload;
            if (!providerId || !availabilities || availabilities.length === 0) throw new Error("Invalid request.");


            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("Please logout and try again.");

            const newAvailabilities: FrontendAvailabilityUpdatedSlots[] = availabilities.map((availability: FrontendAvailabilityForRequest) => ({
                ...availability,
                slots: availability.slots.map((slot: string) => ({
                    time: slot
                }))
            }));

            const serviceAvailabilityData = ServiceAvailability.create({
                providerId,
                availabilities: newAvailabilities
            });

            const serviceAvailability = await this.serviceAvailabilityRepository.create(serviceAvailabilityData);
            if (!serviceAvailability) throw new Error("Service availability saving failed.");

            if (provider && serviceAvailability && serviceAvailability._id) {
                provider.attachServiceAvailability(serviceAvailability._id);
                const updatedProvider = await this.providerRepository.update(provider);
                if (!updatedProvider) throw new Error("Failed to update provider with service availability in profile.");
            };

        } catch (error) {
            log.error("CreateServiceAvailabilitiesUseCase failed", error as Error);
            throw error;
        };
    };
};
import { log } from "../../../shared/logger/logger";
import { CreateServiceAvailabilityInput } from "../../dtos/serviceAvailability.dto";
import { ServiceAvailability } from "../../../domain/entities/serviceAvailability.entity";
import { FrontendAvailabilityForRequest, FrontendAvailabilityUpdatedSlots } from "../../dtos/common.dto";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";
import { IServiceAvailabilityRepository } from "../../../domain/interfaces/repositories/IServiceAvailability.repository";

export class CreateServiceAvailabilitiesUseCase {
    constructor(
        private providerProfileRepository: IProviderProfileRepository,
        private serviceAvailabilityRepository: IServiceAvailabilityRepository,
    ) { };

    async execute(input: CreateServiceAvailabilityInput): Promise<void> {
        try {
            const { providerId, availabilities } = input;
            if (!providerId || !availabilities || availabilities.length === 0) throw new Error("Invalid request.");

            const providerProfile = await this.providerProfileRepository.findById(providerId);
            if (!providerProfile) throw new Error("Profile not found.");

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

            if (providerProfile && serviceAvailability && serviceAvailability._id) {
                providerProfile.attachServiceAvailability(serviceAvailability._id);
                const updatedProviderProfile = await this.providerProfileRepository.update(providerProfile);
                if (!updatedProviderProfile) throw new Error("Failed to update service availability in profile.");
            };
        } catch (error) {
            log.error("CreateServiceAvailabilitiesUseCase failed", error as Error);
            throw error;
        };
    };
};
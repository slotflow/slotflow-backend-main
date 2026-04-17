import { log } from "../../../shared/logger/logger";
import { IProviderServiceRepository } from "../../../domain/interfaces/repositories/IProviderService.repository";
import { UpdateProviderServiceInput, UpdateProviderServiceOutput } from "../../dtos/providerService.dto";

export class UpdateProviderServiceUseCase {
    constructor(
        private provderServiceRepository: IProviderServiceRepository
    ) { };

    async execute(input: UpdateProviderServiceInput): Promise<UpdateProviderServiceOutput> {
        try {

            const { _id, ...updateData } = input;
            const providerService = await this.provderServiceRepository.findById(_id);
            if (!providerService) return null;

            providerService.update({
                ...updateData,
                requirements: updateData.requirements ?? null,
                videoUrl: updateData.videoUrl ?? null,
            });

            const service = await this.provderServiceRepository.update(providerService);
            if (!service) return null;


            return {
                _id: service._id,
                providerId: service.providerId,
                service: {
                    serviceName: service.serviceName,
                },
                serviceName: service.serviceName,
                serviceDescription: service.serviceDescription,
                servicePrice: service.servicePrice,
                serviceExperience: service.serviceExperience,
                serviceType: service.serviceType,
                serviceMode: service.serviceMode,
                tags: service.tags,
                requirements: service.requirements,
                videoUrl: service.videoUrl,
                maxParticipants: service.maxParticipants,
                isGroupService: service.isGroupService,
            };

        } catch (error) {
            log.error("UpdateProviderServiceUseCase failed", error as Error);
            throw error;
        };
    };
};
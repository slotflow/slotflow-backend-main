import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { UpdateProviderServiceInput, UpdateProviderServiceOutput } from "../../dtos/providerService.dto";
import { IProviderServiceRepository } from "../../../domain/interfaces/repositories/IProviderService.repository";

export class UpdateProviderServiceUseCase {
    constructor(
        private provderServiceRepository: IProviderServiceRepository
    ) { };

    async execute(input: UpdateProviderServiceInput): Promise<UpdateProviderServiceOutput> {
        try {
            const { providerServiceId, ...updateData } = input;
            if(!providerServiceId || !updateData) {
                throw new BadRequestError();
            }

            const providerService = await this.provderServiceRepository.findById(providerServiceId);
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

        } catch (error: unknown) {
            throw toAppError(error, "Failed to update provider service");
        };
    };
};
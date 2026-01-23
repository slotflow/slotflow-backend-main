import { log } from '../../../shared/logger/logger';
import { IProviderServiceQueries } from '../../queries/IProviderService.queries';
import { ProviderService } from '../../../domain/entities/providerService.entity';
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';
import { IProviderServiceRepository } from '../../../domain/interfaces/repositories/IProviderService.repository';
import { CreateProviderServiceRequest, ProviderFetchProviderServiceRequest, ProviderFetchProviderServiceResponse, ProviderUpdateProviderServiceRequest, ProviderUpdateProviderServiceResponse } from '../../dtos/provider.dto';

export class ProviderCreateServiceDetailsUseCase {

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

            await this.providerServiceRepository.create(providerService);

            if (provider && providerService && providerService._id) {
                provider.attachService(providerService._id);
                const updatedProvider = await this.providerRepository.update(provider);
                if (!updatedProvider) throw new Error("Failed to update provider with service ID.");
            };

        } catch (error) {
            log.error("ProviderCreateServiceDetailsUseCase failed", error as Error);
            throw error;
        };
    };
};


export class ProviderFetchServiceDetailsUseCase {

    constructor(
        private providerServiceQueries: IProviderServiceQueries
    ) { };

    async execute(payload: ProviderFetchProviderServiceRequest): Promise<ProviderFetchProviderServiceResponse> {
        try {
            const { providerId } = payload;

            const service = await this.providerServiceQueries.findByProviderId(providerId);
            if (!service) return null;

            return { ...service }
        } catch (error) {
            log.error("ProviderFetchServiceDetailsUseCase faile : ", error as Error);
            throw error;
        };
    };
};


export class ProviderUpdateServiceDetailsUseCase {
    constructor(
        private provderServiceRepository: IProviderServiceRepository
    ) { };

    async execute(payload: ProviderUpdateProviderServiceRequest): Promise<ProviderUpdateProviderServiceResponse> {
        try {

            const { _id, ...updateData } = payload;
            const providerService = await this.provderServiceRepository.findById(payload._id);
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
            log.error("ProviderUpdateServiceDetailsUseCase failed", error as Error);
            throw error;
        };
    };
};
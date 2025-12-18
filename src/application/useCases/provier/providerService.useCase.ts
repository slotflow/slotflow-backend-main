import { ApiResponse } from '../../dtos/common.dto';
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';
import { CreateProviderServiceRequest, IProviderServiceRepository } from '../../../domain/interfaces/repositories/IProviderService.repository';
import { ProviderFetchProviderServiceRequest, ProviderFetchProviderServiceResponse, ProviderFindProviderServiceResProps, ProviderUpdateProviderServiceRequest, ProviderUpdateProviderServiceResponse } from '../../dtos/provider.dto';

export class ProviderCreateServiceDetailsUseCase {

    constructor(
        private providerRepository: IProviderRepository,
        private providerServiceRepository: IProviderServiceRepository,
    ) { }

    async execute(payload: CreateProviderServiceRequest): Promise<ApiResponse> {
        try {
            const provider = await this.providerRepository.findById(payload.providerId);
            if (!provider) throw new Error("Please logout and try again.");

            const providerService = await this.providerServiceRepository.createProviderService({ ...payload })
            if (!providerService) throw new Error("Service details adding error.");

            if (provider && providerService && providerService._id) {
                provider.attachService(providerService._id);
                const updatedProvider = await this.providerRepository.update(provider);
                if (!updatedProvider) throw new Error("Failed to update provider with service ID.");
            }

            return { success: true, message: 'Service details saved.' };

        } catch (error) {
            console.log("ProviderCreateServiceDetailsUseCase error : ", error);
            throw new Error('Failed to save service details.')
        }
    }
}


export class ProviderFetchServiceDetailsUseCase {

    constructor(
        private provderServiceRepository: IProviderServiceRepository
    ) { }

    async execute(payload: ProviderFetchProviderServiceRequest): Promise<ApiResponse<ProviderFetchProviderServiceResponse>> {
        try {
            const { providerId } = payload;

            const service = await this.provderServiceRepository.findProviderServiceByProviderId(providerId);
            if (service === null) return { success: true, message: "Provider service details not yet created", data: {} };
            function isServiceData(obj: any): obj is ProviderFindProviderServiceResProps {
                return obj && typeof obj === 'object' && '_id' in obj;
            }

            if (!isServiceData(service)) {
                return { success: true, message: "Provider service details fetched successfully.", data: {} };
            }

            const { createdAt, updatedAt, ...rest } = service;

            return { success: true, message: "Provider service details fetched successfully", data: rest };
        } catch (error) {
            console.log("ProviderFetchServiceDetailsUseCase error : ", error);
            throw new Error("Failed to fetch service details");
        }
    }
}


export class ProviderUpdateServiceDetailsUseCase {
    constructor(
        private provderServiceRepository: IProviderServiceRepository
    ) { }

    async execute(payload: ProviderUpdateProviderServiceRequest): Promise<ApiResponse<ProviderUpdateProviderServiceResponse>> {
        try {
            const service = await this.provderServiceRepository.updateProviderServiceDetails(payload);
            if (service === null) return { success: true, message: "Provider service details not yet created", data: {} };
            function isServiceData(obj: any): obj is ProviderFindProviderServiceResProps {
                return obj && typeof obj === 'object' && '_id' in obj;
            }

            if (!isServiceData(service)) {
                return { success: true, message: "Provider service details updated successfully.", data: {} };
            }

            const { createdAt, updatedAt, ...rest } = service;

            return { success: true, message: "Provider service details updated successfully", data: rest };

        } catch(error) {
            console.log("ProviderUpdateServiceDetailsUseCase error : ", error);
            throw new Error("Failed to update service details");
        }
    }
}
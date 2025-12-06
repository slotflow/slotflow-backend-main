import { Types } from 'mongoose';
import { ApiResponse } from '../../../infrastructure/dtos/common.dto';
import { IProviderRepository } from '../../../domain/interfaces/repositories/IProvider.repository';
import { CreateProviderServiceRequest, IProviderServiceRepository } from '../../../domain/interfaces/repositories/IProviderService.repository';
import { ProviderFetchProviderServiceRequest, ProviderFetchProviderServiceResponse, ProviderFindProviderServiceResProps } from '../../../infrastructure/dtos/provider.dto';

export class ProviderCreateServiceDetailsUseCase {

    constructor(
        private providerRepository: IProviderRepository,
        private providerServiceRepository: IProviderServiceRepository,
    ) { }

    async execute(payload: CreateProviderServiceRequest): Promise<ApiResponse> {
        try {
            const provider = await this.providerRepository.findProviderById(payload.providerId);
            if (!provider) throw new Error("Please logout and try again.");

            const providerService = await this.providerServiceRepository.createProviderService({ ...payload })
            if (!providerService) throw new Error("Service details adding error.");

            if (provider && providerService && providerService._id) {
                provider.serviceId = providerService._id;
                const updatedProvider = await this.providerRepository.updateProvider(provider);
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

            const service = await this.provderServiceRepository.findProviderServiceByProviderId(new Types.ObjectId(providerId));
            if (service === null) return { success: true, message: "Provider service details not yet addedd", data: {} };
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
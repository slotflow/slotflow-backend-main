import { log } from "../../../shared/logger/logger";
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";
import { GetProviderServiceRequest, GetProviderServiceResponse } from "../../dtos/providerService";

export class GetProviderServicesUseCase {

    constructor(
        private providerServiceQueries: IProviderServiceQueries
    ) { };

    async execute(payload: GetProviderServiceRequest): Promise<GetProviderServiceResponse> {
        try {
            const { providerId, isUser } = payload;

            const service = await this.providerServiceQueries.findByProviderId(providerId);
            if (!service) return null;

            return {
                _id: !isUser ? service._id : undefined,
                serviceName: service.serviceName,
                serviceDescription: service.serviceDescription,
                servicePrice: service.servicePrice,
                serviceExperience: service.serviceExperience,
                videoUrl: service.videoUrl,
                serviceType: service.serviceType,
                serviceMode: service.serviceMode,
                requirements: service.requirements,
                maxParticipants: service.maxParticipants,
                isGroupService: service.isGroupService,
                service: service.service,
                providerId: !isUser ? service.providerId : undefined,
                tags: !isUser ? service.tags : undefined,
            }
        } catch (error) {
            log.error("GetProviderServicesUseCase faile : ", error as Error);
            throw error;
        };
    };
};
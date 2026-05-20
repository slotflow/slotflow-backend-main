import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { IProviderServiceQueries } from "../../queries/IProviderService.queries";
import { GetProviderServiceInput, GetProviderServiceOuput } from "../../dtos/providerService.dto";

export class GetProviderServicesUseCase {

    constructor(
        private providerServiceQueries: IProviderServiceQueries
    ) { };

    async execute(input: GetProviderServiceInput): Promise<GetProviderServiceOuput> {
        try {
            const { providerId } = input;
            if (!providerId) {
                throw new BadRequestError();
            }

            const service = await this.providerServiceQueries.findByProviderId({ providerId });
            if (!service) return null;

            return {
                _id: service._id,
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
                serviceId: {
                    serviceName: service.serviceId.serviceName
                },
                providerId: service.providerId,
                tags: service.tags,
            }
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get provider service");
        };
    };
};
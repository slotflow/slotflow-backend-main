import { Types } from "mongoose";
import { Service } from "../../entities/service.entity";
import { ProviderService } from "../../entities/providerService.entity";
import { ProviderUpdateProviderServiceRequest, ProviderUpdateProviderServiceResponse } from "../../../application/dtos/provider.dto";

export type CreateProviderServiceRequest = Pick<ProviderService, "providerId" | "service" | "serviceName" | "serviceDescription" | "servicePrice" | "isGroupService" | "maxParticipants" | "serviceExperience" | "serviceMode" | "serviceType" | "tags"> & Partial<Pick<ProviderService, "videoUrl" | "requirements">>;

type FindProviderServiceProps = Omit<ProviderService, "service">;
export interface FindProviderServiceResponse extends FindProviderServiceProps {
    service: Pick<Service, "serviceName">
}

export interface FindProvidersUsingServiceIdsResponse {
    _id: Types.ObjectId,
    provider : {
        _id: Types.ObjectId,
        username: string,
        profileImage: string | null,
        trustedBySlotflow: boolean,
    },
     serviceDetails: {
        serviceId: Types.ObjectId;
        service: Service["serviceName"];
        serviceCategory: Service["serviceCategory"];
        serviceName: ProviderService["serviceName"];
        servicePrice: ProviderService["servicePrice"];
    }
  }

export interface IProviderServiceRepository {

    createProviderService(payload: CreateProviderServiceRequest): Promise<ProviderService | null>;

    findProviderServiceByProviderId(providerId: Types.ObjectId): Promise<FindProviderServiceResponse | {}>;

    findProvidersUsingServiceIds(serviceIds: Types.ObjectId[]): Promise<Array<FindProvidersUsingServiceIdsResponse> | []>;

    updateProviderServiceDetails(payload: ProviderUpdateProviderServiceRequest): Promise<ProviderUpdateProviderServiceResponse | null>;

}
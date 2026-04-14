import { ServiceCategory } from "../../domain/enums/service.enum";
import { AddressDTO, ProviderProfileDTO, ProviderServiceDTO, ServiceDTO, UserDTO } from "./common.dto";

//// **** booking queries dtos **** ////

// 1. findByProviderId method parameter and return type / interface
export interface ProviderServiceByProviderIdQuery {
    providerId: UserDTO["_id"];
}
type FindProviderService = Omit<ProviderServiceDTO, "service" | "updatedAt" | "createdAt">;
export interface ProviderServiceByProviderIdView extends FindProviderService {
  service: Pick<ServiceDTO, "serviceName">
}

// 2. findProvidersUsingServiceIds method parameter and return type / interface
export interface ProviderServiceByServiceIdsQuery {
    serviceIds?: string[];
    categories?: ServiceCategory[];
    location?: AddressDTO["location"];
    maxPrice?: number;
    minPrice?: number;
    slotflowTrusted?: boolean;
    radius?: number;
    skip?: number;
    limit?: number;
};
export interface ProviderServiceByServiceIds {
    _id: ProviderServiceDTO["_id"];
    provider: {
        _id: ProviderServiceDTO["providerId"];
        username: UserDTO["username"];
        profileImage: UserDTO["profileImage"];
        trustedBySlotflow: ProviderProfileDTO["trustedBySlotflow"];
    },
    serviceDetails: {
        serviceId: ProviderServiceDTO["service"];
        service: ServiceDTO["serviceName"];
        serviceCategory: ServiceDTO["serviceCategory"];
        serviceName: ProviderServiceDTO["serviceName"];
        servicePrice: ProviderServiceDTO["servicePrice"];
    }
}
export type ProviderServiceByServiceIdsView = Array<ProviderServiceByServiceIds>;

// 3. updateProviderService method parameter and return type / interface
export type UpdateProviderServiceQuery = Pick<ProviderServiceDTO, "_id" | "service" | "serviceName" | "serviceDescription" | "servicePrice" | "isGroupService" | "maxParticipants" | "serviceExperience" | "serviceMode" | "serviceType" | "tags"> & Partial<Pick<ProviderServiceDTO, "videoUrl" | "requirements">>;
export type UpdateProviderServiceView = ProviderServiceByProviderIdView | null;










//// **** providerService usecase dtos **** ////

// get providers services input output
export type GetProvidersServicesInput = ProviderServiceByServiceIdsQuery;
export type GetProvidersServicesOutput = ProviderServiceByServiceIdsView;

// create provider service input
export type CreateProviderServiceInput = Pick<ProviderServiceDTO, "isGroupService" | "maxParticipants" | "providerId" | "requirements" | "service" | "serviceDescription" | "serviceExperience" | "serviceMode" | "serviceName" | "servicePrice" | "serviceType" | "tags" | "videoUrl">;

// get provider service input and output
export interface GetProviderServiceInput {
    providerId: UserDTO["_id"];
    isUser: boolean;
}
type FindProviderServiceByUser = Pick<ProviderServiceDTO, "serviceName" | "serviceDescription" | "servicePrice" | "serviceExperience" | "videoUrl" | "serviceType" | "serviceMode" | "requirements" | "maxParticipants" | "isGroupService">;
export interface ProviderServiceByProviderIdForUserView extends FindProviderServiceByUser {
    service: Pick<ServiceDTO, "serviceName">
}
export type GetProviderServiceOuput = ProviderServiceByProviderIdView | ProviderServiceByProviderIdForUserView | null;


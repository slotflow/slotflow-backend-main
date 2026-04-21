import { ServiceCategory } from "../../domain/enums/service.enum";
import { AddressDTO, ProviderProfileDTO, ProviderServiceDTO, ServiceDTO, UserDTO } from "./common.dto";

//// **** booking queries dtos **** ////

// 1. findByProviderId method parameter and return type / interface
export interface ProviderServiceByProviderIdQuery {
    providerId: UserDTO["_id"];
}
type FindProviderService = Pick<ProviderServiceDTO, "serviceName" | "serviceDescription" | "servicePrice" | "serviceExperience" | "serviceType" | "serviceMode" | "requirements" | "maxParticipants" | "isGroupService" | "videoUrl">;
export interface ProviderServiceByProviderIdView extends FindProviderService {
    serviceId: { serviceName: string };
    _id?: string;
    providerId?: string;
    tags: string[] | [];
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
        serviceId: ProviderServiceDTO["serviceId"];
        service: ServiceDTO["serviceName"];
        serviceCategory: ServiceDTO["serviceCategory"];
        serviceName: ProviderServiceDTO["serviceName"];
        servicePrice: ProviderServiceDTO["servicePrice"];
    }
}
export type ProviderServiceByServiceIdsView = Array<ProviderServiceByServiceIds>;

// 3. updateProviderService method parameter and return type / interface
export type UpdateProviderServiceQuery = Pick<ProviderServiceDTO, "_id" | "serviceId" | "serviceName" | "serviceDescription" | "servicePrice" | "isGroupService" | "maxParticipants" | "serviceExperience" | "serviceMode" | "serviceType" | "tags"> & Partial<Pick<ProviderServiceDTO, "videoUrl" | "requirements">>;
export type UpdateProviderServiceView = ProviderServiceByProviderIdView | null;










//// **** providerService usecase dtos **** ////

// get providers services input output
export type GetProvidersServicesInput = ProviderServiceByServiceIdsQuery;
export type GetProvidersServicesOutput = ProviderServiceByServiceIdsView;

// create provider service input
export type CreateProviderServiceInput = Pick<ProviderServiceDTO, "isGroupService" | "maxParticipants" | "providerId" | "requirements" | "serviceId" | "serviceDescription" | "serviceExperience" | "serviceMode" | "serviceName" | "servicePrice" | "serviceType" | "tags" | "videoUrl">;

// get provider service input and output
export interface GetProviderServiceInput {
    providerId: UserDTO["_id"];
    isUser: boolean;
}
export type GetProviderServiceOuput = ProviderServiceByProviderIdView | null;

// update provider service input and output
export type UpdateProviderServiceInput = Pick<ProviderServiceDTO, | "serviceId" | "serviceName" | "serviceDescription" | "servicePrice" | "isGroupService" | "maxParticipants" | "serviceExperience" | "serviceMode" | "serviceType" | "tags"> & Partial<Pick<ProviderServiceDTO, "videoUrl" | "requirements">> & {
    providerServiceId: ProviderServiceDTO["_id"];
};
export type UpdateProviderServiceOutput = ProviderServiceByProviderIdView | null;



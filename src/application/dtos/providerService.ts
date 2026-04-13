import { FindProviderServiceResponse, ProviderServiceDTO, ServiceDTO } from "./common.dto";

// provider create service request payload interface
export type CreateProviderServiceRequest = Pick<ProviderServiceDTO, "isGroupService" | "maxParticipants" | "providerId" | "requirements" | "service" | "serviceDescription" | "serviceExperience" | "serviceMode" | "serviceName" | "servicePrice" | "serviceType" | "tags" | "videoUrl">;

// admin / provider / user get service details use case request payload
export interface GetProviderServiceRequest {
    providerId: string;
    isUser: boolean;
}

// admin / provider get service details use case respomse interface
export type GetProviderServiceResponse = FindProviderServiceResponse | UserGetProviderServiceResponse | null;

// provider update service request payload interface
export type UpdateProviderServiceRequest = Pick<ProviderServiceDTO, "_id" | "service" | "serviceName" | "serviceDescription" | "servicePrice" | "isGroupService" | "maxParticipants" | "serviceExperience" | "serviceMode" | "serviceType" | "tags"> & Partial<Pick<ProviderServiceDTO, "videoUrl" | "requirements">>;

// provider update service response interface
export type UpdateProviderServiceResponse = FindProviderServiceResponse | null;

// user find provider service response interface
type FindProviderServiceProps = Pick<ProviderServiceDTO, "serviceName" | "serviceDescription" | "servicePrice" | "serviceExperience" | "videoUrl" | "serviceType" | "serviceMode" | "requirements" | "maxParticipants" | "isGroupService">;
export interface UserFindProviderServiceResponse extends FindProviderServiceProps {
    service: Pick<ServiceDTO, "serviceName">
}

// user get service details use case respomse interface
export type UserGetProviderServiceResponse = UserFindProviderServiceResponse | null;
import { ServiceMode, ServiceType } from "../enums/service.enum";

export interface ProviderServiceProps {
    _id: string,
    providerId: string,
    serviceId: string,
    serviceName: string,
    serviceDescription: string,
    servicePrice: number,
    serviceExperience: string,
    serviceType: ServiceType,
    serviceMode: ServiceMode,
    tags: string[] | [],
    requirements: string | null,
    videoUrl: string | null,
    maxParticipants: number,
    isGroupService: boolean,
    createdAt: Date,
    updatedAt: Date,
}
import { ServiceMode } from "../enums/serviceMode.enum";
import { ServiceType } from "../enums/serviceType.enum";

export interface ProviderServiceProps {
    _id: string,
    providerId: string,
    service: string,
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
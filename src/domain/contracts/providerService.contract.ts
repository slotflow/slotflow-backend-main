import { ServiceMode, ServiceType } from "../enums/service.enum";

export interface ProviderServiceProps {
    _id: string,
    providerId: string,
    serviceId: string, // application listing service id
    serviceName: string,
    serviceDescription: string,
    servicePrice: number,
    serviceExperienceYears: number,
    serviceExperience: string,
    serviceType: ServiceType,
    serviceMode: ServiceMode,
    tags: string[] | [],
    requirements: string[] | [],
    videoUrl: string | null,
    portfolioUrl: string | null,
    maxParticipants: number,
    isGroupService: boolean,
    createdAt: Date,
    updatedAt: Date,
}
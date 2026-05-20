import { Types } from "mongoose";
import { IProviderService } from "../models/providerService.model";
import { ProviderService } from "../../domain/entities/providerService.entity";

export class ProviderServiceMapper {

    static toDomain(doc: IProviderService): ProviderService {
        return new ProviderService({
            _id: doc._id.toString(),
            providerId: doc.providerId.toString(),
            serviceId: doc.serviceId.toString(),
            serviceName: doc.serviceName,
            serviceDescription: doc.serviceDescription,
            servicePrice: doc.servicePrice,
            serviceExperienceYears: doc.serviceExperienceYears,
            serviceExperience: doc.serviceExperience,
            serviceType: doc.serviceType,
            serviceMode: doc.serviceMode,
            tags: doc.tags ?? [],
            requirements: doc.requirements ?? [],
            videoUrl: doc.videoUrl ?? null,
            portfolioUrl: doc.videoUrl ?? null,
            maxParticipants: doc.maxParticipants,
            isGroupService: doc.isGroupService,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static toPersistence(entity: ProviderService) {
        const props = entity.getProps();

        return {
            providerId: new Types.ObjectId(props.providerId),
            serviceId: new Types.ObjectId(props.serviceId),
            serviceName: props.serviceName,
            serviceDescription: props.serviceDescription,
            servicePrice: props.servicePrice,
            serviceExperienceYears: props.serviceExperienceYears,
            serviceExperience: props.serviceExperience,
            serviceType: props.serviceType,
            serviceMode: props.serviceMode,
            tags: props.tags,
            requirements: props.requirements,
            videoUrl: props.videoUrl,
            portfolioUrl: props.portfolioUrl,
            maxParticipants: props.maxParticipants,
            isGroupService: props.isGroupService,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}

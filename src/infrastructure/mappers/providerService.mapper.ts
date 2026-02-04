import { Types } from "mongoose";
import { ProviderService } from "../../domain/entities/providerService.entity";
import { IProviderService } from "../models/providerService.model";

export class ProviderServiceMapper {

    static toDomain(doc: IProviderService): ProviderService {
        return new ProviderService({
            _id: doc._id.toString(),
            providerId: doc.providerId.toString(),
            service: doc.service.toString(), // TODO app service id
            serviceName: doc.serviceName,
            serviceDescription: doc.serviceDescription,
            servicePrice: doc.servicePrice,
            serviceExperience: doc.serviceExperience,
            serviceType: doc.serviceType,
            serviceMode: doc.serviceMode,
            tags: doc.tags ?? [],
            requirements: doc.requirements ?? null,
            videoUrl: doc.videoUrl ?? null,
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
            service: new Types.ObjectId(props.service),  // TODO app service id
            serviceName: props.serviceName,
            serviceDescription: props.serviceDescription,
            servicePrice: props.servicePrice,
            serviceExperience: props.serviceExperience,
            serviceType: props.serviceType,
            serviceMode: props.serviceMode,
            tags: props.tags,
            requirements: props.requirements,
            videoUrl: props.videoUrl,
            maxParticipants: props.maxParticipants,
            isGroupService: props.isGroupService,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}

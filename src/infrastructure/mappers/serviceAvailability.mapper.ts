import { Types } from "mongoose";
import { IServiceAvailability } from "../models/serviceAvailability.model";
import { ServiceAvailability } from "../../domain/entities/serviceAvailability.entity";

export class ServiceAvailabilityMapper {

    static toDomain(doc: IServiceAvailability): ServiceAvailability {
        return new ServiceAvailability({
            _id: doc._id.toString(),
            availabilities: doc.availabilities,
            providerId: doc.providerId.toString(),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static toPersistence(entity: ServiceAvailability) {
        const props = entity.getProps();

        return {
            availabilities: props.availabilities,
            providerId: new Types.ObjectId(props.providerId),
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}

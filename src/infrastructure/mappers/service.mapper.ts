import { IService } from "../models/service.model";
import { Service } from "../../domain/entities/service.entity";

export class ServiceMapper {

    static toDomain(doc: IService): Service {
        return new Service({
            _id: doc._id.toString(),
            isBlocked: doc.isBlocked,
            serviceCategory: doc.serviceCategory,
            serviceName: doc.serviceName,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static toPersistence(entity: Service) {
        const props = entity.getProps();

        return {
            isBlocked: props.isBlocked,
            serviceCategory: props.serviceCategory,
            serviceName: props.serviceName,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}

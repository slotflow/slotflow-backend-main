import { ServiceModel } from "./service.model";
import { ServiceMapper } from "../../mappers/service.mapper";
import { Service } from "../../../domain/entities/service.entity";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";

export class ServiceRepositoryImpl implements IServiceRepository {

    async create(service: Service): Promise<Service> {
        const persistence = ServiceMapper.toPersistence(service);
        const created = await ServiceModel.create(persistence);
        return ServiceMapper.toDomain(created);
    };

    async findAll(page: number, limit: number): Promise<{ data: Array<Service>; totalPages: number; currentPage: number; totalCount: number; }> {
        const skip = (page - 1) * limit;
        const [services, totalCount] = await Promise.all([
            ServiceModel.find({}, {
                _id: 1,
                serviceName: 1,
                serviceCategory: 1,
                isBlocked: 1,
            }).skip(skip).limit(limit).lean(),
            ServiceModel.countDocuments(),
        ])
        const totalPages = Math.ceil(totalCount / limit);
        return {
            data: services.map(service => ServiceMapper.toDomain(service)),
            totalPages,
            currentPage: page,
            totalCount
        }
    }

    async findAllByCategory(categoryName: string): Promise<Array<Service> | null> {
        const services = await ServiceModel.find({
            serviceCategory: categoryName
        },
            {
                _id: 1,
                serviceName: 1,
            });
        return services ? services.map(service => ServiceMapper.toDomain(service)) : null;
    };

    async findById(serviceId: string): Promise<Service | null> {
        const service = await ServiceModel.findById(serviceId);
        return service ? ServiceMapper.toDomain(service) : null;
    };

    async findByName(serviceName: string): Promise<Service | null> {
        const service = await ServiceModel.findOne({
            serviceName
        });
        return service ? ServiceMapper.toDomain(service) : null;
    };

    async update(service: Service): Promise<Service> {
        const persistence = ServiceMapper.toPersistence(service);

        const updated = await ServiceModel.findByIdAndUpdate(
            service._id,
            persistence,
            { new: true }
        );

        if (!updated) {
            throw new Error("Service not found");
        };

        return ServiceMapper.toDomain(updated);
    };

    async findAllServiceNames(): Promise<Array<Service>> {
        const services = await ServiceModel.find({}, {
            _id: 1,
            serviceName: 1,
        });
        return services.map(service => ServiceMapper.toDomain(service));
    };

};
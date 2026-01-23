import { ServiceModel } from "../models/service.model";
import { ServiceMapper } from "../mappers/service.mapper";
import { Service } from "../../domain/entities/service.entity";
import { ServiceCategory } from "../../domain/enums/service.enum";
import { IServiceRepository } from "../../domain/interfaces/repositories/IService.repository";

export class ServiceRepositoryImpl implements IServiceRepository {

    async create(service: Service): Promise<Service> {
        const persistence = ServiceMapper.toPersistence(service);
        const doc = await ServiceModel.create(persistence);
        return ServiceMapper.toDomain(doc);
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

    async findAllByCategory(categories: ServiceCategory[]): Promise<Array<Service> | null> {
        const docs = await ServiceModel.find({
            serviceCategory: { $in: categories }
        },
            {
                _id: 1,
                serviceName: 1,
            });
        return docs ? docs.map(doc => ServiceMapper.toDomain(doc)) : null;
    };

    async findById(serviceId: string): Promise<Service | null> {
        const doc = await ServiceModel.findById(serviceId);
        return doc ? ServiceMapper.toDomain(doc) : null;
    };

    async findByName(serviceName: string): Promise<Service | null> {
        const doc = await ServiceModel.findOne({
            serviceName
        });
        return doc ? ServiceMapper.toDomain(doc) : null;
    };

    async update(service: Service): Promise<Service> {
        const persistence = ServiceMapper.toPersistence(service);

        const doc = await ServiceModel.findByIdAndUpdate(
            service._id,
            { $set: persistence },
            { new: true }
        );

        if (!doc) {
            throw new Error("Service not found");
        };

        return ServiceMapper.toDomain(doc);
    };

};
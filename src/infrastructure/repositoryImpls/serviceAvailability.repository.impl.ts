import { ClientSession } from 'mongoose';
import { ServiceAvailabilityModel } from '../models/serviceAvailability.model';
import { ServiceAvailabilityMapper } from '../mappers/serviceAvailability.mapper';
import { ServiceAvailability } from '../../domain/entities/serviceAvailability.entity';
import { IServiceAvailabilityRepository } from '../../domain/interfaces/repositories/IServiceAvailability.repository';

export class ServiceAvailabilityRepositoryImpl implements IServiceAvailabilityRepository {

    async create(serviceAvailability: ServiceAvailability, session?: ClientSession): Promise<ServiceAvailability | null> {
        const doc = await ServiceAvailabilityModel.create(
            [ServiceAvailabilityMapper.toPersistence(serviceAvailability)],
            { session }
        );
        return doc && doc.length > 0 ? ServiceAvailabilityMapper.toDomain(doc[0]) : null;
    };

    async deleteById(serviceAvailabilityId: string): Promise<boolean> {
        const doc = await ServiceAvailabilityModel.findByIdAndDelete(serviceAvailabilityId);
        return !!doc;
    };

    async findById(serviceAvailabilityId: string): Promise<ServiceAvailability | null> {
        const doc = await ServiceAvailabilityModel.findById(serviceAvailabilityId);
        return doc ? ServiceAvailabilityMapper.toDomain(doc) : null;
    };

    async update(serviceAvailability: ServiceAvailability, session?: ClientSession): Promise<ServiceAvailability | null> {
        const persistence = ServiceAvailabilityMapper.toPersistence(serviceAvailability);

        const doc = await ServiceAvailabilityModel.findByIdAndUpdate(
            serviceAvailability._id,
            { $set: persistence },
            { new: true, session }
        );

        return doc ? ServiceAvailabilityMapper.toDomain(doc) : null;
    };

};
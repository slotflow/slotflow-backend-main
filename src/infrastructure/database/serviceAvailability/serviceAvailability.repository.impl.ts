import { ServiceAvailabilityModel } from './serviceAvailability.model';
import { ServiceAvailabilityMapper } from '../../mappers/serviceAvailability.mapper';
import { ServiceAvailability } from '../../../domain/entities/serviceAvailability.entity';
import { IServiceAvailabilityRepository } from '../../../domain/interfaces/repositories/IServiceAvailability.repository';

export class ServiceAvailabilityRepositoryImpl implements IServiceAvailabilityRepository {

    async create(serviceAvailability: ServiceAvailability): Promise<ServiceAvailability> {
        const persistence = ServiceAvailabilityMapper.toPersistence(serviceAvailability);
        const created = await ServiceAvailabilityModel.create(persistence);
        return ServiceAvailabilityMapper.toDomain(created);
    };

    async deleteById(serviceAvailabilityId: string): Promise<boolean> {
        const doc = await ServiceAvailabilityModel.findByIdAndDelete(serviceAvailabilityId);
        return !!doc;
    };

    async findById(serviceAvailabilityId: string): Promise<ServiceAvailability | null> {
        const doc = await ServiceAvailabilityModel.findById(serviceAvailabilityId);
        return doc ? ServiceAvailabilityMapper.toDomain(doc) : null;
    };

    async update(serviceAvailability: ServiceAvailability, options?: { session?: any }): Promise<ServiceAvailability> {
        const persistence = ServiceAvailabilityMapper.toPersistence(serviceAvailability);

        const updated = await ServiceAvailabilityModel.findByIdAndUpdate(
            serviceAvailability._id,
            { $set: persistence },
            {
                new: true,
                session: options?.session,
            }
        );

        if (!updated) {
            throw new Error("Service availabiltiy not found");
        };

        return ServiceAvailabilityMapper.toDomain(updated);
    };

};
import { ServiceAvailability } from "../../entities/serviceAvailability.entity";

export interface IServiceAvailabilityRepository {

    create(serviceAvailability: ServiceAvailability): Promise<ServiceAvailability>;

    update(serviceAvailability: ServiceAvailability, options?: { session?: any }): Promise<ServiceAvailability>;

    findById(serviceAvailabilityId: string): Promise<ServiceAvailability | null>;

    deleteById(serviceAvailabilityId: string): Promise<boolean>;

}
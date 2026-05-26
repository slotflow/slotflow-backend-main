import { ClientSession } from "mongoose";
import { ServiceAvailability } from "../../entities/serviceAvailability.entity";

export interface IServiceAvailabilityRepository {

    create(serviceAvailability: ServiceAvailability, session?: ClientSession): Promise<ServiceAvailability | null>;

    update(serviceAvailability: ServiceAvailability, session?: ClientSession): Promise<ServiceAvailability | null>;

    findById(serviceAvailabilityId: string): Promise<ServiceAvailability | null>;

    deleteById(serviceAvailabilityId: string): Promise<boolean>;

}
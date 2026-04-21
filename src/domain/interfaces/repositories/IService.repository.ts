import { Service } from "../../entities/service.entity";
import { ServiceCategory } from "../../enums/service.enum";

export interface IServiceRepository {

    create(service: Service): Promise<Service>;

    findById(serviceId: string): Promise<Service | null>;

    update(service: Service): Promise<Service | null>;

    findAll(page: number, limit: number): Promise<{ data: Array<Service>, totalPages: number; currentPage: number; totalCount: number; }>;

    findByName(serviceName: string): Promise<Service | null>;

    findAllByCategory(categories: ServiceCategory[]): Promise<Array<Service> | null>;

}
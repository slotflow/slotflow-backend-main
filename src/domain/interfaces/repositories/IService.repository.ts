import { Service } from "../../entities/service.entity";

export interface IServiceRepository {

    create(service: Service): Promise<Service>;

    findById(serviceId: string): Promise<Service | null>;

    update(service: Service): Promise<Service>;

    findAll(page: number, limit: number): Promise<{ data: Array<Service>, totalPages: number; currentPage: number; totalCount: number; }>;

    findByName(serviceName: string): Promise<Service | null>;

    findAllByCategory(categoryName: string): Promise<Array<Service> | null>;

    findAllServiceNames(): Promise<Array<Service>>;
}
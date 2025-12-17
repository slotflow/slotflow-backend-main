import { Types } from "mongoose";
import { Service } from "../../entities/service.entity";
import { AdminAddServiceRequest, AdminServiceListResponse } from "../../../application/dtos/admin.dto";
import { ApiPaginationRequest, ApiResponse, FetchAllAppServicesResponse } from "../../../application/dtos/common.dto";

export interface IServiceRepository {
    createService(payload: AdminAddServiceRequest): Promise<Service | null>;

    findAllServices({ page, limit }: ApiPaginationRequest): Promise<ApiResponse<AdminServiceListResponse>>;
    
    findServiceByName(serviceName: string): Promise<Service | null>;

    findServiceById(serviceId: Types.ObjectId): Promise<Service | null>;

    updateService(serviceId: Types.ObjectId, service: Service): Promise<Service | null>;

    findAllServiceNames(): Promise<FetchAllAppServicesResponse>;

    findAllServicesByCategory(serviceCategory: Service["serviceCategory"]): Promise<FetchAllAppServicesResponse>;
}
import { ApiPaginationRequest, ServiceDTO } from "./common.dto";

export interface GetServiceRequest extends ApiPaginationRequest {
    
}

export type GetServiceResponse = Array<Pick<ServiceDTO, "_id" | "serviceName" | "isBlocked" | "serviceCategory">>;


export type CreateServiceRequest = Pick<ServiceDTO, "serviceName" | "serviceCategory">;


export interface ChangeServiceBlockStatusRequest {
    serviceId: ServiceDTO["_id"];
    isBlocked: ServiceDTO["isBlocked"];
};
export type ChangeServiceBlockStatusResponse = ChangeServiceBlockStatusRequest;

export interface GetServicesByCategoryRequest {
  categories: Array<ServiceDTO["serviceCategory"]>;
};
export type GetServicesByCategoryResponse = Array<Pick<ServiceDTO, "_id" | "serviceName">> | null;

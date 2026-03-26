import { ApiPaginationRequest, ServiceDTO } from "./common.dto";

// get service details use case request payload
export interface GetServiceRequest extends ApiPaginationRequest {
    
}

// get service details use case respomse interface
export type GetServiceResponse = Array<Pick<ServiceDTO, "_id" | "serviceName" | "isBlocked" | "serviceCategory">>;

// create service request payload interface
export type CreateServiceRequest = Pick<ServiceDTO, "serviceName" | "serviceCategory">;

// change service block status request payload interface
export interface ChangeServiceBlockStatusRequest {
    serviceId: ServiceDTO["_id"];
    isBlocked: ServiceDTO["isBlocked"];
};

// change service block status response interface
export type ChangeServiceBlockStatusResponse = ChangeServiceBlockStatusRequest;

// get services by category request payload interface
export interface GetServicesByCategoryRequest {
  categories: Array<ServiceDTO["serviceCategory"]>;
};

// get services by category response interface
export type GetServicesByCategoryResponse = Array<Pick<ServiceDTO, "_id" | "serviceName">> | null;

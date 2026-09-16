import { ApiPaginationInput, ServiceDTO } from "./common.dto";

//// **** service dtos **** ////

// Get service
export interface GetServiceInput extends ApiPaginationInput { }
export type GetServiceOutput = Array<Pick<ServiceDTO, "_id" | "serviceName" | "isBlocked" | "serviceCategory">> | [];


// Create service
export type CreateServiceInput = Pick<ServiceDTO, "serviceName" | "serviceCategory">;
export type CreateServicesInput = {
  serviceCategory: ServiceDTO["serviceCategory"];
  serviceNames: string[];
};


// Change service block status
export type ChangeServiceBlockStatusInput = {
  serviceId: ServiceDTO["_id"];
} & Pick<ServiceDTO, 'isBlocked'>;
export type ChangeServiceBlockStatusOutput = Pick<ServiceDTO, "_id" | "isBlocked">


// Get services by category
export interface GetServicesByCategoryInput {
  categories: Array<ServiceDTO["serviceCategory"]>;
};
export type GetServicesByCategoryOutput = Array<Pick<ServiceDTO, "_id" | "serviceName">> | null;


// Update service
export type UpdateServiceInput = {
  serviceId: ServiceDTO["_id"];
} & Pick<ServiceDTO, 'serviceCategory' | 'isBlocked' | 'serviceName'>;
export type UpdateServiceOutput = Pick<ServiceDTO, '_id' | 'serviceCategory' | 'isBlocked' | 'serviceName'>;

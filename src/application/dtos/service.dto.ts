import { ApiPaginationInput, ServiceDTO } from "./common.dto";

//// **** service dtos **** ////

// GetService usecase input output
export interface GetServiceInput extends ApiPaginationInput { }
export type GetServiceOutput = Array<Pick<ServiceDTO, "_id" | "serviceName" | "isBlocked" | "serviceCategory">>;

// CreateService usecase input
export type CreateServiceInput = Pick<ServiceDTO, "serviceName" | "serviceCategory">;

// ChangeServiceBlockStatus usecase input output
export interface ChangeServiceBlockStatusInput {
  serviceId: ServiceDTO["_id"];
  isBlocked: ServiceDTO["isBlocked"];
};
export type ChangeServiceBlockStatusOutput = ChangeServiceBlockStatusInput;

// GetServicesByCategory usecase input output
export interface GetServicesByCategoryInput {
  categories: Array<ServiceDTO["serviceCategory"]>;
};
export type GetServicesByCategoryOutput = Array<Pick<ServiceDTO, "_id" | "serviceName">> | null;

import { ApiPaginationInput } from "./common.dto";
import { ServiceProps } from "../../domain/contracts/service.contract";

/**
 * Service usecase dtos
 */

// Get service
export interface GetServiceInput extends ApiPaginationInput { }
export type GetServiceOutput = Array<Pick<ServiceProps, "_id" | "serviceName" | "isBlocked" | "serviceCategory">> | [];


// Create service
export type CreateServiceInput = Pick<ServiceProps, "serviceName" | "serviceCategory">;
export type CreateServicesInput = {
  serviceCategory: ServiceProps["serviceCategory"];
  serviceNames: string[];
};
export type CreateServicesOutput = Array<Pick<ServiceProps, "serviceCategory" | "serviceName" | "_id" | "isBlocked">> 


// Change service block status
export type ChangeServiceBlockStatusInput = {
  serviceId: ServiceProps["_id"];
} & Pick<ServiceProps, 'isBlocked'>;
export type ChangeServiceBlockStatusOutput = Pick<ServiceProps, "_id" | "isBlocked">


// Get services by category
export interface GetServicesByCategoryInput {
  categories: Array<ServiceProps["serviceCategory"]>;
};
export type GetServicesByCategoryOutput = Array<Pick<ServiceProps, "_id" | "serviceName">> | null;


// Update service
export type UpdateServiceInput = {
  serviceId: ServiceProps["_id"];
} & Pick<ServiceProps, 'serviceCategory' | 'isBlocked' | 'serviceName'>;
export type UpdateServiceOutput = Pick<ServiceProps, '_id' | 'serviceCategory' | 'isBlocked' | 'serviceName'>;

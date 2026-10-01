import { UserProps } from "../../domain/contracts/user.contract";
import { ServiceAvailabilityProps } from "../../domain/contracts/serviceAvailability.contract";
import { FrontendAvailabilityForOutput, FrontendAvailabilityForClientInput } from "./common.dto";

/**
 * service availability queries dtos
 */

// findByProviderId method 
export type ServiceAvailabilityQuery = {
    providerId?: UserProps["_id"];
    availabilityId?: ServiceAvailabilityProps["_id"];
    date: string | Date;
}
export type ServiceAvailabilityView = FrontendAvailabilityForOutput | null;





/**
 * service availability usecase dtos
 */

// get provider service availability 
export interface GetServiceAvailabilityInput {
    providerId: string;
    date: Date;
}
export type GetServiceAvailabilityOutput = FrontendAvailabilityForOutput | null;


// create service availability 
export interface CreateServiceAvailabilityInput {
    providerId: string;
    availabilities: FrontendAvailabilityForClientInput[]
}
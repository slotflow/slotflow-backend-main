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
    timeZone: string;
}
export type ServiceAvailabilityView = FrontendAvailabilityForOutput | null;





/**
 * service availability usecase dtos
 */

// get provider service availability 
export interface GetServiceAvailabilityInput {
    date: string;
    providerId: string;
}
export type GetServiceAvailabilityOutput = FrontendAvailabilityForOutput | null;


// create service availability 
export interface CreateServiceAvailabilityInput {
    providerId: string;
    timeZone: string;
    availabilities: FrontendAvailabilityForClientInput[]
}
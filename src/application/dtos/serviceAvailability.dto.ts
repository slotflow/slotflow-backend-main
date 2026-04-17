import { FrontendAvailabilityForOutput, FrontendAvailabilityForClientInput, ServiceAvailabilityDTO, UserDTO } from "./common.dto";

//// **** service availability queries parameter and return **** ////

// 1. findByProviderId method parameter and return
export type ServiceAvailabilityQuery = {
    providerId?: UserDTO["_id"];
    availabilityId?: ServiceAvailabilityDTO["_id"];
    date: Date;
}
export type ServiceAvailabilityView = FrontendAvailabilityForOutput | null;










//// **** service availability usecase input output **** ////

// get provider service availability input output
export interface GetServiceAvailabilityInput {
    providerId: string;
    date: Date;
}
export type GetServiceAvailabilityOutput = FrontendAvailabilityForOutput | null;

// create service availability input
export interface CreateServiceAvailabilityInput {
    providerId: string;
    availabilities: FrontendAvailabilityForClientInput[]
}
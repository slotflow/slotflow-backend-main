import { FontendAvailabilityForResponse, FrontendAvailabilityForRequest } from "./common.dto";

// get provider service availability use case request payload interface
export interface GetServiceAvailabilityRequest {
    providerId: string;
    date: Date;
}

// get provider service availability use case response interface
export type GetServiceAvailabilityResponse = FontendAvailabilityForResponse | null;

// create service availability request payload interface
export interface CreateServiceAvailabilityRewuest {
    providerId: string;
    availabilities: FrontendAvailabilityForRequest[]
}
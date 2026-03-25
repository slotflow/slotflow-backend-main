import { FontendAvailabilityForResponse, FrontendAvailabilityForRequest } from "./common.dto";

// fetch provider service availability use case request payload interface
export interface FetchServiceAvailabilityRequest {
    providerId: string;
    date: Date;
}

// fetch provider service availability use case response interface
export type FetchServiceAvailabilityResponse = FontendAvailabilityForResponse | null;

export interface CreateServiceAvailabilityRewuest {
    providerId: string;
    availabilities: FrontendAvailabilityForRequest[]
}
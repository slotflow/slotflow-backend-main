import { FontendAvailabilityForResponse } from "../dtos/common.dto";

export interface IServiceAvailabilityQueries {

    findByProviderId(date: Date, availabilityId: string): Promise<FontendAvailabilityForResponse | null>;

};
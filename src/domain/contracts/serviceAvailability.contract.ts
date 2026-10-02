import { Availability } from "../commands/serviceAvailability.commands";

export interface ServiceAvailabilityProps {
    _id: string,
    providerId: string,
    timeZone: string;
    availabilities: Availability[],
    createdAt: Date,
    updatedAt: Date,
};
import { Day } from "../enums/common.enum";
import { ServiceMode } from "../enums/service.enum";
import { ServiceAvailabilityProps } from "../contracts/serviceAvailability.contract";

export interface TimeSlot {
    time: string,
};

export interface Availability {
    day: Day,
    isAvailable: boolean,
    duration?: number,
    startTime?: string,
    endTime?: string,
    modes?: ServiceMode[],
    slots?: TimeSlot[],
};

export type CreateServiceAvailabilityProps = Omit<ServiceAvailabilityProps, "_id" | "createdAt" | "updatedAt">;

export type UpdateServiceAvailabilityProps = Omit<ServiceAvailabilityProps, "_id" | "createdAt" | "updatedAt">;

import { Day } from "../enums/day.enum";
import { ServiceMode } from "../enums/serviceMode.enum";

export interface TimeSlot {
    time: string,
};

export interface TimeSlotForFrontendResponse {
    _id: string,
    time: string,
    available: boolean,
};

export interface Availability {
    day: Day,
    duration: number,
    startTime: string,
    endTime: string,
    modes: ServiceMode[],
    slots: TimeSlot[],
};

export interface ServiceAvailabilityProps {
    _id: string,
    providerId: string,
    availabilities: Availability[],
    createdAt: Date,
    updatedAt: Date,
};
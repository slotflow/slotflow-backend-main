import { Day } from "../enums/common.enum";
import { ServiceMode } from "../enums/service.enum";

export interface TimeSlot {
    time: string,
};

export interface TimeSlotForClientOutput {
    _id: string,
    time: string,
    available: boolean,
    occupied?: boolean,
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
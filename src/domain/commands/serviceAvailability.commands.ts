import { Availability, ServiceAvailabilityProps } from "../contracts/serviceAvailability.contract";

export type CreateServiceAvailabilityProps = Omit<ServiceAvailabilityProps, "_id" | "createdAt" | "updatedAt">;

export type UpdateServiceAvailabilityProps = Omit<ServiceAvailabilityProps, "_id" | "createdAt" | "updatedAt">;

import { ServiceCategory } from "../enums/service.enum";

export interface ServiceProps {
    _id: string,
    serviceName: string,
    serviceCategory: ServiceCategory,
    isBlocked: boolean,
    createdAt: Date,
    updatedAt: Date,
}
import { ServiceCategory } from "../enums/serviceCategories.enum";

export interface ServiceProps {
    _id: string,
    serviceName: string,
    serviceCategory: ServiceCategory,
    isBlocked: boolean,
    createdAt: Date,
    updatedAt: Date,
}
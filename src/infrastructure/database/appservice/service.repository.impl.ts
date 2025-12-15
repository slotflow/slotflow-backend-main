import { Types } from "mongoose";
import { IService, ServiceModel } from "./service.model";
import { AdminAddServiceRequest, AdminServiceListResponse } from "../../dtos/admin.dto";
import { Service } from "../../../domain/entities/service.entity";
import { IServiceRepository } from "../../../domain/interfaces/repositories/IService.repository";
import { ApiPaginationRequest, ApiResponse, FetchAllAppServicesResponse } from "../../dtos/common.dto";

export class ServiceRepositoryImpl implements IServiceRepository {
    private mapToEntity(service: IService): Service {
        return new Service(
            service._id,
            service.serviceName,
            service.serviceCategory,
            service.isBlocked,
            service.createdAt,
            service.updatedAt,
        )
    }

    async createService(payload: AdminAddServiceRequest): Promise<Service | null> {
        try {
            const createdService = await ServiceModel.create({ ...payload });
            return createdService ? this.mapToEntity(createdService) : null;
        } catch (error) {
            console.log("createService error : ", error);
            throw new Error("Failed to create application service");
        }
    }

    async findServiceByName(serviceName: string): Promise<Service | null> {
        try {
            const existingService = await ServiceModel.findOne({ serviceName: serviceName });
            return existingService ? this.mapToEntity(existingService) : null;
        } catch (error) {
            console.log("findServiceByName error : ", error);
            throw new Error("Failed to find application service by name");
        }
    }

    async findAllServices({ page, limit }: ApiPaginationRequest): Promise<ApiResponse<AdminServiceListResponse>> {
        try {
            const skip = (page - 1) * limit;
            const [services, totalCount] = await Promise.all([
                ServiceModel.find({}, {
                    _id: 1,
                    serviceName: 1,
                    serviceCategory: 1,
                    isBlocked: 1,
                }).skip(skip).limit(limit).lean(),
                ServiceModel.countDocuments(),
            ])
            const totalPages = Math.ceil(totalCount / limit);
            return {
                data: services.map(this.mapToEntity),
                totalPages,
                currentPage: page,
                totalCount
            }
        } catch (error) {
            console.log("findAllServices error : ", error);
            throw new Error("Failed to find all application services");
        }
    }

    async findServiceById(serviceId: Types.ObjectId): Promise<Service | null> {
        try {
            const service = await ServiceModel.findById(serviceId);
            return service ? this.mapToEntity(service) : null;
        } catch (error) {
            console.log("findServiceById error : ", error);
            throw new Error("Failed to fnind application service by id");
        }
    }

    async updateService(serviceId: Types.ObjectId, service: Service): Promise<Service | null> {
        try {
            const updatedService = await ServiceModel.findOneAndUpdate(serviceId, service, { new: true });
            return updatedService ? this.mapToEntity(updatedService) : null;
        } catch (error) {
            console.log("updateService error : ", error);
            throw new Error("Failed to update application service");
        }
    }

    async findAllServiceNames(): Promise<FetchAllAppServicesResponse> {
        try {
            const services = await ServiceModel.find({}, {
                _id: 1,
                serviceName: 1,
            });
            return services.map(this.mapToEntity);
        } catch (error) {
            console.log("findAllServiceNames error : ", error);
            throw new Error("Failed to find all application services by name");
        }
    }

    async findAllServicesByCategory(serviceCategory: Service["serviceCategory"]): Promise<FetchAllAppServicesResponse> {
        try {
            const services = await ServiceModel.find({
                serviceCategory
            }, {
                _id: 1,
                serviceName: 1,
            });
            return services.map(this.mapToEntity);
        } catch (error) {
            console.log("findAllServicesByCategory error : ", error);
            throw new Error("Failed to find all application services by category");
        }
    }
}
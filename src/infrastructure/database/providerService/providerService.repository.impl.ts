import { Types } from "mongoose";
import { subscriptionStatusArray } from "../../../shared/utils/constants";
import { IProviderService, ProviderServiceModel } from "./providerService.model";
import { ProviderService } from "../../../domain/entities/providerService.entity";
import { ProviderUpdateProviderServiceRequest, ProviderUpdateProviderServiceResponse } from "../../dtos/provider.dto";
import { CreateProviderServiceRequest, FindProviderServiceResponse, FindProvidersUsingServiceIdsResponse, IProviderServiceRepository } from "../../../domain/interfaces/repositories/IProviderService.repository";

export class ProviderServiceRepositoryImpl implements IProviderServiceRepository {
    private mapToEntity(providerService: IProviderService): ProviderService {
        return new ProviderService(
            providerService._id,
            providerService.providerId,
            providerService.service,
            providerService.serviceName,
            providerService.serviceDescription,
            providerService.servicePrice,
            providerService.serviceExperience,
            providerService.requirements,
            providerService.serviceType,
            providerService.serviceMode,
            providerService.tags,
            providerService.videoUrl,
            providerService.maxParticipants,
            providerService.isGroupService,
            providerService.createdAt,
            providerService.updatedAt
        );
    }

    async createProviderService(payload: CreateProviderServiceRequest): Promise<ProviderService | null> {
        try {
            const newProviderService = await ProviderServiceModel.create(payload);
            return newProviderService ? this.mapToEntity(newProviderService) : null;
        } catch (error) {
            console.log("createProviderService error : ", error);
            throw new Error("Failed to create provider service");
        }
    }

    async findProviderServiceByProviderId(providerId: Types.ObjectId): Promise<FindProviderServiceResponse | {}> {
        try {
            const service = await ProviderServiceModel.findOne({ providerId })
                .populate({
                    path: "service",
                    select: "-_id serviceName"
                }).lean();
            return service || {};
        } catch (error) {
            console.log("findProviderServiceByProviderId error : ", error);
            throw new Error("Failed to find provider service");
        }
    }

    async findProvidersUsingServiceIds(serviceIds: Types.ObjectId[]): Promise<Array<FindProvidersUsingServiceIdsResponse> | []> {
        console.log("serviceIds : ", serviceIds);
        try {
            const pipeline: any[] = [];
            const now = new Date();

            if (serviceIds.length > 0) {
                pipeline.push({
                    $match: {
                        service: { $in: serviceIds }
                    }
                });
            }

            pipeline.push(
                {
                    $lookup: {
                        from: "providers",
                        let: { providerId: "$providerId" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$_id", "$$providerId"] },
                                            { $eq: ["$isAdminVerified", true] },
                                            { $eq: ["$isBlocked", false] },
                                            { $eq: ["$isEmailVerified", true] },
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "provider"
                    }
                },
                { $unwind: "$provider" },
                {
                    $lookup: {
                        from: "subscriptions",
                        let: { providerId: "$provider._id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$providerId", "$$providerId"] },
                                            { $eq: ["$subscriptionStatus", subscriptionStatusArray[0]] },
                                            { $gt: ["$endDate", now] },
                                        ]
                                    }
                                }
                            },
                            { $sort: { endDate: -1 } },
                            { $limit: 1 }
                        ],
                        as: "activeSubscription"
                    }
                },
                {
                    $unwind: "$activeSubscription"
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "service",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                { $unwind: "$category" },
                {
                    $project: {
                        provider: {
                            _id: '$provider._id',
                            username: '$provider.username',
                            profileImage: '$provider.profileImage',
                            trustedBySlotflow: '$provider.trustedBySlotflow'
                        },
                        serviceDerails: {
                            serviceId: "$service",
                            service: "$category.serviceName",
                            serviceCategory: "$category.serviceCategory",
                            serviceName: "$serviceName",
                            servicePrice: "$servicePrice",
                        },
                    }
                }
            );

            const providers = await ProviderServiceModel.aggregate(pipeline);
            console.log("providers : ", providers);
            return providers;
        } catch (error) {
            console.log("findProvidersUsingServiceIds error : ", error);
            throw new Error("Failed to find providers");
        }
    }

    async updateProviderServiceDetails(payload: ProviderUpdateProviderServiceRequest): Promise<ProviderUpdateProviderServiceResponse | null> {
        try {
            const { serviceId, ...data } = payload;
            const service = await ProviderServiceModel.findOneAndUpdate(
                    { _id: serviceId },
                    { $set: { ...data } },
                    { new: true }
                )
                .populate({
                    path: "service",
                    select: "-_id serviceName",
                })
                .lean<ProviderUpdateProviderServiceResponse>();
            return service || null;
        } catch (error) {
            console.log("updateProviderServiceDetails error : ", error);
            throw new Error("Failed to update provider service details");
        }
    }

}
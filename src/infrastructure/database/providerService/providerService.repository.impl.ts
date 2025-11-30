import { Types } from "mongoose";
import { IProviderService, ProviderServiceModel } from "./providerService.model";
import { ProviderService } from "../../../domain/entities/providerService.entity";
import { SubscriptionStatus } from "../../../domain/entities/subscription.entity";
import { CreateProviderServiceRequest, FindProviderServiceResponse, FindProvidersUsingServiceCategoryIdsResponse, IProviderServiceRepository } from "../../../domain/repositories/IProviderService.repository";

export class ProviderServiceRepositoryImpl implements IProviderServiceRepository {
    private mapToEntity(providerService: IProviderService): ProviderService {
        return new ProviderService(
            providerService._id,
            providerService.providerId,
            providerService.serviceCategory,
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

    async createProviderService(providerService: CreateProviderServiceRequest): Promise<ProviderService | null> {
        try {
            const newProviderService = await ProviderServiceModel.create(providerService);
            return newProviderService ? this.mapToEntity(newProviderService) : null;
        } catch (error) {
            console.log("createProviderService error : ",error);
            throw new Error("Failed to create provider service");
        }
    }

    async findProviderServiceByProviderId(providerId: Types.ObjectId): Promise<FindProviderServiceResponse | {}> {
        try {
            const service = await ProviderServiceModel.findOne({ providerId })
                .populate({
                    path: "serviceCategory",
                    select: "-_id serviceName"
                }).lean();
            return service || {};
        } catch (error) {
            console.log("findProviderServiceByProviderId error : ",error);
            throw new Error("Failed to find provider service");
        }
    }

    async findProvidersUsingServiceCategoryIds(serviceCategoryIds: Types.ObjectId[]): Promise<Array<FindProvidersUsingServiceCategoryIdsResponse> | []> {
        try {
            const pipeline: any[] = [];
            const now = new Date();

            if (serviceCategoryIds.length > 0) {
                pipeline.push({
                    $match: {
                        serviceCategory: { $in: serviceCategoryIds }
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
                                            { $eq: ["$subscriptionStatus", SubscriptionStatus.Active] },
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
                        localField: "serviceCategory",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                { $unwind: "$category" },
                {
                    $project: {
                        service: {
                            serviceCategory: "$serviceCategory",
                            serviceName: "$serviceName",
                            servicePrice: "$servicePrice",
                            categoryName: "$category.serviceName"
                        },
                        provider: {
                            _id: '$provider._id',
                            username: '$provider.username',
                            profileImage: '$provider.profileImage',
                            trustedBySlotflow: '$provider.trustedBySlotflow'
                        }
                    }
                }
            );
            const providers = await ProviderServiceModel.aggregate(pipeline);
            return providers;
        } catch (error) {
            console.log("findProvidersUsingServiceCategoryIds error : ",error);
            throw new Error("Failed to find providers");
        }
    }

}
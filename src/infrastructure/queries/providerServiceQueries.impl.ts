import { Types } from "mongoose";
import { SubscriptionStatus } from "../../domain/enums/subscriptionStatus.enum";
import { FindProviderServiceResponse } from "../../application/dtos/common.dto";
import { ProviderServiceModel } from "../database/providerService/providerService.model";
import { IProviderServiceQueries } from "../../application/queries/IProviderService.queries";
import { ProviderUpdateProviderServiceRequest, ProviderUpdateProviderServiceResponse } from "../../application/dtos/provider.dto";
import { UserFetchServiceProvidersResponse } from "../../application/dtos/user.dto";

export class ProviderServiceQueriesImpl implements IProviderServiceQueries {

    async findByProviderId(providerId: string): Promise<FindProviderServiceResponse | null> {
        const service = await ProviderServiceModel.findOne({ providerId })
            .populate({
                path: "service",
                select: "-_id serviceName"
            }).lean();

        if (!service) return null;
        return {
            ...service,
            _id: service._id.toString(),
            providerId: service.providerId.toString(),
            service: {
                serviceName: service.serviceName
            }
        };
    };

    async findProvidersUsingServiceIds(serviceIds: string[]): Promise<Array<UserFetchServiceProvidersResponse> | []> {
        const pipeline: any[] = [];
        const now = new Date();

        if (serviceIds.length > 0) {
            pipeline.push({
                $match: {
                    service: { $in: serviceIds.map(id => new Types.ObjectId(id)) }
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
                    localField: "service",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $project: {
                    _id: 1,
                    provider: {
                        _id: "$provider._id",
                        username: "$provider.username",
                        profileImage: "$provider.profileImage",
                        trustedBySlotflow: "$provider.trustedBySlotflow"
                    },
                    serviceDetails: {
                        serviceId: "$service",
                        service: "$category.serviceName",
                        serviceCategory: "$category.serviceCategory",
                        serviceName: "$serviceName",
                        servicePrice: "$servicePrice",
                    }
                }
            }
        );

        const providers = await ProviderServiceModel.aggregate(pipeline);
        return providers.map(p => ({
            _id: p._id.toString(),
            provider: {
                _id: p.provider._id.toString(),
                username: p.provider.username,
                profileImage: p.provider.profileImage ?? null,
                trustedBySlotflow: p.provider.trustedBySlotflow,
            },
            serviceDetails: {
                serviceId: p.serviceDetails.serviceId.toString(),
                service: p.serviceDetails.service,
                serviceCategory: p.serviceDetails.serviceCategory,
                serviceName: p.serviceDetails.serviceName,
                servicePrice: p.serviceDetails.servicePrice,
            }
        }));
    };

    async updateProviderService(payload: ProviderUpdateProviderServiceRequest): Promise<ProviderUpdateProviderServiceResponse | null> {
        const { _id, ...data } = payload;
        const service = await ProviderServiceModel.findOneAndUpdate(
            { _id: new Types.ObjectId(_id) },
            { $set: { ...data } },
            { new: true }
        )
            .populate({
                path: "service",
                select: "-_id serviceName",
            })
            .lean<ProviderUpdateProviderServiceResponse>();

        if (!service) return null;
        return {
            ...service,
            _id: service._id.toString(),
            service: {
                serviceName: service.service.serviceName
            }
        }
    };

}
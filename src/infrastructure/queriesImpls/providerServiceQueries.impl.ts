import { Types } from "mongoose";
import { PipelineStage } from "mongoose";
import { ProviderServiceModel } from "../models/providerService.model";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";
import { IProviderServiceQueries } from "../../application/queries/IProviderService.queries";
import { ProviderServiceByProviderIdQuery, ProviderServiceByProviderIdView, ProviderServiceByServiceIdsQuery, ProviderServiceByServiceIdsView, UpdateProviderServiceQuery, UpdateProviderServiceView } from "../../application/dtos/providerService.dto";

export class ProviderServiceQueriesImpl implements IProviderServiceQueries {

    async findByProviderId(query: ProviderServiceByProviderIdQuery): Promise<ProviderServiceByProviderIdView | null> {
        const { providerId } = query
        const service = await ProviderServiceModel.findOne({ providerId })
            .populate({
                path: "service",
                select: "-_id serviceName"
            }).lean<ProviderServiceByProviderIdView>();

        if (!service) return null;
        return {
            ...service,
            _id: service._id.toString(),
            providerId: service.providerId.toString(),
            service: {
                serviceName: service.service.serviceName
            },
        };
    };

    async findProvidersUsingServiceIds(query: ProviderServiceByServiceIdsQuery): Promise<ProviderServiceByServiceIdsView> {

        const pipeline: PipelineStage[] = [];
        const now = new Date();

        const {
            serviceIds,
            categories,
            location,
            maxPrice,
            minPrice,
            slotflowTrusted,
            radius = 5000,
            skip,
            limit
        } = query;

        const hasValidPriceRange =
            typeof minPrice === "number" &&
            typeof maxPrice === "number" &&
            minPrice >= 0 &&
            maxPrice > 0 &&
            minPrice <= maxPrice;

        if (serviceIds?.length) {
            pipeline.push({
                $match: {
                    service: { $in: serviceIds.map(id => new Types.ObjectId(id)) }
                }
            });
        }

        pipeline.push({
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
                                    ...(slotflowTrusted === true
                                        ? [{ $eq: ["$trustedBySlotflow", true] }]
                                        : [])
                                ]
                            }
                        }
                    }
                ],
                as: "provider"
            }
        });

        pipeline.push({ $unwind: "$provider" });

        pipeline.push(
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
                                        { $eq: ["$subscriptionStatus", SubscriptionStatus.ACTIVE] },
                                        { $gt: ["$endDate", now] }
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
            { $unwind: "$activeSubscription" }
        );

        if (hasValidPriceRange) {
            pipeline.push(
                {
                    $lookup: {
                        from: "providerServices",
                        let: { providerId: "$provider._id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$providerId", "$$providerId"] },
                                            { $lte: ["$servicePrice", maxPrice] },
                                            { $gte: ["$servicePrice", minPrice] }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "providerServices"
                    }
                },
                {
                    $match: {
                        $expr: { $gt: [{ $size: "$providerServices" }, 0] }
                    }
                }
            );
        }

        if (location?.coordinates?.length === 2) {
            pipeline.push(
                {
                    $lookup: {
                        from: "addresses",
                        let: { providerId: "$provider._id" },
                        pipeline: [
                            {
                                $geoNear: {
                                    near: location,
                                    distanceField: "distance",
                                    maxDistance: radius,
                                    spherical: true
                                }
                            },
                            {
                                $match: {
                                    $expr: { $eq: ["$userId", "$$providerId"] }
                                }
                            }
                        ],
                        as: "providerAddress"
                    }
                },
                {
                    $match: {
                        $expr: { $gt: [{ $size: "$providerAddress" }, 0] }
                    }
                }
            );
        }

        pipeline.push(
            {
                $lookup: {
                    from: "services",
                    localField: "service",
                    foreignField: "_id",
                    as: "serviceDetails"
                }
            },
            { $unwind: "$serviceDetails" }
        );

        if (categories?.length) {
            pipeline.push({
                $match: {
                    "serviceDetails.serviceCategory": { $in: categories }
                }
            });
        }

        pipeline.push({
            $project: {
                _id: 1,
                provider: {
                    _id: "$provider._id",
                    username: "$provider.username",
                    profileImage: "$provider.profileImage",
                    trustedBySlotflow: "$provider.trustedBySlotflow"
                },
                serviceDetails: {
                    serviceId: "$serviceDetails._id",
                    service: "$serviceDetails.serviceName",
                    serviceCategory: "$serviceDetails.serviceCategory",
                    serviceName: "$serviceName",
                    servicePrice: "$servicePrice"
                }
            }
        });

        if (skip) {
            pipeline.push({ $skip: skip });
        };

        if (limit) {
            pipeline.push({ $limit: limit });
        };

        const result = await ProviderServiceModel.aggregate(pipeline);

        return result.map(p => ({
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


    async updateProviderService(query: UpdateProviderServiceQuery): Promise<UpdateProviderServiceView> {
        const { _id, ...data } = query;
        const service = await ProviderServiceModel.findOneAndUpdate(
            { _id: new Types.ObjectId(_id) },
            { $set: { ...data } },
            { new: true }
        )
            .populate({
                path: "service",
                select: "-_id serviceName",
            })
            .lean<UpdateProviderServiceView>();

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
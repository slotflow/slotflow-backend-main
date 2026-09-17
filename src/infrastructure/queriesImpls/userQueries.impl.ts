import { Types } from "mongoose";
import { UserModel } from "../models/user.model";
import { Role } from "../../domain/enums/common.enum";
import { TableData } from "../../application/dtos/common.dto";
import { getStartAndEndDate } from "../../shared/utils/helpers/dateTime";
import { IUserQueries } from "../../application/queries/IUser.queries";
import { formatStatMetric } from "../../shared/utils/helpers/formatStatMetric";
import { calculatePreviousPeriod } from "../../shared/utils/helpers/calculatePreviosPeriod";
import { UserStatsDataQuery, UserStatsDataView, UsersQuery, UsersView, ProvidersQuery, ProvidersView, ProviderByIdQuery, ProviderByIdView, ProviderStatsDataQuery, ProviderStatsDataView, UserChartDataQuery, UserChartDataView } from "../../application/dtos/user.dto";

export class UserQueriesImpl implements IUserQueries {

    async findStats(query: UserStatsDataQuery): Promise<UserStatsDataView> {
        const { startDate, endDate } = getStartAndEndDate(query.startDate, query.endDate);
        const { previousStartDate, previousEndDate } = calculatePreviousPeriod(startDate, endDate);

        interface AggregationFacetResult {
            totalUsers: number;
            blockedUsers: number;
            newUsers: number;
            returningUsers: number;
        }

        interface AggregationResult {
            current: AggregationFacetResult[];
            previous: AggregationFacetResult[];
        }

        const [result] = await UserModel.aggregate<AggregationResult>([
            {
                $match: {
                    role: Role.USER,
                    $or: [
                        { createdAt: { $lte: endDate } },
                        { updatedAt: { $gte: previousStartDate, $lte: endDate } }
                    ]
                }
            },
            {
                $facet: {
                    current: [
                        {
                            $group: {
                                _id: null,
                                totalUsers: {
                                    $sum: {
                                        $cond: [
                                            { $and: [{ $gte: ['$createdAt', startDate] }, { $lte: ['$createdAt', endDate] }] },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                blockedUsers: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ['$isBlocked', true] },
                                                    { $gte: ['$createdAt', startDate] },
                                                    { $lte: ['$createdAt', endDate] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                newUsers: {
                                    $sum: {
                                        $cond: [
                                            { $and: [{ $gte: ['$createdAt', startDate] }, { $lte: ['$createdAt', endDate] }] },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                returningUsers: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $lt: ['$createdAt', startDate] },
                                                    { $gte: ['$updatedAt', startDate] },
                                                    { $lte: ['$updatedAt', endDate] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    previous: [
                        {
                            $group: {
                                _id: null,
                                totalUsers: {
                                    $sum: {
                                        $cond: [
                                            { $and: [{ $gte: ['$createdAt', previousStartDate] }, { $lte: ['$createdAt', previousEndDate] }] },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                blockedUsers: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ['$isBlocked', true] },
                                                    { $gte: ['$createdAt', previousStartDate] },
                                                    { $lte: ['$createdAt', previousEndDate] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                newUsers: {
                                    $sum: {
                                        $cond: [
                                            { $and: [{ $gte: ['$createdAt', previousStartDate] }, { $lte: ['$createdAt', previousEndDate] }] },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                returningUsers: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $lt: ['$createdAt', previousStartDate] },
                                                    { $gte: ['$updatedAt', previousStartDate] },
                                                    { $lte: ['$updatedAt', previousEndDate] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        const defaultStats: AggregationFacetResult = {
            totalUsers: 0,
            blockedUsers: 0,
            newUsers: 0,
            returningUsers: 0,
        };

        const current = result?.current[0] || defaultStats;
        const previous = result?.previous[0] || defaultStats;

        return {
            totalUsers: formatStatMetric(current.totalUsers, previous.totalUsers),
            blockedUsers: formatStatMetric(current.blockedUsers, previous.blockedUsers),
            NewUsers: formatStatMetric(current.newUsers, previous.newUsers),
            ReturningUsers: formatStatMetric(current.returningUsers, previous.returningUsers),
        };
    }

    async findUsers(query: UsersQuery): Promise<TableData<UsersView>> {
        const { page, limit } = query;
        const skip = (page - 1) * limit;
        const [users, totalCount] = await Promise.all([
            UserModel.find({
                role: Role.USER
            }, {
                _id: 1,
                username: 1,
                email: 1,
                isBlocked: 1,
            }).skip(skip).limit(limit).lean<UsersView>(),
            UserModel.countDocuments(),

        ])
        const totalPages = Math.ceil(totalCount / limit);
        return {
            items: users.map(user => ({
                ...user,
                _id: user._id.toString(),
            })),
            totalPages,
            currentPage: page,
            totalCount
        }
    }

    async findProviders(query: ProvidersQuery): Promise<TableData<ProvidersView>> {
        const { page, limit } = query;
        const skip = (page - 1) * limit;
        const [providers, totalCountResult] = await Promise.all([
            UserModel.aggregate([
                {
                    $match: {
                        $or: [{
                            role: Role.PROVIDER,
                        },
                        {
                            onboardingType: Role.PROVIDER
                        }
                        ]
                    },
                },
                {
                    $lookup: {
                        from: "providerprofiles",
                        localField: "_id",
                        foreignField: "userId",
                        as: "profile",
                    },
                },
                {
                    $unwind: {
                        path: "$profile",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        _id: { $toString: "$_id" },
                        username: 1,
                        email: 1,
                        isBlocked: 1,
                        adminVerificationStatus: "$profile.adminVerificationStatus",
                        isAdminVerified: "$profile.isAdminVerified",
                        trustedBySlotflow: "$profile.trustedBySlotflow",
                    },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
            ]),

            UserModel.aggregate([
                {
                    $match: {
                        role: Role.PROVIDER,
                    },
                },
                {
                    $count: "totalCount",
                },
            ]),
        ]);

        const totalCount = totalCountResult[0]?.totalCount || 0;
        const totalPages = Math.ceil(totalCount / limit);

        return {
            items: providers.map(provider => ({
                ...provider,
                _id: provider._id.toString(),
            })),
            totalPages,
            currentPage: page,
            totalCount,
        };
    }

    async findProviderById(query: ProviderByIdQuery): Promise<ProviderByIdView> {
        const { providerId } = query;
        const result = await UserModel.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(providerId),
                },
            },
            {
                $lookup: {
                    from: "providerprofiles",
                    localField: "_id",
                    foreignField: "userId",
                    as: "profile",
                },
            },
            {
                $unwind: {
                    path: "$profile",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    username: 1,
                    email: 1,
                    profileImage: 1,
                    isBlocked: 1,
                    phone: 1,
                    createdAt: 1,
                    referralCode: 1,
                    isAdminVerified: "$profile.isAdminVerified",
                    trustedBySlotflow: "$profile.trustedBySlotflow",
                    adminVerificationStatus: "$profile.adminVerificationStatus",
                    isAddressVerified: "$profile.isAddressVerified",
                    isAvailabilityVerified: "$profile.isAvailabilityVerified",
                    isProofsVerified: "$profile.isProofsVerified",
                    isServiceDetailsVerified: "$profile.isServiceDetailsVerified",
                },
            },
        ]);

        return result[0] || null;
    }

    async findproviderStats(query: ProviderStatsDataQuery): Promise<ProviderStatsDataView> {
        const { startDate, endDate } = getStartAndEndDate(query.startDate, query.endDate);
        const { previousStartDate, previousEndDate } = calculatePreviousPeriod(startDate, endDate);

        const [result] = await UserModel.aggregate([
            {
                $match: {
                    role: Role.PROVIDER,
                    createdAt: { $gte: previousStartDate, $lte: endDate }
                }
            },
            {
                $facet: {
                    current: [
                        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                        {
                            $lookup: {
                                from: "providerprofiles",
                                localField: "_id",
                                foreignField: "userId",
                                as: "profile"
                            }
                        },
                        { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
                        {
                            $group: {
                                _id: null,
                                totalProviders: { $sum: 1 },
                                adminVerifiedProviders: { $sum: { $cond: [{ $eq: ["$profile.isAdminVerified", true] }, 1, 0] } },
                                blockedProviders: { $sum: { $cond: [{ $eq: ["$isBlocked", true] }, 1, 0] } },
                                slotflowTrustedProviders: { $sum: { $cond: [{ $eq: ["$profile.trustedBySlotflow", true] }, 1, 0] } }
                            }
                        }
                    ],
                    previous: [
                        { $match: { createdAt: { $gte: previousStartDate, $lte: previousEndDate } } },
                        {
                            $lookup: {
                                from: "providerprofiles",
                                localField: "_id",
                                foreignField: "userId",
                                as: "profile"
                            }
                        },
                        { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
                        {
                            $group: {
                                _id: null,
                                totalProviders: { $sum: 1 },
                                adminVerifiedProviders: { $sum: { $cond: [{ $eq: ["$profile.isAdminVerified", true] }, 1, 0] } },
                                blockedProviders: { $sum: { $cond: [{ $eq: ["$isBlocked", true] }, 1, 0] } },
                                slotflowTrustedProviders: { $sum: { $cond: [{ $eq: ["$profile.trustedBySlotflow", true] }, 1, 0] } }
                            }
                        }
                    ]
                }
            }
        ]);

        const defaultStats = {
            totalProviders: 0,
            adminVerifiedProviders: 0,
            blockedProviders: 0,
            slotflowTrustedProviders: 0,

        };

        const current = result?.current[0] || defaultStats;
        const previous = result?.previous[0] || defaultStats;

        return {
            totalProviders: formatStatMetric(current.totalProviders, previous.totalProviders),
            adminVerifiedProviders: formatStatMetric(current.adminVerifiedProviders, previous.adminVerifiedProviders),
            blockedProviders: formatStatMetric(current.blockedProviders, previous.blockedProviders),
            addressAddedProviders: formatStatMetric(current.addressAddedProviders, previous.addressAddedProviders),
            serviceAddedProviders: formatStatMetric(current.serviceAddedProviders, previous.serviceAddedProviders),
            availabilityAddedProviders: formatStatMetric(current.availabilityAddedProviders, previous.availabilityAddedProviders),
            slotflowTrustedProviders: formatStatMetric(current.slotflowTrustedProviders, previous.slotflowTrustedProviders),
        };
    }

    async findAdminDashboardUserChartData(query: UserChartDataQuery): Promise<UserChartDataView> {
        const { startDate, endDate } = getStartAndEndDate(query.startDate, query.endDate);
        const { role } = query;
        const stats = await UserModel.aggregate([
            {
                $match: {
                    role: role,
                    updatedAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $project: {
                    createdAtDate: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    updatedAtDate: {
                        $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
                    },
                },
            },
            {
                $group: {
                    _id: "$updatedAtDate",
                    newUsers: {
                        $sum: {
                            $cond: [{ $eq: ["$createdAtDate", "$updatedAtDate"] }, 1, 0],
                        },
                    },
                    returningUsers: {
                        $sum: {
                            $cond: [{ $ne: ["$createdAtDate", "$updatedAtDate"] }, 1, 0],
                        },
                    },
                },
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    newUsers: 1,
                    returningUsers: 1,
                },
            },
        ]);
        console.log("stats : ", stats);

        return stats;
    }

}
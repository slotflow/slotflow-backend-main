import { Types } from "mongoose";
import { UserModel } from "../models/user.model";
import { Role } from "../../domain/enums/common.enum";
import { TableData } from "../../application/dtos/common.dto";
import { formatStatMetric } from "../../shared/utils/helpers/formatStatMetric";
import { defaultTimezone } from "../../shared/utils/constants/constant";
import { IUserQueries } from "../../application/interfaces/queries/IUser.queries";
import { getDateRangeMetrics } from "../../shared/utils/helpers/getDateRangeMetrics";
import {
  UserStatsDataQuery,
  UserStatsDataView,
  UsersQuery,
  UsersView,
  ProvidersQuery,
  ProvidersView,
  ProviderByIdQuery,
  ProviderByIdView,
  ProviderStatsDataQuery,
  ProviderStatsDataView,
  UserChartDataQuery,
  UserChartDataView,
} from "../../application/dtos/user.dto";

export class UserQueriesImpl implements IUserQueries {
  async findStats(query: UserStatsDataQuery): Promise<UserStatsDataView> {
    const { startDate, endDate, timeZone } = query;

    const { start, end, prevStart, prevEnd } = getDateRangeMetrics({
      startDate,
      endDate,
      timeZone,
    });

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
          $or: [{ createdAt: { $lte: end } }, { updatedAt: { $gte: prevStart, $lte: prevEnd } }],
        },
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
                      { $and: [{ $gte: ["$createdAt", start] }, { $lte: ["$createdAt", end] }] },
                      1,
                      0,
                    ],
                  },
                },
                blockedUsers: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$isBlocked", true] },
                          { $gte: ["$createdAt", start] },
                          { $lte: ["$createdAt", end] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                newUsers: {
                  $sum: {
                    $cond: [
                      { $and: [{ $gte: ["$createdAt", start] }, { $lte: ["$createdAt", end] }] },
                      1,
                      0,
                    ],
                  },
                },
                returningUsers: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $lt: ["$createdAt", start] },
                          { $gte: ["$updatedAt", start] },
                          { $lte: ["$updatedAt", end] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          previous: [
            {
              $group: {
                _id: null,
                totalUsers: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$createdAt", prevStart] },
                          { $lte: ["$createdAt", prevEnd] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                blockedUsers: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$isBlocked", true] },
                          { $gte: ["$createdAt", prevStart] },
                          { $lte: ["$createdAt", prevEnd] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                newUsers: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$createdAt", prevStart] },
                          { $lte: ["$createdAt", prevEnd] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                returningUsers: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $lt: ["$createdAt", prevStart] },
                          { $gte: ["$updatedAt", prevStart] },
                          { $lte: ["$updatedAt", prevEnd] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
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
      UserModel.find(
        {
          role: Role.USER,
        },
        {
          _id: 1,
          username: 1,
          email: 1,
          isBlocked: 1,
        },
      )
        .skip(skip)
        .limit(limit)
        .lean<UsersView>(),
      UserModel.countDocuments(),
    ]);
    const totalPages = Math.ceil(totalCount / limit);
    return {
      items: users.map((user) => ({
        ...user,
        _id: user._id.toString(),
      })),
      totalPages,
      currentPage: page,
      totalCount,
    };
  }

  async findProviders(query: ProvidersQuery): Promise<TableData<ProvidersView>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;
    const [providers, totalCountResult] = await Promise.all([
      UserModel.aggregate([
        {
          $match: {
            $or: [
              {
                role: Role.PROVIDER,
              },
              {
                onboardingType: Role.PROVIDER,
              },
            ],
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
      items: providers.map((provider) => ({
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
    const { startDate, endDate, timeZone } = query;

    const { start, end, prevStart, prevEnd } = getDateRangeMetrics({
      startDate,
      endDate,
      timeZone,
    });

    const [result] = await UserModel.aggregate([
      {
        $match: {
          role: Role.PROVIDER,
          createdAt: { $gte: prevStart, $lte: prevEnd },
        },
      },
      {
        $facet: {
          current: [
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
              $lookup: {
                from: "providerprofiles",
                localField: "_id",
                foreignField: "userId",
                as: "profile",
              },
            },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: null,
                totalProviders: { $sum: 1 },
                adminVerifiedProviders: {
                  $sum: { $cond: [{ $eq: ["$profile.isAdminVerified", true] }, 1, 0] },
                },
                blockedProviders: { $sum: { $cond: [{ $eq: ["$isBlocked", true] }, 1, 0] } },
                slotflowTrustedProviders: {
                  $sum: { $cond: [{ $eq: ["$profile.trustedBySlotflow", true] }, 1, 0] },
                },
              },
            },
          ],
          previous: [
            { $match: { createdAt: { $gte: prevStart, $lte: prevEnd } } },
            {
              $lookup: {
                from: "providerprofiles",
                localField: "_id",
                foreignField: "userId",
                as: "profile",
              },
            },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: null,
                totalProviders: { $sum: 1 },
                adminVerifiedProviders: {
                  $sum: { $cond: [{ $eq: ["$profile.isAdminVerified", true] }, 1, 0] },
                },
                blockedProviders: { $sum: { $cond: [{ $eq: ["$isBlocked", true] }, 1, 0] } },
                slotflowTrustedProviders: {
                  $sum: { $cond: [{ $eq: ["$profile.trustedBySlotflow", true] }, 1, 0] },
                },
              },
            },
          ],
        },
      },
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
      adminVerifiedProviders: formatStatMetric(
        current.adminVerifiedProviders,
        previous.adminVerifiedProviders,
      ),
      blockedProviders: formatStatMetric(current.blockedProviders, previous.blockedProviders),
      addressAddedProviders: formatStatMetric(
        current.addressAddedProviders,
        previous.addressAddedProviders,
      ),
      serviceAddedProviders: formatStatMetric(
        current.serviceAddedProviders,
        previous.serviceAddedProviders,
      ),
      availabilityAddedProviders: formatStatMetric(
        current.availabilityAddedProviders,
        previous.availabilityAddedProviders,
      ),
      slotflowTrustedProviders: formatStatMetric(
        current.slotflowTrustedProviders,
        previous.slotflowTrustedProviders,
      ),
    };
  }

  async findAdminDashboardUserChartData(query: UserChartDataQuery): Promise<UserChartDataView> {
    const { startDate, endDate, timeZone, role } = query;
    const effectiveTimeZone = timeZone || defaultTimezone;

    const { start, end } = getDateRangeMetrics({
      startDate,
      endDate,
      timeZone: effectiveTimeZone,
    });

    const stats = await UserModel.aggregate([
      {
        $match: {
          role: role,
          updatedAt: { $gte: start, $lte: end },
        },
      },
      {
        $project: {
          createdAtDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: effectiveTimeZone },
          },
          updatedAtDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt", timezone: effectiveTimeZone },
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

    return stats;
  }
}

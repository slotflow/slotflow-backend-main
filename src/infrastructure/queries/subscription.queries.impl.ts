import { PlanName } from "../../domain/enums/plan.enum";
import { SubscriptionModel } from "../models/subscription.model";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";
import { PlanNameOnly, TableData } from "../../application/dtos/common.dto";
import { formatStatMetric } from "../../shared/utils/helpers/formatStatMetric";
import { getDateRangeMetrics } from "../../shared/utils/helpers/getDateRangeMetrics";
import { ISubscriptionQueries } from "../../application/interfaces/queries/ISubscription.queries";
import {
  MySubscriptionQuery,
  MySubscriptionView,
  SubscribedPlanQuery,
  SubscriptionDetailsQuery,
  SubscriptionDetailsView,
  SubscriptionsQuery,
  SubscriptionStatsDataQuery,
  SubscriptionStatsDataView,
  SubscriptionsView,
  PopulatedPlan,
  SubscriptionAnalyticsQuery,
  SubscriptionAnalyticsView,
} from "../../application/dtos/subscription.dto";

export class SubscriptionQueriesImpl implements ISubscriptionQueries {
  async findAll(query: SubscriptionsQuery): Promise<TableData<SubscriptionsView>> {
    const { page, limit, providerId } = query;
    const skip = (page - 1) * limit;

    const filter: {
      providerId?: string;
    } = {};

    if (providerId) {
      filter.providerId = providerId;
    }

    const [subscriptions, totalCount] = await Promise.all([
      SubscriptionModel.find(filter, {
        _id: 1,
        createdAt: 1,
        providerId: 1,
        currentPeriodStart: 1,
        currentPeriodEnd: 1,
        subscriptionStatus: 1,
      })
        .skip(skip)
        .limit(limit)
        .populate<PlanNameOnly>([
          {
            path: "subscribedPlanId",
            select: "planName",
          },
        ])
        .lean(),
      SubscriptionModel.countDocuments(),
    ]);
    const totalPages = Math.ceil(totalCount / limit);
    return {
      items: subscriptions.map((sub) => ({
        _id: sub._id.toString(),
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        subscriptionStatus: sub.subscriptionStatus,
        planName: sub.subscribedPlanId.planName,
      })),
      totalPages,
      currentPage: page,
      totalCount,
    };
  }

  async findSubscribedPlan(query: SubscribedPlanQuery): Promise<string | boolean> {
    const subscription = await SubscriptionModel.findById(query.subscriptionId)
      .populate<PlanNameOnly>("subscribedPlanId", { planName: 1, _id: 0 })
      .select("subscribedPlanId -_id")
      .lean();
    return subscription ? subscription.subscribedPlanId.planName : false;
  }

  async findDetails(query: SubscriptionDetailsQuery): Promise<SubscriptionDetailsView | null> {
    const data = await SubscriptionModel.findById(query.subscriptionId)
      .select(
        "currentPeriodStart currentPeriodEnd cancelAt cancelAtPeriodEnd subscriptionStatus createdAt _id",
      )
      .populate([
        {
          path: "subscribedPlanId",
          select: "-_id planName adVisibility maxBookingPerMonth",
        },
      ])
      .lean<SubscriptionDetailsView>();
    if (!data) return null;
    return {
      _id: data._id,
      createdAt: data.createdAt,
      currentPeriodEnd: data.currentPeriodEnd,
      currentPeriodStart: data.currentPeriodStart,
      subscriptionStatus: data.subscriptionStatus,
      cancelAt: data.cancelAt,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      subscribedPlanId: {
        planName: data.subscribedPlanId.planName,
        adVisibility: data.subscribedPlanId.adVisibility,
        maxBookingPerMonth: data.subscribedPlanId.maxBookingPerMonth,
      },
    };
  }

  async findStatsForAdminDashboard(
    query: SubscriptionStatsDataQuery,
  ): Promise<SubscriptionStatsDataView> {
    const { startDate, endDate, timeZone } = query;

    const { start, end, prevStart, prevEnd } = getDateRangeMetrics({
      startDate,
      endDate,
      timeZone,
    });

    const [subscriptionStatsData] = await SubscriptionModel.aggregate([
      {
        $match: {
          $or: [
            { createdAt: { $gte: prevStart, $lte: end } },
            {
              subscriptionStatus: SubscriptionStatus.ACTIVE,
              currentPeriodEnd: { $gte: prevStart },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "plans",
          localField: "subscribedPlanId",
          foreignField: "_id",
          as: "plan",
        },
      },
      {
        $unwind: {
          path: "$plan",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $facet: {
          current: [
            {
              $group: {
                _id: null,
                activeSubscriptions: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$subscriptionStatus", SubscriptionStatus.ACTIVE] },
                          { $gte: ["$currentPeriodStart", start] },
                          { $lte: ["$currentPeriodStart", end] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                expiredSubscriptions: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$createdAt", start] },
                          { $lte: ["$createdAt", end] },
                          { $eq: ["$subscriptionStatus", SubscriptionStatus.CANCELLED] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                subscriptionsByFreePlan: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$createdAt", start] },
                          { $lte: ["$createdAt", end] },
                          { $eq: ["$plan.planName", PlanName.TRIAL] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                subscriptionsByStarterPlan: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$createdAt", start] },
                          { $lte: ["$createdAt", end] },
                          { $eq: ["$plan.planName", PlanName.STARTER] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                subscriptionsByProfessionalPlan: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$createdAt", start] },
                          { $lte: ["$createdAt", end] },
                          { $eq: ["$plan.planName", PlanName.PROFESSIONAL] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                subscriptionsByEnterprisePlan: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$createdAt", start] },
                          { $lte: ["$createdAt", end] },
                          { $eq: ["$plan.planName", PlanName.ENTERPRISE] },
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
                activeSubscriptions: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$subscriptionStatus", SubscriptionStatus.ACTIVE] },
                          { $gte: ["$currentPeriodEnd", prevStart] },
                          { $lte: ["$currentPeriodStart", prevEnd] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                expiredSubscriptions: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$currentPeriodEnd", prevStart] },
                          { $lte: ["$currentPeriodStart", prevEnd] },
                          { $eq: ["$subscriptionStatus", SubscriptionStatus.CANCELLED] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                subscriptionsByFreePlan: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$currentPeriodEnd", prevStart] },
                          { $lte: ["$currentPeriodStart", prevEnd] },
                          { $eq: ["$plan.planName", PlanName.TRIAL] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                subscriptionsByStarterPlan: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$currentPeriodEnd", prevStart] },
                          { $lte: ["$currentPeriodStart", prevEnd] },
                          { $eq: ["$plan.planName", PlanName.STARTER] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                subscriptionsByProfessionalPlan: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$currentPeriodEnd", prevStart] },
                          { $lte: ["$currentPeriodStart", prevEnd] },
                          { $eq: ["$plan.planName", PlanName.PROFESSIONAL] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                subscriptionsByEnterprisePlan: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$currentPeriodEnd", prevStart] },
                          { $lte: ["$currentPeriodStart", prevEnd] },
                          { $eq: ["$plan.planName", PlanName.ENTERPRISE] },
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

    const defaultStats = {
      activeSubscriptions: 0,
      expiredSubscriptions: 0,
      subscriptionsByFreePlan: 0,
      subscriptionsByStarterPlan: 0,
      subscriptionsByProfessionalPlan: 0,
      subscriptionsByEnterprisePlan: 0,
    };

    const current = subscriptionStatsData?.current[0] || defaultStats;
    const previous = subscriptionStatsData?.previous[0] || defaultStats;

    return {
      activeSubscriptions: formatStatMetric(
        current.activeSubscriptions,
        previous.activeSubscriptions,
      ),
      expiredSubscriptions: formatStatMetric(
        current.expiredSubscriptions,
        previous.expiredSubscriptions,
      ),
      subscriptionsByFreePlan: formatStatMetric(
        current.subscriptionsByFreePlan,
        previous.subscriptionsByFreePlan,
      ),
      subscriptionsByStarterPlan: formatStatMetric(
        current.subscriptionsByStarterPlan,
        previous.subscriptionsByStarterPlan,
      ),
      subscriptionsByProfessionalPlan: formatStatMetric(
        current.subscriptionsByProfessionalPlan,
        previous.subscriptionsByProfessionalPlan,
      ),
      subscriptionsByEnterprisePlan: formatStatMetric(
        current.subscriptionsByEnterprisePlan,
        previous.subscriptionsByEnterprisePlan,
      ),
    };
  }

  async findSubscriptionsForUpdatinStatus(): Promise<boolean> {
    const now = new Date();

    const updated = await SubscriptionModel.updateMany(
      {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: { $lt: now },
      },
      {
        $set: { subscriptionStatus: SubscriptionStatus.EXPIRED },
      },
    );

    return updated.modifiedCount > 0;
  }

  async findMySubscritpion(query: MySubscriptionQuery): Promise<MySubscriptionView | null> {
    const subscription = await SubscriptionModel.findOne({ _id: query.subscriptionId })
      .sort({ createdAt: -1 })
      .populate<PopulatedPlan>({
        path: "subscribedPlanId",
        select: "planName",
      })
      .lean();
    if (!subscription) return null;

    return {
      providerId: subscription.providerId.toString(),
      subscribedPlan: subscription.subscribedPlanId?.planName,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      subscriptionStatus: subscription.subscriptionStatus,
    };
  }

  async findAnalyticsForAdminDashboard(
    query: SubscriptionAnalyticsQuery,
  ): Promise<SubscriptionAnalyticsView> {
    const { startDate, endDate, timeZone } = query;

    const { start, end } = getDateRangeMetrics({
      startDate,
      endDate,
      timeZone,
    });

    const chartData = await SubscriptionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$subscriptionStatus",
          value: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: { $toLower: { $ifNull: ["$_id", "unknown"] } },
          value: 1,
        },
      },
    ]);

    return chartData;
  }
}

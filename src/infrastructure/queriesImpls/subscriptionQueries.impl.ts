import { PlanName } from "../../domain/enums/plan.enum";
import { SubscriptionModel } from "../models/subscription.model";
import { getStartAndEndDate } from "../../shared/utils/dateTime";
import { formatStatMetric } from "../../shared/utils/formatStatMetric";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";
import { PlanNameOnly, TableData } from "../../application/dtos/common.dto";
import { calculatePreviousPeriod } from "../../shared/utils/calculatePreviosPeriod";
import { ISubscriptionQueries } from "../../application/queries/ISubscription.queries";
import { MySubscriptionQuery, MySubscriptionView, SubscribedPlanQuery, SubscriptionDetailsQuery, SubscriptionDetailsView, SubscriptionsQuery, SubscriptionStatsDataQuery, SubscriptionStatsDataView, SubscriptionsView, PopulatedPlan, SubscriptionAnalyticsQuery, SubscriptionAnalyticsView } from "../../application/dtos/subscription.dto";

export class SubscriptionQueriesImpl implements ISubscriptionQueries {

    async findAll(query: SubscriptionsQuery): Promise<TableData<SubscriptionsView>> {
        const { page, limit, providerId } = query;
        const skip = (page - 1) * limit;

        const filter: {
            providerId?: string
        } = {};

        if (providerId) {
            filter.providerId = providerId
        }

        const [subscriptions, totalCount] = await Promise.all([
            SubscriptionModel.find(filter, {
                _id: 1,
                createdAt: 1,
                providerId: 1,
                startDate: 1,
                endDate: 1,
                subscriptionStatus: 1,
            }).skip(skip).limit(limit)
                .populate<PlanNameOnly>([{
                    path: "subscriptionPlanId",
                    select: "planName"
                }]).lean(),
            SubscriptionModel.countDocuments(),
        ])
        const totalPages = Math.ceil(totalCount / limit);
        return {
            items: subscriptions.map(sub => ({
                _id: sub._id.toString(),
                startDate: sub.startDate,
                endDate: sub.endDate,
                subscriptionStatus: sub.subscriptionStatus,
                planName: sub.subscriptionPlanId.planName
            })),
            totalPages,
            currentPage: page,
            totalCount
        }
    }

    async findSubscribedPlan(query: SubscribedPlanQuery): Promise<string | boolean> {
        const subscription = await SubscriptionModel.findById(query.subscriptionId)
            .populate<PlanNameOnly>("subscriptionPlanId", { planName: 1, _id: 0 })
            .select("subscriptionPlanId -_id")
            .lean();
        return subscription ? subscription.subscriptionPlanId.planName : false;
    }

    async findDetails(query: SubscriptionDetailsQuery): Promise<SubscriptionDetailsView | null> {
        const data = await SubscriptionModel.findById(query.subscriptionId)
            .select("startDate endDate subscriptionStatus createdAt -_id")
            .populate([{
                path: "subscriptionPlanId",
                select: "-_id planName adVisibility maxBookingPerMonth"
            }]).lean<SubscriptionDetailsView>();
        if (!data) return null;
        return {
            createdAt: data.createdAt,
            endDate: data.endDate,
            startDate: data.startDate,
            subscriptionStatus: data.subscriptionStatus,
            subscriptionPlanId: {
                planName: data.subscriptionPlanId.planName,
                adVisibility: data.subscriptionPlanId.adVisibility,
                maxBookingPerMonth: data.subscriptionPlanId.maxBookingPerMonth,
            },

        };
    }

    async findStatsForAdminDashboard(query: SubscriptionStatsDataQuery): Promise<SubscriptionStatsDataView> {
        const { startDate, endDate } = getStartAndEndDate(query.startDate, query.endDate);
        const { previousStartDate, previousEndDate } = calculatePreviousPeriod(startDate, endDate);

        const [subscriptionStatsData] = await SubscriptionModel.aggregate([
            {
                $match: {
                    $or: [
                        { createdAt: { $gte: previousStartDate, $lte: endDate } },
                        { subscriptionStatus: SubscriptionStatus.ACTIVE, endDate: { $gte: previousStartDate } }
                    ]
                }
            },
            {
                $lookup: {
                    from: "plans",
                    localField: "subscriptionPlanId",
                    foreignField: "_id",
                    as: "plan"
                }
            },
            {
                $unwind: {
                    path: "$plan",
                    preserveNullAndEmptyArrays: true
                }
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
                                                    { $lte: ["$startDate", endDate] },
                                                    { $gte: ["$endDate", startDate] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                expiredSubscriptions: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gte: ["$createdAt", startDate] },
                                                    { $lte: ["$createdAt", endDate] },
                                                    { $eq: ["$subscriptionStatus", SubscriptionStatus.CANCELLED] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                subscriptionsByFreePlan: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gte: ["$createdAt", startDate] },
                                                    { $lte: ["$createdAt", endDate] },
                                                    { $eq: ["$plan.planName", PlanName.TRIAL] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                subscriptionsByStarterPlan: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gte: ["$createdAt", startDate] },
                                                    { $lte: ["$createdAt", endDate] },
                                                    { $eq: ["$plan.planName", PlanName.STARTER] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                subscriptionsByProfessionalPlan: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gte: ["$createdAt", startDate] },
                                                    { $lte: ["$createdAt", endDate] },
                                                    { $eq: ["$plan.planName", PlanName.PROFESSIONAL] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                subscriptionsByEnterprisePlan: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gte: ["$createdAt", startDate] },
                                                    { $lte: ["$createdAt", endDate] },
                                                    { $eq: ["$plan.planName", PlanName.ENTERPRISE] }
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
                                activeSubscriptions: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: ["$subscriptionStatus", SubscriptionStatus.ACTIVE] },
                                                    { $lte: ["$startDate", previousEndDate] },
                                                    { $gte: ["$endDate", previousStartDate] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                expiredSubscriptions: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gte: ["$createdAt", previousStartDate] },
                                                    { $lte: ["$createdAt", previousEndDate] },
                                                    { $eq: ["$subscriptionStatus", SubscriptionStatus.CANCELLED] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                subscriptionsByFreePlan: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gte: ["$createdAt", previousStartDate] },
                                                    { $lte: ["$createdAt", previousEndDate] },
                                                    { $eq: ["$plan.planName", PlanName.TRIAL] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                subscriptionsByStarterPlan: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gte: ["$createdAt", previousStartDate] },
                                                    { $lte: ["$createdAt", previousEndDate] },
                                                    { $eq: ["$plan.planName", PlanName.STARTER] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                subscriptionsByProfessionalPlan: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gte: ["$createdAt", previousStartDate] },
                                                    { $lte: ["$createdAt", previousEndDate] },
                                                    { $eq: ["$plan.planName", PlanName.PROFESSIONAL] }
                                                ]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                subscriptionsByEnterprisePlan: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gte: ["$createdAt", previousStartDate] },
                                                    { $lte: ["$createdAt", previousEndDate] },
                                                    { $eq: ["$plan.planName", PlanName.ENTERPRISE] }
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
            activeSubscriptions: formatStatMetric(current.activeSubscriptions, previous.activeSubscriptions),
            expiredSubscriptions: formatStatMetric(current.expiredSubscriptions, previous.expiredSubscriptions),
            subscriptionsByFreePlan: formatStatMetric(current.subscriptionsByFreePlan, previous.subscriptionsByFreePlan),
            subscriptionsByStarterPlan: formatStatMetric(current.subscriptionsByStarterPlan, previous.subscriptionsByStarterPlan),
            subscriptionsByProfessionalPlan: formatStatMetric(current.subscriptionsByProfessionalPlan, previous.subscriptionsByProfessionalPlan),
            subscriptionsByEnterprisePlan: formatStatMetric(current.subscriptionsByEnterprisePlan, previous.subscriptionsByEnterprisePlan),
        };
    }

    async findSubscriptionsForUpdatinStatus(): Promise<boolean> {
        const now = new Date();

        const updated = await SubscriptionModel.updateMany(
            {
                subscriptionStatus: SubscriptionStatus.ACTIVE,
                endDate: { $lt: now }
            },
            {
                $set: { subscriptionStatus: SubscriptionStatus.EXPIRED }
            }
        );

        return updated.modifiedCount > 0;
    }

    async findMySubscritpion(query: MySubscriptionQuery): Promise<MySubscriptionView | null> {
        const subscription = await SubscriptionModel
            .findOne({ _id: query.subscriptionId })
            .sort({ createdAt: -1 })
            .populate<PopulatedPlan>({
                path: "subscriptionPlanId",
                select: "planName"
            })
            .lean();
        if (!subscription) return null;

        return {
            providerId: subscription.providerId.toString(),
            subscribedPlan: subscription.subscriptionPlanId?.planName,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            subscriptionStatus: subscription.subscriptionStatus
        };
    };

    async findAnalyticsForAdminDashboard(query: SubscriptionAnalyticsQuery): Promise<SubscriptionAnalyticsView> {
        const { startDate, endDate } = getStartAndEndDate(query.startDate, query.endDate);
       
        const chartData = await SubscriptionModel.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
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
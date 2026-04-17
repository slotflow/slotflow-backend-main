import { SubscriptionModel } from "../models/subscription.model";
import { getStartAndEndDate } from "../../shared/utils/dateTime";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";
import { ISubscriptionQueries } from "../../application/queries/ISubscription.queries";
import { PlanNameOnly, TableData } from "../../application/dtos/common.dto";
import { MySubscriptionQuery, MySubscriptionView, SubscribedPlanQuery, SubscriptionDetailsQuery, SubscriptionDetailsView, SubscriptionsQuery, SubscriptionStatsForAdminQuery, SubscriptionStatsForAdminView, SubscriptionsView, PopulatedPlan } from "../../application/dtos/subscription.dto";

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
            data: subscriptions.map(sub => ({
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
                select: "-_id planName price adVisibility maxBookingPerMonth"
            }]).lean<SubscriptionDetailsView>();
        if (!data) return null;
        return {
            createdAt: data.createdAt,
            endDate: data.endDate,
            startDate: data.startDate,
            subscriptionStatus: data.subscriptionStatus,
            subscriptionPlanId: {
                planName: data.subscriptionPlanId.planName,
                price: data.subscriptionPlanId.price,
                adVisibility: data.subscriptionPlanId.adVisibility,
                maxBookingPerMonth: data.subscriptionPlanId.maxBookingPerMonth,
            },

        };
    }

    async findStatsForAdminDashboard(query: SubscriptionStatsForAdminQuery): Promise<SubscriptionStatsForAdminView> {
        const { startDate, endDate } = getStartAndEndDate(query.startDate, query.endDate);
        const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };
        const subscriptionStatsData = await SubscriptionModel.aggregate([
            {
                $lookup: {
                    from: "plans",
                    localField: "subscriptionPlanId",
                    foreignField: "_id",
                    as: "plan"
                }
            },
            { $unwind: "$plan" },
            {
                $facet: {
                    activeSubscriptions: [
                        { $match: { subscriptionStatus: SubscriptionStatus.ACTIVE, ...dateFilter } },
                        { $count: "count" }
                    ],
                    expiredSubscriptions: [
                        { $match: { subscriptionStatus: SubscriptionStatus.CANCELLED, ...dateFilter } },
                        { $count: "count" }
                    ],
                    subscriptionsByFreePlan: [
                        { $match: { "plan.planName": "Free", ...dateFilter } },
                        { $count: "count" }
                    ],
                    subscriptionsByStarterPlan: [
                        { $match: { "plan.planName": "Starter", ...dateFilter } },
                        { $count: "count" }
                    ],
                    subscriptionsByProfessionalPlan: [
                        { $match: { "plan.planName": "Professional", ...dateFilter } },
                        { $count: "count" }
                    ],
                    subscriptionsByEnterprisePlan: [
                        { $match: { "plan.planName": "Enterprise", ...dateFilter } },
                        { $count: "count" }
                    ]
                }
            },
            {
                $project: {
                    activeSubscriptions: { $ifNull: [{ $arrayElemAt: ["$activeSubscriptions.count", 0] }, 0] },
                    expiredSubscriptions: { $ifNull: [{ $arrayElemAt: ["$expiredSubscriptions.count", 0] }, 0] },
                    notSubscribedProviders: { $ifNull: [{ $arrayElemAt: ["$notSubscribedProviders.count", 0] }, 0] },
                    subscriptionsByFreePlan: { $ifNull: [{ $arrayElemAt: ["$subscriptionsByFreePlan.count", 0] }, 0] },
                    subscriptionsByStarterPlan: { $ifNull: [{ $arrayElemAt: ["$subscriptionsByStarterPlan.count", 0] }, 0] },
                    subscriptionsByProfessionalPlan: { $ifNull: [{ $arrayElemAt: ["$subscriptionsByProfessionalPlan.count", 0] }, 0] },
                    subscriptionsByEnterprisePlan: { $ifNull: [{ $arrayElemAt: ["$subscriptionsByEnterprisePlan.count", 0] }, 0] }
                }
            }
        ]);
        const data = subscriptionStatsData[0];
        return {
            activeSubscriptions: data.activeSubscription,
            expiredSubscriptions: data.expiredSubscriptions,
            subscriptionsByEnterprisePlan: data.subscriptionsByEnterprisePlan,
            subscriptionsByFreePlan: data.subscriptionsByFreePlan,
            subscriptionsByProfessionalPlan: data.subscriptionsByProfessionalPlan,
            subscriptionsByStarterPlan: data.subscriptionsByStarterPlan,
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
}
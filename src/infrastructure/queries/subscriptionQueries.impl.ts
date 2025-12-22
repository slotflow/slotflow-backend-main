import { SubscriptionModel } from "../database/subscription/subscription.model";
import { SubscriptionStatus } from "../../domain/enums/subscriptionStatus.enum";
import { ISubscriptionQueries } from "../../application/queries/ISubscription.queries";
import { AdminFetchAllSubscriptionsResponse, AdminFetchDashboardSubscriptionStatsDataResponse } from "../../application/dtos/admin.dto";
import { ApiPaginationRequest, FetchProviderSubscriptionsRequest, findSubscriptionFullDetailsResProps, FindSubscriptionsByProviderIdResponse, PlanNameOnly, PopulatedSubscription, TableData } from "../../application/dtos/common.dto";

export class SubscriptionQueriesImpl implements ISubscriptionQueries {

    async findAll(pagination: ApiPaginationRequest): Promise<TableData<AdminFetchAllSubscriptionsResponse>> {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        const [subscriptions, totalCount] = await Promise.all([
            SubscriptionModel.find({}, {
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

    async findSubscribedPlan(subscriptionId: string): Promise<string | boolean> {
        const subscription = await SubscriptionModel.findById(subscriptionId)
            .populate<PlanNameOnly>("subscriptionPlanId", { planName: 1, _id: 0 })
            .select("subscriptionPlanId -_id")
            .lean();
        return subscription ? subscription.subscriptionPlanId.planName : false;
    }

    async findDetails(subscriptionId: string): Promise<findSubscriptionFullDetailsResProps | null> {
        const data = await SubscriptionModel.findById(subscriptionId)
            .select("startDate endDate subscriptionStatus createdAt -_id")
            .populate([{
                path: "paymentId",
                select: "-_id transactionId discountAmount initialAmount totalAmount paymentFor paymentGateway paymentMethod paymentStatus"
            }, {
                path: "subscriptionPlanId",
                select: "-_id planName price adVisibility maxBookingPerMonth"
            }]).lean<findSubscriptionFullDetailsResProps>();
        if (!data) return null;
        return {
            createdAt: data.createdAt,
            endDate: data.endDate,
            startDate: data.startDate,
            subscriptionStatus: data.subscriptionStatus,
            paymentId: {
                transactionId: data.paymentId.transactionId,
                discountAmount: data.paymentId.discountAmount,
                initialAmount: data.paymentId.initialAmount,
                totalAmount: data.paymentId.totalAmount,
                paymentFor: data.paymentId.paymentFor,
                paymentGateway: data.paymentId.paymentGateway,
                paymentMethod: data.paymentId.paymentMethod,
                paymentStatus: data.paymentId.paymentStatus,
            },
            subscriptionPlanId: {
                planName: data.subscriptionPlanId.planName,
                price: data.subscriptionPlanId.price,
                adVisibility: data.subscriptionPlanId.adVisibility,
                maxBookingPerMonth: data.subscriptionPlanId.maxBookingPerMonth,
            },

        };
    }

    async findStatsForAdminDashboard(): Promise<AdminFetchDashboardSubscriptionStatsDataResponse> {
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
                        { $match: { subscriptionStatus: SubscriptionStatus.Active } },
                        { $count: "count" }
                    ],
                    expiredSubscriptions: [
                        { $match: { subscriptionStatus: SubscriptionStatus.Cancelled } },
                        { $count: "count" }
                    ],
                    subscriptionsByFreePlan: [
                        { $match: { "plan.planName": "Free" } },
                        { $count: "count" }
                    ],
                    subscriptionsByStarterPlan: [
                        { $match: { "plan.planName": "Starter" } },
                        { $count: "count" }
                    ],
                    subscriptionsByProfessionalPlan: [
                        { $match: { "plan.planName": "Professional" } },
                        { $count: "count" }
                    ],
                    subscriptionsByEnterprisePlan: [
                        { $match: { "plan.planName": "Enterprise" } },
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

    async findSubscriptionsByProviderId(payload: FetchProviderSubscriptionsRequest): Promise<TableData<FindSubscriptionsByProviderIdResponse>> {
        const { providerId, page, limit } = payload;
        const skip = (page - 1) * limit;
        const [subscriptions, totalCount] = await Promise.all([
            SubscriptionModel.find({ providerId: providerId }, {
                _id: 1,
                startDate: 1,
                endDate: 1,
                subscriptionStatus: 1,
            }).populate<PopulatedSubscription>([{
                path: "subscriptionPlanId",
                select: "-_id planName price"
            }, {
                path: "paymentId",
                select: "-_id totalAmount"
            }]).sort({ startDate: -1 }).skip(skip).limit(limit).lean(),
            SubscriptionModel.countDocuments({ providerId: providerId }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: subscriptions.map(sub => ({
                _id: sub._id.toString(),
                startDate: sub.startDate,
                endDate: sub.endDate,
                subscriptionStatus: sub.subscriptionStatus,
                planName: sub.subscriptionPlanId.planName,
                totalAmount: sub.paymentId.totalAmount,
            })),
            totalPages,
            currentPage: page,
            totalCount
        }
    }

    async findSubscriptionsForUpdatinStatus(): Promise<boolean> {
        const now = new Date();

        const updated = await SubscriptionModel.updateMany(
            {
                subscriptionStatus: SubscriptionStatus.Active,
                endDate: { $lt: now }
            },
            {
                $set: { subscriptionStatus: SubscriptionStatus.Expired }
            }
        );

        return updated.modifiedCount > 0;
    }
}
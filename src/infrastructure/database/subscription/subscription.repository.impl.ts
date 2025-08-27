import { Types } from "mongoose";
import { Plan } from "../../../domain/entities/plan.entity";
import { ISubscription, SubscriptionModel } from "./subscription.model";
import { Subscription, SubscriptionStatus } from "../../../domain/entities/subscription.entity";
import { AdminFetchAllSubscriptionsResponse, AdminFetchDashboardSubscriptionStatsDataResponse } from "../../dtos/admin.dto";
import { ApiPaginationRequest, ApiResponse, FetchProviderSubscriptionsRequest, FindSubscriptionsByProviderIdResponse, PopulatedSubscription } from "../../dtos/common.dto";
import { CreateSubscriptionPayloadProps, findSubscriptionFullDetailsResProps, ISubscriptionRepository, PlanNameOnly } from "../../../domain/repositories/ISubscription.repository";

export class SubscriptionRepositoryImpl implements ISubscriptionRepository {
    private mapToEntity(subscription: ISubscription): Subscription {
        return new Subscription(
            subscription._id,
            subscription.providerId,
            subscription.subscriptionPlanId,
            subscription.startDate,
            subscription.endDate,
            subscription.subscriptionStatus,
            subscription.paymentId,
            subscription.createdAt,
            subscription.updatedAt,
        )
    }

    async createSubscription(subscription: CreateSubscriptionPayloadProps, options: { session?: any } = {}): Promise<Subscription> {
        try {
            const newSubscription = await SubscriptionModel.create([subscription], options);
            return this.mapToEntity(newSubscription[0]);
        } catch (error) {
            throw new Error("Subscription creating error.");
        }
    }

    async findSubscriptionById(subscriptionId: Types.ObjectId): Promise<Subscription | null> {
        try {
            const subscription = await SubscriptionModel.findById(subscriptionId);
            return subscription ? this.mapToEntity(subscription) : null;
        } catch (error) {
            throw new Error("Subscription finding error.");
        }
    }

    async findSubscriptionsByProviderId(data: FetchProviderSubscriptionsRequest): Promise<ApiResponse<FindSubscriptionsByProviderIdResponse>> {
        try {
            const { providerId, page, limit } = data;
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
            ])
            const totalPages = Math.ceil(totalCount / limit);
            return {
                data: subscriptions.map((sub) => ({
                    _id: sub._id,
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
        } catch (error) {
            throw new Error("Subscriptions fetching error.");
        }
    }

    async findAllSubscriptions({ page, limit }: ApiPaginationRequest): Promise<ApiResponse<AdminFetchAllSubscriptionsResponse>> {
        try {
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
                    _id: sub._id,
                    startDate: sub.startDate,
                    endDate: sub.endDate,
                    subscriptionStatus: sub.subscriptionStatus,
                    planName: (sub.subscriptionPlanId as any)?.planName ?? ""
                })),
                totalPages,
                currentPage: page,
                totalCount
            }
        } catch (error) {
            throw new Error("Subcriptions fetching error.");
        }
    }

    async findSubscriptionFullDetails(subscriptionId: Types.ObjectId): Promise<findSubscriptionFullDetailsResProps | {}> {
        try {
            const subscriptionDetails = await SubscriptionModel.findById(subscriptionId)
                .select("startDate endDate subscriptionStatus createdAt -_id")
                .populate([{
                    path: "paymentId",
                    select: "-_id transactionId discountAmount initialAmount totalAmount paymentFor paymentGateway paymentMethod paymentStatus"
                }, {
                    path: "subscriptionPlanId",
                    select: "-_id planName price adVisibility maxBookingPerMonth"
                }]).lean();
            return subscriptionDetails || {};
        } catch (error) {
            throw new Error("Subscription details fetching error.");
        }
    }

    async findSbuscriptionsForUpdatinStatus(): Promise<boolean> {
        try {
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
        } catch {
            return false;
        }
    }

    async findSubscribedPlan(subscriptionId: Types.ObjectId): Promise<Plan["planName"] | boolean> {
        try {
            const subscription = await SubscriptionModel.findById(subscriptionId)
                .populate<PlanNameOnly>("subscriptionPlanId", { planName: 1, _id: 0 })
                .select("subscriptionPlanId -_id")
                .lean();
            return subscription ? subscription.subscriptionPlanId.planName : false;
        } catch {
            return false;
        }
    }

    async findSubscriptionStatsForAdminDashboard(): Promise<AdminFetchDashboardSubscriptionStatsDataResponse> {
        try {
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
            return subscriptionStatsData[0];
        } catch (error) {
            console.log("findSubscriptionStatsForAdminDashboard error : ", error);
            throw new Error("Subscription stats fetching failed");
        }
    }
}
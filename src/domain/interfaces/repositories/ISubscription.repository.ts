import { Types } from "mongoose";
import { Plan } from "../../entities/plan.entity";
import { Payment } from "../../entities/payment.entity";
import { Subscription } from "../../entities/subscription.entity";
import { AdminFetchAllSubscriptionsResponse, AdminFetchDashboardSubscriptionStatsDataResponse } from "../../../application/dtos/admin.dto";
import { ApiPaginationRequest, ApiResponse, FetchProviderSubscriptionsRequest, FindSubscriptionsByProviderIdResponse } from "../../../application/dtos/common.dto";

export type CreateSubscriptionPayloadProps = Pick<Subscription, "providerId" | "subscriptionPlanId" | "startDate" | "endDate" | "subscriptionStatus" | "paymentId" >;

type SubscriptionProps = Pick<Subscription, "startDate" | "endDate" | "subscriptionStatus" | "createdAt">;
type PaymentsProps = Pick<Payment, "transactionId" | "discountAmount" | "initialAmount" | "paymentFor" | "paymentGateway" | "paymentMethod" | "paymentStatus" | "totalAmount">;
type PlanProps = Pick<Plan, "planName" | "price" | "adVisibility" | "maxBookingPerMonth">;
export interface findSubscriptionFullDetailsResProps extends SubscriptionProps {
    subscriptionPlanId: PlanProps,
    paymentId: PaymentsProps,
}

export interface PlanNameOnly {
    subscriptionPlanId : {
        planName: string
    }
}

export interface ISubscriptionRepository {

    // old methods

    createSubscription(subscription: CreateSubscriptionPayloadProps, options?: { session: any }): Promise<Subscription>;

    findSubscriptionById(subscriptionId: Types.ObjectId): Promise<Subscription | null>;

    findSubscriptionsByProviderId(data: FetchProviderSubscriptionsRequest): Promise<ApiResponse<FindSubscriptionsByProviderIdResponse>>;

    findAllSubscriptions({ page, limit }: ApiPaginationRequest): Promise<ApiResponse<AdminFetchAllSubscriptionsResponse>>

    findSubscriptionFullDetails(subscriptionId: Types.ObjectId): Promise<findSubscriptionFullDetailsResProps | {}>;

    findSubscriptionsForUpdatinStatus():Promise<boolean>;

    findSubscribedPlan(subscriptionId: Types.ObjectId): Promise<Plan["planName"] | boolean>;

    findSubscriptionStatsForAdminDashboard(): Promise<AdminFetchDashboardSubscriptionStatsDataResponse>;

    // new methods

    create(subscription: Subscription): Promise<Subscription>;

    update(subscription: Subscription): Promise<Subscription>;

    findById(subscriptionId: string): Promise<Subscription | null>;

}

import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../domain/enums/common.enum";
import { TimeZone } from "../../domain/commands/user.commands";
import { PlanProps } from "../../domain/contracts/plan.contract";
import { BillingCycle } from "../../domain/enums/subscription.enum";
import { PaymentFor, RefundFor, RefundReason } from "../../domain/enums/payment.enum";
import { ProviderServiceProps } from "../../domain/contracts/providerService.contract";
import { Availability, TimeSlot } from "../../domain/commands/serviceAvailability.commands";

// common api pagination input
export interface ApiPaginationInput {
  page: number;
  limit: number;
}

// Table data output
export interface TableData<T> {
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
  items?: T
};

// used in create file upload presigned url usecase input output
export interface CreateFileUploadPresignedUrlInput {
  fileName: string;
  fileType: string;
  folderName: string;
}
export interface CreateFileUploadPresignedUrlOutput {
  uploadUrl: string;
  key: string;
};

// used in create file signed url usecase
export interface CreateFileSignedUrlInput {
  key: string;
};

// used in find provider service usecase
type FindProviderServiceProps = Omit<ProviderServiceProps, "service" | "updatedAt" | "createdAt">;
export interface FindProviderServiceOutput extends FindProviderServiceProps {
  service: { serviceName: string }
}

// used in create service availability usecase
export interface PlanNameOnly {
  subscribedPlanId: {
    planName: PlanProps["planName"];
  }
}

//
export interface TimeSlotForClientOutput {
  _id: string,
    time: string,
    available: boolean,
    occupied?: boolean,
}

// used in create service availability usecase
export interface FrontendAvailabilityForOutput extends Omit<Availability, "slots"> {
  slots: TimeSlotForClientOutput[]
}

// used in create service availability usecase
export interface FrontendAvailabilityForClientInput extends Omit<Availability, "slots"> {
  slots?: string[];
}

// used in create service availability usecase
export interface FrontendAvailabilityUpdatedSlots extends Omit<Availability, "slots"> {
  slots?: TimeSlot[];
}

// used in auth controller
export interface AuthUser {
  id: string;
  role: Role;
  email: string;
  name: string;
  timeZone: TimeZone;
};

export interface GoogleOAuthUser {
  googleAccessToken: string;
  googleRefreshToken: string;
  googleId: string;
  email: string;
  name: string;
  image: string | null;
}

// used in count query
export type CountResult = { count: number };

// queries

export type AggregateCountResult = { count: number };

// Chart DTOS
export interface MiniChartData {
  date: string;
  value: number;
}

export interface MiniCardData {
  count: number;
  percentage: number;
  days: number;
  chartData: MiniChartData[];
}

//
export interface StatMetric {
  value: number;
  trend: string;
}

//
export interface CommonDateInput {
  startDate: string;
  endDate: string;
}

// Notification channels
export type NotificationChannel = 'email' | 'push' | 'in_app';

// Notification Type
export type NotificationType =
  | 'account_activity'
  | 'system_updates'
  | 'promotional_updates';





/**
 * JWT Service dtos
 */

export interface JwtClaims extends JwtPayload {
  userId?: string;
  email?: string;
  name?: string | null;
  password?: string;
  role?: Role;
  timeZone?: TimeZone | null;
}





/**
 * Payment Client Service dtos
 */

// Create subscription checkout
export interface CreateSubscriptionCheckoutSessionInput {
  subscriptionData: {
    subscriptionId: string;
    billingCycle: BillingCycle;
    paymentFor: PaymentFor;
    paymentDate: Date;
    priceId: string;
    unitAmount: number;
    trialPeriodDays?: number;
    alreadyUsedTrial: boolean;
    isTrial: boolean;
  },
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    timeZone: TimeZone;
  }
}
export interface CreateSubscriptionCheckoutSessionOutput {
  status: boolean;
  message: string;
  data: string;
}


// Create booking checkout
export interface CreateBookingCheckoutSessionInput {
  bookingData: {
    serviceName: string;
    description: string;
    unitAmount: number;
    providerId: string;
    bookingId: string;
    paymentFor: PaymentFor;
  }
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    timeZone: TimeZone;
  }
}
export interface CreateBookingCheckoutSessionOutput {
  status: boolean;
  message: string;
  data: string;
}


// Create refund
export interface ProcessRefundInput {
  bookingId: string;
  paymentId: string;
  refundFor: RefundFor;
  refundReason: RefundReason;
  reasonInDetail: string;
}
export interface ProcessRefundOutput {
  success: boolean;
  message: string;
}
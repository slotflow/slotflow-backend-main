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
  items?: T;
}

// Create file upload presigned url usecase input output
export interface CreateFileUploadPresignedUrlInput {
  fileName: string;
  fileType: string;
  folderName: string;
}
export interface CreateFileUploadPresignedUrlOutput {
  uploadUrl: string;
  key: string;
}

// Create file signed url usecase
export interface CreateFileSignedUrlInput {
  key: string;
}

// Find provider service usecase
type FindProviderServiceProps = Omit<ProviderServiceProps, "service" | "updatedAt" | "createdAt">;
export interface FindProviderServiceOutput extends FindProviderServiceProps {
  service: { serviceName: string };
}

// Create service availability usecase
export interface PlanNameOnly {
  subscribedPlanId: {
    planName: PlanProps["planName"];
  };
}

// Availability time slot for client view
export interface TimeSlotForClientOutput {
  _id: string;
  time: string;
  available: boolean;
  occupied?: boolean;
}

// Create service availability usecase
export interface FrontendAvailabilityForOutput extends Omit<Availability, "slots"> {
  slots: TimeSlotForClientOutput[];
}

// Create service availability usecase
export interface FrontendAvailabilityForClientInput extends Omit<Availability, "slots"> {
  slots?: string[];
}

// Create service availability usecase
export interface FrontendAvailabilityUpdatedSlots extends Omit<Availability, "slots"> {
  slots?: TimeSlot[];
}

// Auth user
export interface AuthUser {
  id: string;
  role: Role;
  email: string;
  name: string;
  timeZone: TimeZone;
}

// Google auth user
export interface GoogleOAuthUser {
  googleAccessToken: string;
  googleRefreshToken: string;
  googleId: string;
  email: string;
  name: string;
  image: string | null;
}

// Count query result
export type CountResult = { count: number };

// Aggregate count query result
export type AggregateCountResult = { count: number };

// Mini chart data
export interface MiniChartData {
  date: string;
  value: number;
}

// Mini card data
export interface MiniCardData {
  count: number;
  percentage: number;
  days: number;
  chartData: MiniChartData[];
}

// Stats metric data
export interface StatMetric {
  value: number;
  trend: string;
}

// Common date
export interface CommonDateInput {
  startDate: string;
  endDate: string;
}

/**
 * JWT Service dtos
 */

// JWT custom payload
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
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    timeZone: TimeZone;
  };
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
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    timeZone: TimeZone;
  };
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

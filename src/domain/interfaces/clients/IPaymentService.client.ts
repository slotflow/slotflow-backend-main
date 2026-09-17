import { BillingCycle } from "../../enums/subscription.enum";
import { Role } from "../../enums/common.enum";
import { PaymentFor, RefundFor, RefundReason } from "../../enums/payment.enum";

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
  }
}

export interface CreateSubscriptionCheckoutSessionOutput {
  status: boolean;
  message: string;
  data: string;
}

export interface CreateBookingCheckoutSessionInput {
  serviceName: string;
  description: string;
  unitAmount: number;
  providerId: string;
  slotDuration: number;
  selectedServiceMode: string;
  bookingId: string;
  userId: string;
  paymentFor: PaymentFor;
  userEmail: string;
  userName: string;
  initialAmount: number;
  pushNotification: boolean;
}

export interface CreateBookingCheckoutSessionOutput {
  status: boolean;
  message: string;
  data: string;
}

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

export interface IPaymentServiceClient {
  createSubscriptionCheckoutSession(input: CreateSubscriptionCheckoutSessionInput): Promise<CreateSubscriptionCheckoutSessionOutput>;

  createBookingCheckoutSession(input: CreateBookingCheckoutSessionInput): Promise<CreateBookingCheckoutSessionOutput>;

  processRefund(input: ProcessRefundInput): Promise<ProcessRefundOutput>;
}
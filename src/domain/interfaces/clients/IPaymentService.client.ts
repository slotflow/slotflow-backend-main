import { PaymentFor, RefundFor, RefundReason } from "../../enums/payment.enum";

export interface CreateSubscriptionCheckoutSessionInput {
  subscriptionId: string;
  providerId: string;
  planName: string;
  description: string;
  planDuration: number;
  unitAmount: number;
  paymentFor: PaymentFor;
  paymentDate: Date;
  name: string;
  email: string;
  initialAmount: number;
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
  createSubscriptionCheckoutSession(
    input: CreateSubscriptionCheckoutSessionInput
  ): Promise<CreateSubscriptionCheckoutSessionOutput>;

  createBookingCheckoutSession(
    input: CreateBookingCheckoutSessionInput
  ): Promise<CreateBookingCheckoutSessionOutput>;

  processRefund(
    input: ProcessRefundInput
  ): Promise<ProcessRefundOutput>;
}
import { CreateBookingCheckoutSessionInput, CreateBookingCheckoutSessionOutput, CreateSubscriptionCheckoutSessionInput, CreateSubscriptionCheckoutSessionOutput, ProcessRefundInput, ProcessRefundOutput } from "../../dtos/common.dto";

export interface IPaymentServiceClient {
  createSubscriptionCheckoutSession(input: CreateSubscriptionCheckoutSessionInput): Promise<CreateSubscriptionCheckoutSessionOutput>;

  createBookingCheckoutSession(input: CreateBookingCheckoutSessionInput): Promise<CreateBookingCheckoutSessionOutput>;

  processRefund(input: ProcessRefundInput): Promise<ProcessRefundOutput>;
}
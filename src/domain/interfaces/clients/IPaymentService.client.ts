import { PaymentFor } from "../../enums/payment.enum";

export interface CreateCheckoutSessionRequest {
  subscriptionId: string;
  providerId: string;
  planName: string;
  planDescription: string;
  planDuration: number;
  unitAmount: number;
  totalAmount: number;
  paymentFor: PaymentFor;
  paymentDate: Date;
  name: string;
  email: string;
  initialAmount: number;
  discountAmount: number;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
}

export interface IPaymentServiceClient {
  createCheckoutSession(
    payload: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse>;
}

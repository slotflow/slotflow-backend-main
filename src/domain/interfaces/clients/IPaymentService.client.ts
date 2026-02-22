import { PaymentFor } from "../../enums/payment.enum";

export interface CreateCheckoutSessionRequest {
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

export interface CreateCheckoutSessionResponse {
  status: boolean;
  message: string;
  data: string;
}

export interface IPaymentServiceClient {
  createCheckoutSession(
    payload: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse>;
}

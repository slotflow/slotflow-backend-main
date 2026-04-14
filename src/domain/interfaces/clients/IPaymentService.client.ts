import { PaymentFor } from "../../enums/payment.enum";

export interface CreateSubscriptionCheckoutSessionRequest {
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

export interface CreateSubscriptonCheckoutSessionResponse {
  status: boolean;
  message: string;
  data: string;
}

export interface CreateBookingCheckoutSessionRequest {
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

export interface CreateBookingCheckoutSessionResponse {
  status: boolean;
  message: string;
  data: string;
}

export interface IPaymentServiceClient {
  createSubsciptionCheckoutSession(
    input: CreateSubscriptionCheckoutSessionRequest
  ): Promise<CreateSubscriptonCheckoutSessionResponse>;

  createBookingCheckoutSession(
    input: CreateBookingCheckoutSessionRequest
  ): Promise<CreateBookingCheckoutSessionResponse>;
}
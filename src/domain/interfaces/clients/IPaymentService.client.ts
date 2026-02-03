export interface CreateCheckoutSessionRequest {
  subscriptionId: string;
  providerId: string;
  planName: string;
  planDescription: string;
  planDuration: number;
  unitAmount: number;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
}

export interface IPaymentServiceClient {
  createCheckoutSession(
    payload: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse>;
}

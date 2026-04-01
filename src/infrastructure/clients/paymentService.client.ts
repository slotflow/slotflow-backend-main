import { AxiosInstance } from "axios";
import { axiosInstance } from "../http/axios/axios";
import { serviceConfig } from "../../config/env";
import { log } from "../../shared/logger/logger";
import { CreateBookingCheckoutSessionRequest, CreateBookingCheckoutSessionResponse, CreateSubscriptionCheckoutSessionRequest, CreateSubscriptonCheckoutSessionResponse, IPaymentServiceClient } from "../../domain/interfaces/clients/IPaymentService.client";

export class PaymentServiceClient implements IPaymentServiceClient {

  private readonly http: AxiosInstance;

  constructor() {
    this.http = axiosInstance.create({
      baseURL: serviceConfig.paymentServiceUrl,
      timeout: 5000,
    });
  };

  async createSubsciptionCheckoutSession(payload: CreateSubscriptionCheckoutSessionRequest): Promise<CreateSubscriptonCheckoutSessionResponse> {
    try {
      const { data } = await this.http.post<CreateSubscriptonCheckoutSessionResponse>(
        "/subscription/checkout/session",
        payload
      );

      if (!data?.data) {
        log.error("Invalid response from Payment Service");
        throw new Error("Invalid response from Payment Service");
      };

      return data;
    } catch (error) {
      log.error("createSubsciptionCheckoutSession, Payment Service unavailable", error as Error);
      throw new Error("Payment Service unavailable");
    };
  };

  async createBookingCheckoutSession(payload: CreateBookingCheckoutSessionRequest): Promise<CreateBookingCheckoutSessionResponse> {
    try {
      const { data } = await this.http.post<CreateBookingCheckoutSessionResponse>(
        "/booking/checkout/session",
        payload
      );

      if (!data?.data) {
        log.error("Invalid response from Payment Service");
        throw new Error("Invalid response from Payment Service");
      };

      return data;
    } catch (error) {
      log.error("createBookingCheckoutSession, Payment Service unavailable", error as Error);
      throw new Error("Payment Service unavailable");
    }
  }
};

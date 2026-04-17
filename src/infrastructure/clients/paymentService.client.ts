import { AxiosInstance } from "axios";
import { serviceConfig } from "../../config/env";
import { log } from "../../shared/logger/logger";
import { axiosInstance } from "../http/axios/axios";
import { CreateBookingCheckoutSessionInput, CreateBookingCheckoutSessionOutput, CreateSubscriptionCheckoutSessionInput, CreateSubscriptionCheckoutSessionOutput, IPaymentServiceClient } from "../../domain/interfaces/clients/IPaymentService.client";

export class PaymentServiceClient implements IPaymentServiceClient {

  private readonly http: AxiosInstance;

  constructor(baseUrl: string = serviceConfig.paymentServiceUrl) {
    this.http = axiosInstance.create({
      baseURL: baseUrl,
    });
  };

  async createSubscriptionCheckoutSession(input: CreateSubscriptionCheckoutSessionInput): Promise<CreateSubscriptionCheckoutSessionOutput> {
    try {
      const { data } = await this.http.post<CreateSubscriptionCheckoutSessionOutput>(
        "/subscription/checkout/session",
        input
      );

      if (!data?.data) {
        log.error("Invalid response from Payment Service");
        throw new Error("Invalid response from Payment Service");
      };

      return data;
    } catch (error) {
      log.error("createSubscriptionCheckoutSession, Payment Service unavailable", error as Error);
      throw new Error("Payment Service unavailable");
    };
  };

  async createBookingCheckoutSession(input: CreateBookingCheckoutSessionInput): Promise<CreateBookingCheckoutSessionOutput> {
    try {
      const { data } = await this.http.post<CreateBookingCheckoutSessionOutput>(
        "/booking/checkout/session",
        input
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

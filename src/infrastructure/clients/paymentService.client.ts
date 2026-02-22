import { AxiosInstance } from "axios";
import { axiosInstance } from "../lib/axios";
import { serviceConfig } from "../../config/env";
import { log } from "../../shared/logger/logger";
import { CreateCheckoutSessionRequest, CreateCheckoutSessionResponse, IPaymentServiceClient } from "../../domain/interfaces/clients/IPaymentService.client";

export class PaymentServiceClient implements IPaymentServiceClient {

  private readonly http: AxiosInstance;

  constructor() {
    this.http = axiosInstance.create({
      baseURL: serviceConfig.paymentServiceUrl,
      timeout: 5000,
    });
  };

  async createCheckoutSession(payload: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse> {
    try {
      const { data } = await this.http.post<CreateCheckoutSessionResponse>(
        "/subscription/checkout/session",
        payload
      );

      log.info(`data : ${data}`);

      if (!data?.data) {
        log.error("Invalid response from Payment Service");
        throw new Error("Invalid response from Payment Service");
      };

      return data;
    } catch (error) {
      log.error("Payment Service unavailable", error as Error);
      throw new Error("Payment Service unavailable");
    };
  };
};

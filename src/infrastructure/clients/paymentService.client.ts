import axios, { AxiosInstance } from "axios";
import { serviceConfig } from "../../config/env";
import { log } from "../../shared/logger/logger";
import { ERROR_CODES } from "../../shared/utils/types";
import { AppError, BadRequestError } from "../../shared/error/appError";
import { CreateBookingCheckoutSessionInput, CreateBookingCheckoutSessionOutput, CreateSubscriptionCheckoutSessionInput, CreateSubscriptionCheckoutSessionOutput, IPaymentServiceClient, ProcessRefundInput, ProcessRefundOutput } from "../../domain/interfaces/clients/IPaymentService.client";

export class PaymentServiceClient implements IPaymentServiceClient {

  private readonly http: AxiosInstance;

  constructor(baseUrl: string = serviceConfig.paymentServiceUrl) {
      this.http = axios.create({
        baseURL: baseUrl,
        timeout: 5000,
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

        throw new AppError(
          "Invalid response from Payment Service",
          502,
          false,
          ERROR_CODES.PAYMENT_INVALID_RESPONSE
        );
      };

      return data;
    } catch (error: unknown) {
      log.error(`createSubscriptionCheckoutSession failed - URL: ${this.http.defaults.baseURL}/subscription/checkout/session`, error as Error);
      this.handleError(error, "createSubscriptionCheckoutSession");
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

        throw new AppError(
          "Invalid response from Payment Service",
          502,
          false,
          ERROR_CODES.PAYMENT_INVALID_RESPONSE
        );
      };

      return data;
    } catch (error: unknown) {
      log.error("createBookingCheckoutSession, Payment Service unavailable", error as Error);
      this.handleError(error, "createBookingCheckoutSession");
    }
  }

  async processRefund(input: ProcessRefundInput): Promise<ProcessRefundOutput> {
    try {
      const { data } = await this.http.post<ProcessRefundOutput>(
        "/refund",
        input
      );

      if (!data || !data.success) {
        log.error("Invalid response from Payment Service");

        throw new AppError(
          "Invalid response from Payment Service",
          502,
          false,
          ERROR_CODES.PAYMENT_INVALID_RESPONSE
        );
      };

      return data;
    } catch (error: unknown) {
      log.error("processRefund, Payment Service unavailable", error as Error);
      this.handleError(error, "processRefund");
    }
  }

  private handleError(error: unknown, context: string): never {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error) {
      log.error(`${context}:`, error);
    } else {
      log.error(`${context}:`, new Error(String(error)));
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status && status >= 400 && status < 500) {
        throw new BadRequestError(
          "Payment request failed",
          ERROR_CODES.PAYMENT_BAD_REQUEST
        );
      }

      throw new AppError(
        "Payment service error",
        502,
        false,
        ERROR_CODES.PAYMENT_SERVICE_ERROR
      );
    }

    throw new AppError(
      "Payment service unavailable",
      502,
      false,
      ERROR_CODES.PAYMENT_SERVICE_UNAVAILABLE
    );
  }
};

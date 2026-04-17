import { serviceConfig } from "../../config/env";
import { PaymentServiceClient } from "./paymentService.client";
import { IPaymentServiceClient } from "../../domain/interfaces/clients/IPaymentService.client";


export const paymentServiceClient: IPaymentServiceClient = new PaymentServiceClient(serviceConfig.paymentServiceUrl);
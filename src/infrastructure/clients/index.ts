import { serviceConfig } from "../../config/env";
import { PaymentServiceClient } from "./paymentService.client";
import { IPaymentServiceClient } from "../../application/interfaces/clients/IPaymentService.client";


export const paymentServiceClient: IPaymentServiceClient = new PaymentServiceClient(serviceConfig.paymentServiceUrl);
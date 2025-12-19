import { PaymentProps } from "../contracts/payment.contract";

export type CreateForSubscriptionProps = Pick<PaymentProps, "transactionId" | "paymentStatus" | "paymentMethod" | "paymentGateway" | "paymentFor" | "initialAmount" | "discountAmount" | "providerId" | "totalAmount">;

export type CreateForBookingProps = Pick<PaymentProps, "transactionId" | "paymentStatus" | "paymentMethod" | "paymentGateway" | "paymentFor" | "initialAmount" | "discountAmount" | "userId" | "totalAmount" | "providerId">;

export type UpdatePaymentProps = Partial<Omit<PaymentProps, "_id" | "userId" | "transactionId" | "providerId" |  "createdAt" | "updatedAt">>;
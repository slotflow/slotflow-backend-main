import { PaymentFor, PaymentGateway, PaymentMethod, PaymentStatus } from "../enums/payment.enum";

export interface PaymentProps {
    _id: string,
    transactionId: string,
    paymentStatus: PaymentStatus,
    paymentMethod: PaymentMethod,
    paymentGateway: PaymentGateway,
    paymentFor: PaymentFor,
    initialAmount: number,
    discountAmount: number,
    totalAmount: number,
    userId?: string | null,
    providerId?: string | null,
    refundId?: string | null,
    refundAmount?: number | null,
    refundStatus?: PaymentStatus | null,
    refundAt?: Date | null,
    refundReason?: string | null,
    chargeId?: string | null,
    createdAt: Date,
    updatedAt: Date,
}
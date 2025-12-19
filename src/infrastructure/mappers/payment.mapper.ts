import { Types } from "mongoose";
import { IPayment } from "../database/payment/payment.model";
import { Payment } from "../../domain/entities/payment.entity";

export class PaymentMapper {

    static toDomain(doc: IPayment): Payment {
        return new Payment({
            _id: doc._id.toString(),

            transactionId: doc.transactionId,
            paymentStatus: doc.paymentStatus,
            paymentMethod: doc.paymentMethod,
            paymentGateway: doc.paymentGateway,
            paymentFor: doc.paymentFor,

            initialAmount: doc.initialAmount,
            discountAmount: doc.discountAmount,
            totalAmount: doc.totalAmount,

            chargeId: doc.chargeId ?? null,

            userId: doc.userId ? doc.userId.toString() : null,
            providerId: doc.providerId ? doc.providerId.toString() : null,

            refundId: doc.refundId ?? null,
            refundAmount: doc.refundAmount ?? null,
            refundStatus: doc.refundStatus ?? null,
            refundAt: doc.refundAt ?? null,
            refundReason: doc.refundReason ?? null,

            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static toPersistence(entity: Payment) {
        const props = entity.getProps();

        return {
            transactionId: props.transactionId,
            paymentStatus: props.paymentStatus,
            paymentMethod: props.paymentMethod,
            paymentGateway: props.paymentGateway,
            paymentFor: props.paymentFor,

            initialAmount: props.initialAmount,
            discountAmount: props.discountAmount,
            totalAmount: props.totalAmount,

            chargeId: props.chargeId ?? null,

            userId: props.userId ? new Types.ObjectId(props.userId) : null,
            providerId: props.providerId ? new Types.ObjectId(props.providerId) : null,

            refundId: props.refundId ?? null,
            refundAmount: props.refundAmount ?? null,
            refundStatus: props.refundStatus ?? null,
            refundAt: props.refundAt ?? null,
            refundReason: props.refundReason ?? null,

            updatedAt: props.updatedAt,
        };
    }
}

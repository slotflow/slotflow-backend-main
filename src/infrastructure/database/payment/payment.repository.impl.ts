import { Types } from "mongoose";
import { PaymentModel } from "./payment.model";
import { PaymentMapper } from "../../mappers/payment.mapper";
import { Payment } from "../../../domain/entities/payment.entity";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";

export class PaymentRepositoryImpl implements IPaymentRepository {

    async create(payment: Payment, ptions?: { session: any; }): Promise<Payment> {
        const persistence = PaymentMapper.toPersistence(payment);
        const created = await PaymentModel.create(persistence);
        return PaymentMapper.toDomain(created);
    }

    async findById(payemtnId: string): Promise<Payment | null> {
        const doc = await PaymentModel.findById(payemtnId);

        return doc ? PaymentMapper.toDomain(doc) : null;
    }

    async update(payment: Payment, ptions?: { session: any; }): Promise<Payment> {
        const persistence = PaymentMapper.toPersistence(payment);

        const updated = await PaymentModel.findByIdAndUpdate(
            new Types.ObjectId(payment._id),
            persistence,
            { new: true }
        );

        if (!updated) {
            throw new Error("Payment not found");
        }

        return PaymentMapper.toDomain(updated);
    }
}
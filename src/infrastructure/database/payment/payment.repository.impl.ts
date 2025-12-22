import { PaymentModel } from "./payment.model";
import { PaymentMapper } from "../../mappers/payment.mapper";
import { Payment } from "../../../domain/entities/payment.entity";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";

export class PaymentRepositoryImpl implements IPaymentRepository {

    async create(payment: Payment, options?: { session: any; }): Promise<Payment> {
        const persistence = PaymentMapper.toPersistence(payment);
        const created = await PaymentModel.create(
            [persistence],
            options?.session ? { session: options.session } : undefined
        );

        return PaymentMapper.toDomain(created[0]);
    };

    async findById(payemtnId: string): Promise<Payment | null> {
        const doc = await PaymentModel.findById(payemtnId);
        return doc ? PaymentMapper.toDomain(doc) : null;
    };

    async update(payment: Payment, options?: { session: any; }): Promise<Payment> {
        const persistence = PaymentMapper.toPersistence(payment);

        const updated = await PaymentModel.findByIdAndUpdate(
            payment._id,
            { $set: persistence },
            {
                new: true,
                session: options?.session,
            }
        );

        if (!updated) {
            throw new Error("Payment not found");
        }

        return PaymentMapper.toDomain(updated);
    };

};
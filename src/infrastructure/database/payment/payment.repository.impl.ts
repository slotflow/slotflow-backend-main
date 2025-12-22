import { PaymentModel } from "./payment.model";
import { PaymentMapper } from "../../mappers/payment.mapper";
import { Payment } from "../../../domain/entities/payment.entity";
import { IPaymentRepository } from "../../../domain/interfaces/repositories/IPayment.repository";

export class PaymentRepositoryImpl implements IPaymentRepository {

    async create(payment: Payment): Promise<Payment> {
        const persistence = PaymentMapper.toPersistence(payment);
        const doc = await PaymentModel.create(persistence);
        return PaymentMapper.toDomain(doc);
    };

    async findById(payemtnId: string): Promise<Payment | null> {
        const doc = await PaymentModel.findById(payemtnId);
        return doc ? PaymentMapper.toDomain(doc) : null;
    };

    async update(payment: Payment): Promise<Payment> {
        const persistence = PaymentMapper.toPersistence(payment);

        const doc = await PaymentModel.findByIdAndUpdate(
            payment._id,
            { $set: persistence },
            {new: true}
        );

        if (!doc) {
            throw new Error("Payment not found");
        }

        return PaymentMapper.toDomain(doc);
    };

};
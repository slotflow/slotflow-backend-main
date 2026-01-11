import { Types } from "mongoose";
import { PaymentModel } from "../database/payment.model";
import { PaymentMapper } from "../mappers/payment.mapper";
import { Payment } from "../../domain/entities/payment.entity";
import { PaymentFor } from "../../domain/enums/paymentFor.enum";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";

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
            { new: true }
        );

        if (!doc) {
            throw new Error("Payment not found");
        }

        return PaymentMapper.toDomain(doc);
    };

    async findAll(page: number, limit: number, userId?: string, providerId?: string): Promise<{ data: Array<Payment>, totalPages: number; currentPage: number; totalCount: number; }> {
        const skip = (page - 1) * limit;

        const filter: {
            userId?: Types.ObjectId;
            providerId?: Types.ObjectId;
            paymentFor?: PaymentFor | { $in: PaymentFor[] };
        } = {};

        if (userId) {
            filter.userId = new Types.ObjectId(userId);
            filter.paymentFor = PaymentFor.AppointmentBooking
        }

        if (providerId) {
            filter.providerId = new Types.ObjectId(providerId);
            filter.paymentFor = { $in: [PaymentFor.ProviderPayout, PaymentFor.ProviderSubscription] }
        }

        const [payments, totalCount] = await Promise.all([
            PaymentModel.find(filter, {
                _id: 1,
                createdAt: 1,
                totalAmount: 1,
                paymentFor: 1,
                paymentMethod: 1,
                paymentGateway: 1,
                paymentStatus: 1,
                discountAmount: 1,
            }).skip(skip).limit(limit).sort({ createdAt: 1 }).lean(),
            PaymentModel.countDocuments(filter),
        ]);
        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: payments.map(payment => PaymentMapper.toDomain(payment)),
            totalPages,
            currentPage: page,
            totalCount
        }

    };

};
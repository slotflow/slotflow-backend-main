import { Payment } from "../../entities/payment.entity";

export interface IPaymentRepository {

    create(payment: Payment): Promise<Payment>;

    update(payment: Payment): Promise<Payment>;

    findById(payemtnId: string): Promise<Payment | null>;

    findAll(page: number, limit: number, userId?: string, providerId?: string): Promise<{ data: Array<Payment>, totalPages: number; currentPage: number; totalCount: number; }>;

}

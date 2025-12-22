import { Payment } from "../../entities/payment.entity";

export interface IPaymentRepository {

    create(payment: Payment, options?: { session: any }): Promise<Payment>;

    update(payment: Payment, options?: { session: any }): Promise<Payment>;

    findById(payemtnId: string): Promise<Payment | null>;

}

import { Payment } from "../../entities/payment.entity";

export interface IPaymentRepository {

    create(payment: Payment, ptions?: { session: any }): Promise<Payment>;

    update(payment: Payment, ptions?: { session: any }): Promise<Payment>;

    findById(payemtnId: string): Promise<Payment | null>;

}

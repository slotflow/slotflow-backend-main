import { Payment } from "../../entities/payment.entity";

export interface IPaymentRepository {

    create(payment: Payment): Promise<Payment>;

    update(payment: Payment): Promise<Payment>;

    findById(payemtnId: string): Promise<Payment | null>;

}

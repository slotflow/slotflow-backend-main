import { CreditAccount } from '../../entities/creditAccount.entity';
import { ClientSession } from 'mongoose';

export interface ICreditAccountRepository {
    create(account: CreditAccount, session?: ClientSession): Promise<CreditAccount | null>;

    findById(id: string): Promise<CreditAccount | null>;

    findByUserId(userId: string, session?: ClientSession): Promise<CreditAccount | null>;

    update(account: CreditAccount, session?: ClientSession): Promise<CreditAccount | null>;

    findActive(): Promise<CreditAccount[]>;

    findByUserIdActive(userId: string): Promise<CreditAccount | null>;

    incrementBalance(userId: string, credit: number, session?: ClientSession): Promise<void>;
}

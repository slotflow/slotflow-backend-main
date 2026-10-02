import { ClientSession } from 'mongoose';
import { TableData } from '../../../application/dtos/common.dto';
import { CreditTransaction } from '../../entities/creditTransaction.entity';
import { CreditTransactionSource, CreditTransactionStatus, CreditTransactionType } from '../../enums/creditTransaction.enum';

export interface ICreditTransactionRepository {
    create(transaction: CreditTransaction, session?: ClientSession): Promise<CreditTransaction | null>;

    findById(id: string): Promise<CreditTransaction | null>;

    findByAccountId(accountId: string): Promise<CreditTransaction[]>;

    findByIdempotencyKey(idempotencyKey: string): Promise<CreditTransaction | null>;

    findByReferenceId(referenceId: string): Promise<CreditTransaction[]>;

    update(transaction: CreditTransaction, session?: ClientSession): Promise<CreditTransaction | null>;

    findBySource(source: CreditTransactionSource): Promise<CreditTransaction[]>;

    findByStatus(status: CreditTransactionStatus): Promise<CreditTransaction[]>;

    findByUserIdWithFilters(data: {
        userId: string;
        startDate: string;
        endDate: string;
        page: number;
        limit: number;
        status?: CreditTransactionStatus;
        type?: CreditTransactionType;
        source?: CreditTransactionSource;
        timeZone?: string;
    }): Promise<TableData<Array<CreditTransaction>>>;
}

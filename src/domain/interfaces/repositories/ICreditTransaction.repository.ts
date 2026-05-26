import { ClientSession } from 'mongoose';
import { CreditTransaction } from '../../entities/creditTransaction.entity';
import { CreditTransactionSource, CreditTransactionStatus, CreditTransactionType } from '../../enums/creditTransaction.enum';
import { TableData } from '../../../application/dtos/common.dto';

export interface ICreditTransactionRepository {
    create(transaction: CreditTransaction, session?: ClientSession): Promise<CreditTransaction | null>;

    findById(id: string): Promise<CreditTransaction | null>;

    findByAccountId(accountId: string): Promise<CreditTransaction[]>;

    findByIdempotencyKey(idempotencyKey: string): Promise<CreditTransaction | null>;

    findByReferenceId(referenceId: string): Promise<CreditTransaction[]>;

    update(transaction: CreditTransaction, session?: ClientSession): Promise<CreditTransaction | null>;

    findBySource(source: CreditTransactionSource): Promise<CreditTransaction[]>;

    findByStatus(status: CreditTransactionStatus): Promise<CreditTransaction[]>;

    findByUserIdWithFilters(
        userId: string,
        startDate: Date,
        endDate: Date,
        page: number,
        limit: number,
        status?: CreditTransactionStatus,
        type?: CreditTransactionType,
        source?: CreditTransactionSource
    ): Promise<TableData<Array<CreditTransaction>>>;
}

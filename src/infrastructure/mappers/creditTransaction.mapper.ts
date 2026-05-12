import { Types } from 'mongoose';
import { ICreditTransaction } from '../models/creditTransaction.model';
import { CreditTransaction } from '../../domain/entities/creditTransaction.entity';
import { CreditTransactionProps } from '../../domain/contracts/creditTransation.contract';

export class CreditTransactionMapper {
    static toDomain(doc: ICreditTransaction): CreditTransaction {
        const props: CreditTransactionProps = {
            _id: doc._id.toString(),
            accountId: doc.accountId.toString(),
            userId: doc.userId.toString(),
            type: doc.type,
            credits: doc.credits,
            balanceAfter: doc.balanceAfter,
            source: doc.source,
            status: doc.status,
            referenceId: doc.referenceId,
            idempotencyKey: doc.idempotencyKey,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
        return CreditTransaction.fromPersistence(props);
    }

    static toPersistence(transaction: CreditTransaction): Partial<ICreditTransaction> {
        const props = transaction.getPersistenceProps();
        return {
            accountId: new Types.ObjectId(props.accountId),
            userId: new Types.ObjectId(props.userId),
            type: props.type,
            credits: props.credits,
            balanceAfter: props.balanceAfter,
            source: props.source,
            status: props.status,
            referenceId: props.referenceId,
            idempotencyKey: props.idempotencyKey,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}

import { Types } from 'mongoose';
import { ICreditAccount } from '../models/creditAccount.model';
import { CreditAccount } from '../../domain/entities/creditAccount.entity';
import { CreditAccountProps } from '../../domain/contracts/creditAccount.contract';

export class CreditAccountMapper {
    static toDomain(doc: ICreditAccount): CreditAccount {
        const props: CreditAccountProps = {
            _id: doc._id.toString(),
            userId: doc.userId.toString(),
            balance: doc.balance,
            isActive: doc.isActive,
            version: doc.version,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
        return CreditAccount.fromPersistence(props);
    }

    static toPersistence(account: CreditAccount): Partial<ICreditAccount> {
        const props = account.getPersistenceProps();
        return {
            userId: new Types.ObjectId(props.userId),
            balance: props.balance,
            isActive: props.isActive,
            version: props.version,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}

import { ClientSession } from 'mongoose';
import { CreditAccountModel } from '../models/creditAccount.model';
import { CreditAccountMapper } from '../mappers/creditAccount.mapper';
import { CreditAccount } from '../../domain/entities/creditAccount.entity';
import { ICreditAccountRepository } from '../../domain/interfaces/repositories/ICreditAccount.repository';

export class CreditAccountRepositoryImpl implements ICreditAccountRepository {
    async create(account: CreditAccount, session?: ClientSession): Promise<CreditAccount | null> {
        const doc = await CreditAccountModel.create(
            [CreditAccountMapper.toPersistence(account)],
            { session }
        );
        return doc.length > 0 ? CreditAccountMapper.toDomain(doc[0]) : null;
    }

    async findById(id: string): Promise<CreditAccount | null> {
        const doc = await CreditAccountModel.findById(id);
        return doc ? CreditAccountMapper.toDomain(doc) : null;
    }

    async findByUserId(userId: string, session?: ClientSession): Promise<CreditAccount | null> {
        const query = CreditAccountModel.findOne({ userId });
        if (session) {
            query.session(session);
        }
        const doc = await query;
        return doc ? CreditAccountMapper.toDomain(doc) : null;
    }

    async update(account: CreditAccount, session?: ClientSession): Promise<CreditAccount | null> {
        const doc = await CreditAccountModel.findByIdAndUpdate(
            account._id,
            CreditAccountMapper.toPersistence(account),
            { new: true, session }
        );
        return doc ? CreditAccountMapper.toDomain(doc) : null;
    }

    async findActive(): Promise<CreditAccount[]> {
        const docs = await CreditAccountModel.find({ isActive: true });
        return docs.map(doc => CreditAccountMapper.toDomain(doc));
    }

    async findByUserIdActive(userId: string): Promise<CreditAccount | null> {
        const doc = await CreditAccountModel.findOne({ userId, isActive: true });
        return doc ? CreditAccountMapper.toDomain(doc) : null;
    }

    async incrementBalance(userId: string, credit: number, session?: ClientSession): Promise<void> {
        await CreditAccountModel.findOneAndUpdate(
            { userId },
            {
                $inc: { balance: credit },
                $setOnInsert: {
                    userId,
                    balance: 0,
                    isActive: true,
                }
            },
            {
                upsert: true,
                new: true,
                session
            }
        );
    }
}

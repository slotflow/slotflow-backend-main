import { ClientSession } from 'mongoose';
import { User } from '../../domain/entities/user.entity';
import { TableData } from '../../application/dtos/common.dto';
import { CreditTransactionModel } from '../models/creditTransaction.model';
import { CreditTransactionMapper } from '../mappers/creditTransaction.mapper';
import { CreditTransaction } from '../../domain/entities/creditTransaction.entity';
import { getDateRangeMetrics } from '../../shared/utils/helpers/getDateRangeMetrics';
import { ICreditTransactionRepository } from '../../domain/interfaces/repositories/ICreditTransaction.repository';
import { CreditTransactionSource, CreditTransactionStatus, CreditTransactionType } from '../../domain/enums/creditTransaction.enum';

export class CreditTransactionRepositoryImpl implements ICreditTransactionRepository {
    async create(transaction: CreditTransaction, session?: ClientSession): Promise<CreditTransaction | null> {
        const doc = await CreditTransactionModel.create(
            [CreditTransactionMapper.toPersistence(transaction)],
            { session }
        );
        return doc.length > 0 ? CreditTransactionMapper.toDomain(doc[0]) : null;
    }

    async findById(id: string): Promise<CreditTransaction | null> {
        const doc = await CreditTransactionModel.findById(id);
        return doc ? CreditTransactionMapper.toDomain(doc) : null;
    }

    async findByAccountId(accountId: string): Promise<CreditTransaction[]> {
        const docs = await CreditTransactionModel.find({ accountId }).sort({ createdAt: -1 });
        return docs.map(doc => CreditTransactionMapper.toDomain(doc));
    }

    async findByIdempotencyKey(idempotencyKey: string): Promise<CreditTransaction | null> {
        const doc = await CreditTransactionModel.findOne({ idempotencyKey });
        return doc ? CreditTransactionMapper.toDomain(doc) : null;
    }

    async findByReferenceId(referenceId: string): Promise<CreditTransaction[]> {
        const docs = await CreditTransactionModel.find({ referenceId }).sort({ createdAt: -1 });
        return docs.map(doc => CreditTransactionMapper.toDomain(doc));
    }

    async update(transaction: CreditTransaction, session?: ClientSession): Promise<CreditTransaction | null> {
        const doc = await CreditTransactionModel.findByIdAndUpdate(
            transaction._id,
            CreditTransactionMapper.toPersistence(transaction),
            { new: true, session }
        );
        return doc ? CreditTransactionMapper.toDomain(doc) : null;
    }

    async findBySource(source: CreditTransactionSource): Promise<CreditTransaction[]> {
        const docs = await CreditTransactionModel.find({ source }).sort({ createdAt: -1 });
        return docs.map(doc => CreditTransactionMapper.toDomain(doc));
    }

    async findByStatus(status: CreditTransactionStatus): Promise<CreditTransaction[]> {
        const docs = await CreditTransactionModel.find({ status }).sort({ createdAt: -1 });
        return docs.map(doc => CreditTransactionMapper.toDomain(doc));
    }

    async findByUserIdWithFilters(data: {
        userId: string,
        startDate: string,
        endDate: string,
        page: number,
        limit: number,
        status?: CreditTransactionStatus,
        type?: CreditTransactionType,
        source?: CreditTransactionSource,
        timeZone?: string,
    }): Promise<TableData<Array<CreditTransaction>>> {
        const { page, limit, startDate, endDate, timeZone, userId, source, status, type } = data;

        const skip = (page - 1) * limit;

        const { start, end } = getDateRangeMetrics({
            startDate,
            endDate,
            timeZone,
        });

        const filter: {
            userId: User["_id"],
            createdAt: {
                $gte: Date,
                $lte: Date
            },
            status?: CreditTransactionStatus,
            type?: CreditTransactionType,
            source?: CreditTransactionSource
        } = {
            userId,
            createdAt: {
                $gte: start,
                $lte: end
            }
        };

        if (status) filter.status = status;
        if (type) filter.type = type;
        if (source) filter.source = source;

        const [transactions, totalCount] = await Promise.all([
            CreditTransactionModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            CreditTransactionModel.countDocuments(filter)
        ]);
        const totalPages = Math.ceil(totalCount / limit);

        return {
            items: transactions.map(doc => CreditTransactionMapper.toDomain(doc)),
            currentPage: page,
            totalCount,
            totalPages
        };
    }
}

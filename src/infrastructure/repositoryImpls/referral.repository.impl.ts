import { ClientSession } from 'mongoose';
import { ReferralModel } from '../models/referral.model';
import { ReferralMapper } from '../mappers/referral.mapper';
import { TableData } from '../../application/dtos/common.dto';
import { ReferralStatus } from '../../domain/enums/common.enum';
import { Referral } from '../../domain/entities/referral.entity';
import { IReferralRepository } from '../../domain/interfaces/repositories/IReferral.repository';

export class ReferralRepositoryImpl implements IReferralRepository {
    async create(referral: Referral, session?: ClientSession): Promise<Referral | null> {
        const doc = await ReferralModel.create(
            [ReferralMapper.toPersistence(referral)],
            { session }
        );
        return doc.length > 0 ? ReferralMapper.toDomain(doc[0]) : null;
    }

    async findById(id: string): Promise<Referral | null> {
        const doc = await ReferralModel.findById(id);
        return doc ? ReferralMapper.toDomain(doc) : null;
    }

    async findByCode(code: string): Promise<Referral | null> {
        const doc = await ReferralModel.findOne({ referralCode: code });
        return doc ? ReferralMapper.toDomain(doc) : null;
    }

    async findByUserId(page: number, limit: number, referrerUserId: string, status?: ReferralStatus): Promise<TableData<Array<Referral>>> {
        const skip = (page - 1) * limit;
        const query: {
            referrerUserId?: string;
            status?: ReferralStatus;
        } = { referrerUserId };

        if (status) {
            query.status = status;
        }

        if (referrerUserId) {
            query.referrerUserId = referrerUserId;
        }

        const [referrals, totalCount] = await Promise.all([
            ReferralModel.find({}, {
                _id: 1,
                status: 1,
                createdAt: 1,
                completedAt: 1,
                rewardGiven: 1
            }).skip(skip).limit(limit),
            ReferralModel.countDocuments(),
        ])
        const totalPages = Math.ceil(totalCount / limit);
        return {
            items: referrals.map(referral => ReferralMapper.toDomain(referral)),
            totalPages,
            currentPage: page,
            totalCount
        }
    }

    async update(referral: Referral, session?: ClientSession): Promise<Referral | null> {
        const doc = await ReferralModel.findByIdAndUpdate(
            referral._id,
            ReferralMapper.toPersistence(referral),
            { new: true, session }
        );
        return doc ? ReferralMapper.toDomain(doc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await ReferralModel.findByIdAndDelete(id);
        return !!result;
    }

    async findByReferrerAndReferredUser(referrerUserId: string, refereeUserId: string): Promise<Referral | null> {

        const doc = await ReferralModel.findOne({
            referrerUserId,
            refereeUserId
        });

        return doc ? ReferralMapper.toDomain(doc) : null;
    }

}

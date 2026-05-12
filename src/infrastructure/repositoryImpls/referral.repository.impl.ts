import { ClientSession } from 'mongoose';
import { ReferralModel } from '../models/referral.model';
import { ReferralMapper } from '../mappers/referral.mapper';
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

    async findByReferrerUserId(referrerUserId: string): Promise<Referral[]> {
        const docs = await ReferralModel.find({ referrerUserId });
        return docs.map(doc => ReferralMapper.toDomain(doc));
    }

    async findByReferredUserId(referredUserId: string): Promise<Referral[]> {
        const docs = await ReferralModel.find({ referredUserId });
        return docs.map(doc => ReferralMapper.toDomain(doc));
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

    async findPendingReferralsByReferrer(referrerUserId: string): Promise<Referral[]> {
        const docs = await ReferralModel.find({
            referrerUserId,
            status: "PENDING"
        });
        return docs.map(doc => ReferralMapper.toDomain(doc));
    }

    async findCompletedReferralsByReferrer(referrerUserId: string): Promise<Referral[]> {
        const docs = await ReferralModel.find({
            referrerUserId,
            status: { $in: ["COMPLETED", "REWARDED"] }
        });
        return docs.map(doc => ReferralMapper.toDomain(doc));
    }

    async findByReferrerAndReferredUser(referrerUserId: string, referredUserId: string): Promise<Referral | null> {
        const doc = await ReferralModel.findOne({
            referrerUserId,
            referredUserId
        });
        return doc ? ReferralMapper.toDomain(doc) : null;
    }
}

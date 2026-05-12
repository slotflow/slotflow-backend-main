import { ClientSession } from 'mongoose';
import { Referral } from '../../entities/referral.entity';

export interface IReferralRepository {
    create(referral: Referral, session?: ClientSession): Promise<Referral | null>;

    findById(id: string): Promise<Referral | null>;

    findByCode(code: string): Promise<Referral | null>;

    findByReferrerUserId(referrerUserId: string): Promise<Referral[]>;

    findByReferredUserId(referredUserId: string): Promise<Referral[]>;

    update(referral: Referral, session?: ClientSession): Promise<Referral | null>;

    delete(id: string): Promise<boolean>;

    findPendingReferralsByReferrer(referrerUserId: string): Promise<Referral[]>;

    findCompletedReferralsByReferrer(referrerUserId: string): Promise<Referral[]>;

    findByReferrerAndReferredUser(referrerUserId: string, referredUserId: string): Promise<Referral | null>;
}

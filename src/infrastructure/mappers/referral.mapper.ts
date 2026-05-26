import { Types } from 'mongoose';
import { IReferral } from '../models/referral.model';
import { Referral } from '../../domain/entities/referral.entity';
import { ReferralProps } from '../../domain/contracts/referral.contract';

export class ReferralMapper {
    static toDomain(doc: IReferral): Referral {
        const props: ReferralProps = {
            _id: doc._id.toString(),
            referrerUserId: doc.referrerUserId.toString(),
            refereeUserId: doc.refereeUserId.toString(),
            referralCode: doc.referralCode,
            status: doc.status,
            rewardGiven: doc.rewardGiven,
            createdAt: doc.createdAt,
            completedAt: doc.completedAt,
            updatedAt: doc.updatedAt,
        };
        return Referral.fromPersistence(props);
    }

    static toPersistence(referral: Referral): Partial<IReferral> {
        const props = referral.getPersistenceProps();
        return {
            referrerUserId: new Types.ObjectId(props.referrerUserId),
            refereeUserId: new Types.ObjectId(props.refereeUserId),
            referralCode: props.referralCode,
            status: props.status,
            rewardGiven: props.rewardGiven,
            createdAt: props.createdAt,
            completedAt: props.completedAt,
            updatedAt: props.updatedAt,
        };
    }
}

import mongoose, { Schema, Document, Types } from 'mongoose';
import { ReferralStatus } from '../../domain/enums/common.enum';

export interface IReferral extends Document {
    _id: Types.ObjectId;
    referrerUserId: Types.ObjectId;
    refereeUserId: Types.ObjectId;
    referralCode: string;
    status: ReferralStatus;
    rewardGiven: boolean;
    createdAt: Date;
    completedAt?: Date;
    updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>({
    referrerUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    refereeUserId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    referralCode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    status: {
        type: String,
        enum: Object.values(ReferralStatus),
        default: ReferralStatus.PENDING,
    },
    rewardGiven: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        required: true,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        required: true,
        default: new Date()
    }
});

// Index for querying referrals by referrer or referred user
ReferralSchema.index({ referrerUserId: 1 });
ReferralSchema.index({ refereeUserId: 1 });
ReferralSchema.index({ status: 1 });

export const ReferralModel = mongoose.model<IReferral>('Referral', ReferralSchema);

import mongoose, { Schema, Document, Types } from 'mongoose';
import { CreditTransactionType, CreditTransactionSource, CreditTransactionStatus } from '../../domain/enums/creditTransaction.enum';

export interface ICreditTransaction extends Document {
    _id: Types.ObjectId;
    accountId: Types.ObjectId;
    userId: Types.ObjectId;
    type: CreditTransactionType;
    credits: number;
    balanceAfter: number;
    source: CreditTransactionSource;
    status: CreditTransactionStatus;
    referenceId?: string;
    idempotencyKey?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>({
    accountId: {
        type: Schema.Types.ObjectId,
        ref: 'CreditAccount',
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: Object.values(CreditTransactionType),
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true,
        min: 0
    },
    source: {
        type: String,
        enum: Object.values(CreditTransactionSource),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(CreditTransactionStatus),
        default: CreditTransactionStatus.SUCCESS
    },
    referenceId: {
        type: String,
        default: null,
        index: true
    },
    idempotencyKey: {
        type: String,
        default: null,
        unique: true,
        sparse: true,
        index: true
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

CreditTransactionSchema.index({ accountId: 1, createdAt: -1 });
CreditTransactionSchema.index({ userId: 1, createdAt: -1 });
CreditTransactionSchema.index({ source: 1 });
CreditTransactionSchema.index({ status: 1 });

export const CreditTransactionModel = mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema);

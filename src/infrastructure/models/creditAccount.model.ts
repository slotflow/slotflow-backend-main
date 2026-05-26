import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICreditAccount extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    balance: number;
    isActive: boolean;
    version: number;
    createdAt: Date;
    updatedAt: Date;
}

const CreditAccountSchema = new Schema<ICreditAccount>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    version: {
        type: Number,
        required: true,
        default: 1
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

CreditAccountSchema.index({ isActive: 1 });

export const CreditAccountModel = mongoose.model<ICreditAccount>('CreditAccount', CreditAccountSchema);

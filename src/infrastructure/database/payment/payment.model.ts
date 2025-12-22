import mongoose, { Document, Schema, Types } from "mongoose";
import { PaymentFor } from "../../../domain/enums/paymentFor.enum";
import { PaymentStatus } from "../../../domain/enums/paymentStatus.enum";
import { PaymentMethod } from "../../../domain/enums/paymentMethod.enum";
import { PaymentGateway } from "../../../domain/enums/paymentGateway.enum";

export interface IPayment extends Document {
    _id: Types.ObjectId;
    transactionId: string;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    paymentGateway: PaymentGateway;
    paymentFor: PaymentFor;
    initialAmount: number;
    discountAmount: number;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;

    userId?: Types.ObjectId;
    providerId?: Types.ObjectId;

    refundId?: string;
    refundAmount?: number;
    refundStatus?: PaymentStatus;
    refundAt?: Date;
    refundReason?: string;
    chargeId?: string;
};

const PaymentSchema = new Schema<IPayment>({
    transactionId: {
        type: String,
        required: [true, "Transaction ID is required"],
        unique: true,
    },
    paymentStatus: {
        type: String,
        enum: Object.values(PaymentStatus),
        required: [true, "Payment status is required"],
    },
    paymentMethod: {
        type: String,
        enum: Object.values(PaymentMethod),
        required: [true, "Payment method is required"],
    },
    paymentGateway: {
        type: String,
        enum: Object.values(PaymentGateway),
        required: [true, "Payment gateway is required"],
    },
    paymentFor: {
        type: String,
        enum: Object.values(PaymentFor),
        required: [true, "Payment purpose is required"],
    },
    initialAmount: {
        type: Number,
        required: [true, "Initial amount is required"],
        min: [0, "Initial amount cannot be negative"],
        max: [1000000, "Inital amount cannot be more than 1000000"],
    },
    discountAmount: {
        type: Number,
        required: [true, "Discount amount is required"],
        min: [0, "Discount amount cannot be negative"],
        max: [1000000, "Discount amount cannot be more than 1000000"],
    },
    totalAmount: {
        type: Number,
        required: [true, "Total amount is required"],
        min: [0, "Total amount cannot be negative"],
        max: [1000000, "Total amount cannot be more than 1000000"],
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: false,
    },
    providerId: {
        type: mongoose.Types.ObjectId,
        ref: "Provider",
        required: false,
    },
    refundId: {
        type: String,
    },
    refundAmount: {
        type: Number,
    },
    refundStatus: {
        type: String,
        enum: Object.values(PaymentStatus),
    },
    refundAt: {
        type: Date
    },
    refundReason: {
        type: String
    },
    chargeId: {
        type: String
    },
});

export const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);
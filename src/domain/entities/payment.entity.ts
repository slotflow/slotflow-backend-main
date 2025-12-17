import { Types } from "mongoose";
import { PaymentForType, PaymentGatewayType } from "../../application/dtos/common.dto";

export class Payment {
    constructor(
        public _id: Types.ObjectId,
        public transactionId: string,
        public paymentStatus: string,
        public paymentMethod: string,
        public paymentGateway: PaymentGatewayType,
        public paymentFor: PaymentForType,
        public initialAmount: number,
        public discountAmount: number,
        public totalAmount: number,
        public createdAt: Date,
        public updatedAt: Date,  
        
        public userId?: Types.ObjectId,
        public providerId?: Types.ObjectId,

        public refundId?: string,
        public refundAmount?: number,
        public refundStatus?: string,
        public refundAt?: Date,
        public refundReason?: string,
        public chargeId?: string,
    ) { }
}
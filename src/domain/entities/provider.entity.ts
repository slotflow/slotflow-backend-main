import { Types } from "mongoose";

export class Provider {
    constructor(
        public _id: Types.ObjectId,
        public username: string,
        public email: string,
        public password: string,
        public isBlocked: boolean,
        public isEmailVerified: boolean,
        public isAdminVerified: boolean,
        public verificationRejectionReason: string,
        public phone: string,
        public profileImage: string,
        public addressId: Types.ObjectId,
        public serviceId: Types.ObjectId,
        public serviceAvailabilityId: Types.ObjectId,
        public subscription: Types.ObjectId[],
        public verificationToken: string,
        public googleConnected: boolean,
        public googleId: string,
        public stripeAccountId: string,
        public trustedBySlotflow: boolean,
        public identityProof: string,
        public serviceProof: string,
        public createdAt: Date,
        public updatedAt: Date,
    ){}
}
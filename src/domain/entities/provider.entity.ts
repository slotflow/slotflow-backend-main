import { Types } from "mongoose";

export enum AdminVerificationStatus {
  REQUESTED = "REQUESTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RESUBMITTED = "RESUBMITTED",
  NOT_REQUESTED = "NOT_REQUESTED",
}

export class Provider {
    constructor(
        public readonly _id: Types.ObjectId,
        public username: string,
        public email: string,
        public password: string,
        public isBlocked: boolean,

        public isEmailVerified: boolean,

        public isAdminVerified: boolean,
        public verificationRejectionReason: string | null,
        
        public adminVerificationStatus: AdminVerificationStatus,
        public isAddressVerified: boolean,
        public isServiceDetailsVerified: boolean,
        public isAvailabilityVerified: boolean,
        public isProofsVerified: boolean,

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
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ){}
}
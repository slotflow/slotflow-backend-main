import { ReferralStatus } from "../enums/common.enum";

export interface ReferralProps {
    _id: string;
    referrerUserId: string;
    referredUserId: string;
    referralCode: string;
    status: ReferralStatus;
    rewardGiven: boolean;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

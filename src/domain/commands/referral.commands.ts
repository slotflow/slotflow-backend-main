import { ReferralStatus } from "../enums/common.enum";

export type CreateReferralProps = {
    referrerUserId: string;
    refereeUserId: string;
    referralCode: string;
};

export type CompleteReferralProps = {
    referralId: string;
};

export type RewardReferralProps = {
    referralId: string;
};

export type UpdateReferralStatusProps = {
    status: ReferralStatus;
};

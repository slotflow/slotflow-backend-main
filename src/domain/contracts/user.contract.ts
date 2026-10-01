import { TimeZone } from "../commands/user.commands";
import { HearAboutUsOptionValue, OnboardingStatus, Role } from "../enums/common.enum";

export interface UserProps {
    _id: string

    username: string | null;
    email: string;
    password: string | null;

    role: Role;
    onboardingType: Role | null;
    onboardingStatus: OnboardingStatus;

    isBlocked: boolean;

    phone: string | null;
    profileImage: string | null;
    addressId: string | null;
    googleConnected: boolean;
    googleId: string | null;

    whereDidHearAboutUs: HearAboutUsOptionValue | null;
    referralCode: string | null;
    referredBy: string | null;

    timeZone: TimeZone | null;

    createdAt: Date,
    updatedAt: Date
}
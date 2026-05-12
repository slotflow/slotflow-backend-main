import { HearAboutUsOptionValue, OnboardingStatus, Role } from "../enums/common.enum";

export interface UserProps {
    _id: string

    username: string;
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
    stripeConnected: boolean;
    stripeAccountId: string | null;
    stripeCustomerId: string | null;

    allowPushNotification: boolean;
    whereDidHearAboutUs: HearAboutUsOptionValue | null;
    referralCode: string | null;
    referredBy: string | null;

    createdAt: Date,
    updatedAt: Date
}
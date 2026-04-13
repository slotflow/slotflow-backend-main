import { Role } from "../enums/common.enum";

export interface UserProps {
    _id: string

    username: string;
    email: string;
    password: string | null;

    role: Role;
    hasSelectedRole: boolean;
    isOnboardingCompleted: boolean;

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

    createdAt: Date,
    updatedAt: Date
}
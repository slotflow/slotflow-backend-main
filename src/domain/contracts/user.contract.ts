export interface UserProps {
    _id: string
    username: string;
    email: string;
    password: string | null;
    isBlocked: boolean;
    isEmailVerified: boolean;
    phone: string | null;
    profileImage: string | null;
    addressId: string | null;
    verificationToken: string | null;
    googleConnected: boolean;
    googleId: string | null;
    stripeConnected: boolean;
    stripeAccountId: string | null;
    stripeCustomerId: string | null;
    allowPushNotification: boolean | null;
    createdAt: Date,
    updatedAt: Date
}
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
    bookingsId: string | null;
    verificationToken: string | null;
    googleConnected: boolean;
    googleId: string | null;
    createdAt: Date,
    updatedAt: Date
}
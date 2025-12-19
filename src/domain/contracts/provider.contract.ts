import { AdminVerificationStatus } from "../enums/adminVerificationStatus.enum";

export interface ProviderProps {
  _id: string;
  username: string;
  email: string;
  password: string | null;
  isBlocked: boolean;
  isEmailVerified: boolean;
  isAdminVerified: boolean;
  verificationRejectionReason: string | null;
  adminVerificationStatus: AdminVerificationStatus;
  isAddressVerified: boolean;
  isServiceDetailsVerified: boolean;
  isAvailabilityVerified: boolean;
  isProofsVerified: boolean;
  phone: string | null;
  profileImage: string | null;
  addressId: string | null;
  serviceId: string | null;
  serviceAvailabilityId: string | null;
  subscription: string[];
  verificationToken: string | null;
  googleConnected: boolean;
  googleId: string | null;
  stripeAccountId: string | null;
  trustedBySlotflow: boolean;
  identityProof: string | null;
  serviceProof: string | null;
  createdAt: Date;
  updatedAt: Date;
}
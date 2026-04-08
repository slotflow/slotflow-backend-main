import { AdminVerificationStatus } from "../enums/adminVerificationStatus.enum";

export interface ProviderProfileProps {
  _id: string;
  userId: string;
  isAdminVerified: boolean;
  verificationRejectionReason: string | null;
  adminVerificationStatus: AdminVerificationStatus;
  isAddressVerified: boolean;
  isServiceDetailsVerified: boolean;
  isAvailabilityVerified: boolean;
  isProofsVerified: boolean;
  addressId: string | null;
  serviceId: string | null;
  serviceAvailabilityId: string | null;
  subscription: string[];
  trustedBySlotflow: boolean;
  identityProof: string | null;
  serviceProof: string | null;
  createdAt: Date;
  updatedAt: Date;
}
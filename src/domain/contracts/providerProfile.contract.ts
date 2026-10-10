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
  serviceId: string | null;
  serviceAvailabilityId: string | null;
  subscriptions: string[];
  trustedBySlotflow: boolean;
  identityProof: string | null;
  serviceProof: string | null;
  hasUsedTrial: boolean;
  createdAt: Date;
  updatedAt: Date;
}

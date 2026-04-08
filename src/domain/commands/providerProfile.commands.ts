// first step of provider profile creation
// after addingthe address in the onboarding only the provider profile will create
export interface CreateProviderProfile {
    userId: string;
    addressId: string;
};

export type RejectVerification = {
  verificationRejectionReason: string;
  isAddressVerified: boolean;
  isServiceDetailsVerified: boolean;
  isAvailabilityVerified: boolean;
  isProofsVerified: boolean;
};

export type SubmitIdentityProof = {
  identityProof: string | null;
};

export type SubmitServiceProof = {
  serviceProof: string | null;
};
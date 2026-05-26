// first step of provider profile creation
// after addingthe address in the onboarding only the provider profile will create
export interface CreateProviderProfileProps {
    userId: string;
};

export type RejectVerificationProps = {
  verificationRejectionReason: string;
  isAddressVerified: boolean;
  isServiceDetailsVerified: boolean;
  isAvailabilityVerified: boolean;
  isProofsVerified: boolean;
};

export type SubmitIdentityProofProps = {
  identityProof: string | null;
};

export type SubmitServiceProofProps = {
  serviceProof: string | null;
};
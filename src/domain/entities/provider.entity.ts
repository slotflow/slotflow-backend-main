export enum AdminVerificationStatus {
  REQUESTED = "REQUESTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RESUBMITTED = "RESUBMITTED",
  NOT_REQUESTED = "NOT_REQUESTED",
}

export type CreateLocalProviderProps = {
  id: string;
  username: string;
  email: string;
  password: string;
  verificationToken: string;
};

export type UpdatePasswordProps = {
  verificationToken?: string;
  password: string;
};

export type UpdateInfoProps = {
  username?: string;
  phone?: string;
}

export type UpdateIdentityProofs = {
  identityProof: string | null;
}

export type UpdateServiceProofs = {
  serviceProof: string | null;
}

export type UpdateGoogleData = {
  googleId: string;
  googleConnected: boolean;
}

export type UpdateProfileImage = {
  profileImage: string | null;
}

export type CreateGoogleProviderProps = {
  id: string;
  username: string;
  email: string;
  googleId: string;
  profileImage: string;
  isEmailVerified: boolean;
};

export type RejectProvider = {
  verificationRejectionReason: string;
  isAddressVerified: boolean;
  isServiceDetailsVerified: boolean;
  isAvailabilityVerified: boolean;
  isProofsVerified: boolean;
}

export class Provider {
  constructor(
    public readonly _id: string,
    public username: string,
    public email: string,
    public password: string | null,
    public isBlocked: boolean,

    public isEmailVerified: boolean,

    public isAdminVerified: boolean,
    public verificationRejectionReason: string | null,

    public adminVerificationStatus: AdminVerificationStatus,
    public isAddressVerified: boolean,
    public isServiceDetailsVerified: boolean,
    public isAvailabilityVerified: boolean,
    public isProofsVerified: boolean,

    public phone: string | null,
    public profileImage: string | null,
    public addressId: string | null,
    public serviceId: string | null,
    public serviceAvailabilityId: string | null,
    public subscription: string[],
    public verificationToken: string | null,
    public googleConnected: boolean,
    public googleId: string | null,
    public stripeAccountId: string | null,
    public trustedBySlotflow: boolean,
    public identityProof: string | null,
    public serviceProof: string | null,
    public readonly createdAt = new Date(),
    public updatedAt = new Date(),
  ) { }

  static createLocal(props: CreateLocalProviderProps): Provider {
    return new Provider(
      props.id,
      props.username,
      props.email,
      props.password,
      false,
      false,
      false,
      null,
      AdminVerificationStatus.NOT_REQUESTED,
      false,
      false,
      false,
      false,
      null,
      null,
      null,
      null,
      null,
      [],
      props.verificationToken,
      false,
      null,
      null,
      false,
      null,
      null,
      new Date(),
      new Date()
    );
  }

  static createGoogle(props: CreateGoogleProviderProps): Provider {
    return new Provider(
      props.id,
      props.username,
      props.email,
      null,
      false,
      props.isEmailVerified,
      false,
      null,
      AdminVerificationStatus.NOT_REQUESTED,
      false,
      false,
      false,
      false,
      null,
      props.profileImage,
      null,
      null,
      null,
      [],
      null,
      true,
      props.googleId,
      null,
      false,
      null,
      null,
      new Date(),
      new Date()
    );
  }

  block() {
    this.isBlocked = true;
    this.updatedAt = new Date();
  }

  unblock() {
    this.isBlocked = false;
    this.updatedAt = new Date();
  }

  markEmailVerified() {
    this.isEmailVerified = true;
    this.updatedAt = new Date();
  }

  requestAdminVerification() {
    this.adminVerificationStatus = AdminVerificationStatus.REQUESTED;
    this.verificationRejectionReason = null;
    this.updatedAt = new Date();
  }

  rerequestAdminVerification() {
    this.adminVerificationStatus = AdminVerificationStatus.RESUBMITTED;
    this.verificationRejectionReason = null;
    this.updatedAt = new Date();
  }

  approveAdminVerification() {
    if (this.isBlocked) {
      throw new Error("Blocked providers cannot be approved");
    }

    if (
      this.adminVerificationStatus !== AdminVerificationStatus.REQUESTED &&
      this.adminVerificationStatus !== AdminVerificationStatus.RESUBMITTED
    ) {
      throw new Error("Provider has not requested verification");
    }

    this.isAdminVerified = true;
    this.verificationRejectionReason = null;
    this.adminVerificationStatus = AdminVerificationStatus.APPROVED;
    this.isAddressVerified = true;
    this.isServiceDetailsVerified = true;
    this.isAvailabilityVerified = true;
    this.isProofsVerified = true;
    this.updatedAt = new Date();
  }

  rejectAdminVerification(props: RejectProvider) {
    this.isAdminVerified = false;
    this.adminVerificationStatus = AdminVerificationStatus.REJECTED;
    this.verificationRejectionReason = props.verificationRejectionReason;
    this.isAddressVerified = props.isAddressVerified;
    this.isServiceDetailsVerified = props.isServiceDetailsVerified;
    this.isAvailabilityVerified = props.isAvailabilityVerified;
    this.isProofsVerified = props.isProofsVerified;
    this.updatedAt = new Date();
  }

  giveTrustTag() { // TODO RENAME grantTrustTag
    this.trustedBySlotflow = true;
    this.updatedAt = new Date();
  }

  removeTrustTag() { // TODO revokeTrustTag
    this.trustedBySlotflow = false;
    this.updatedAt = new Date();
  }

  updatePassword(props: UpdatePasswordProps) {
    if (props.verificationToken) {
      this.verificationToken = props.verificationToken;
    }
    this.password = props.password;
    this.updatedAt = new Date();
  }

  updateAddressId(addressId: string) {
    this.addressId = addressId;
    this.updatedAt = new Date();
  }

  updateServiceId(serviceId: string) {
    this.serviceId = serviceId;
    this.updatedAt = new Date();
  }

  updateServiceAvailabilityId(serviceAvailabilityId: string) {
    this.serviceAvailabilityId = serviceAvailabilityId;
    this.updatedAt = new Date();
  }

  updateStripeId(stripeId: string) {
    this.stripeAccountId = stripeId;
  }

  addSubscription(subscriptionId: string) {
    this.subscription.push(subscriptionId);
    this.updatedAt = new Date();
  }

  updateInfo(props: UpdateInfoProps) {
    if (props.phone !== undefined) {
      this.phone = props.phone;
    }

    if (props.username !== undefined) {
      this.username = props.username;
    }
    this.updatedAt = new Date();
  }

  updateIdentityProof(props: UpdateIdentityProofs) {
    this.identityProof = props.identityProof;
    this.updatedAt = new Date();
  }

  updateServiceProof(props: UpdateServiceProofs) {
    this.serviceProof = props.serviceProof;
    this.updatedAt = new Date();
  }

  updateGoogleData(props: UpdateGoogleData) {
    this.googleId = props.googleId;
    this.googleConnected = props.googleConnected;
    this.updatedAt = new Date();
  }

  updateProfileImage(props: UpdateProfileImage) {
    this.profileImage = props.profileImage;
    this.updatedAt = new Date();
  }

}
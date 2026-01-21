import { ProviderProps } from "../contracts/provider.contract";
import { AdminVerificationStatus } from "../enums/adminVerificationStatus.enum";
import { ChangePassword, ChangeProfileImage, ChangeProfileInfo, CreateGoogleProviderProps, CreateLocalProviderProps, LinkGoogleAccount, RejectVerification, SubmitIdentityProof, SubmitServiceProof } from "../commands/provider.commands";

export class Provider {
  private props: ProviderProps;

  constructor(props: ProviderProps) {
    this.props = props;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  private ensureNotBlocked(action: string) {
    if (this.props.isBlocked) {
      throw new Error(`Blocked providers cannot ${action}`);
    }
  }

  static createLocal(props: CreateLocalProviderProps): Provider {
    return new Provider({
      _id: "",
      username: props.username,
      email: props.email,
      password: props.password,

      isBlocked: false,
      isEmailVerified: false,
      isAdminVerified: false,
      verificationRejectionReason: null,

      adminVerificationStatus: AdminVerificationStatus.NOT_REQUESTED,
      isAddressVerified: false,
      isServiceDetailsVerified: false,
      isAvailabilityVerified: false,
      isProofsVerified: false,

      phone: null,
      profileImage: null,
      addressId: null,
      serviceId: null,
      serviceAvailabilityId: null,

      subscription: [],
      verificationToken: props.verificationToken,

      googleConnected: false,
      googleId: null,

      stripeAccountId: null,
      trustedBySlotflow: false,

      identityProof: null,
      serviceProof: null,

      allowPushNotification: null,

      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static createGoogle(props: CreateGoogleProviderProps): Provider {
    return new Provider({
      _id: "",
      username: props.username,
      email: props.email,
      password: null,

      isBlocked: false,
      isEmailVerified: props.isEmailVerified,
      isAdminVerified: false,
      verificationRejectionReason: null,

      adminVerificationStatus: AdminVerificationStatus.NOT_REQUESTED,
      isAddressVerified: false,
      isServiceDetailsVerified: false,
      isAvailabilityVerified: false,
      isProofsVerified: false,

      phone: null,
      profileImage: props.profileImage,
      addressId: null,
      serviceId: null,
      serviceAvailabilityId: null,

      subscription: [],
      verificationToken: null,

      googleConnected: true,
      googleId: props.googleId,

      stripeAccountId: null,
      trustedBySlotflow: false,

      identityProof: null,
      serviceProof: null,

      allowPushNotification: null,

      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Getters

  get _id(): string {
    return this.props._id;
  }

  get username(): string {
    return this.props.username;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string | null {
    return this.props.password;
  }

  get phone(): string | null {
    return this.props.phone;
  }

  get profileImage(): string | null {
    return this.props.profileImage;
  }

  get isBlocked(): boolean {
    return this.props.isBlocked;
  }

  get isEmailVerified(): boolean {
    return this.props.isEmailVerified;
  }

  get isAdminVerified(): boolean {
    return this.props.isAdminVerified;
  }

  get trustedBySlotflow(): boolean {
    return this.props.trustedBySlotflow;
  }

  get adminVerificationStatus(): AdminVerificationStatus {
    return this.props.adminVerificationStatus;
  }

  get verificationRejectionReason(): string | null {
    return this.props.verificationRejectionReason;
  }

  get isAddressVerified(): boolean {
    return this.props.isAddressVerified;
  }

  get isServiceDetailsVerified(): boolean {
    return this.props.isServiceDetailsVerified;
  }

  get isAvailabilityVerified(): boolean {
    return this.props.isAvailabilityVerified;
  }

  get isProofsVerified(): boolean {
    return this.props.isProofsVerified;
  }

  get addressId(): string | null {
    return this.props.addressId;
  }

  get serviceId(): string | null {
    return this.props.serviceId;
  }

  get serviceAvailabilityId(): string | null {
    return this.props.serviceAvailabilityId;
  }

  get subscription(): string[] {
    return [...this.props.subscription];
  }

  get googleConnected(): boolean {
    return this.props.googleConnected;
  }

  get googleId(): string | null {
    return this.props.googleId;
  }

  get stripeAccountId(): string | null {
    return this.props.stripeAccountId;
  }

  get identityProof(): string | null {
    return this.props.identityProof;
  }

  get serviceProof(): string | null {
    return this.props.serviceProof;
  }

  get verificationToken(): string | null {
    return this.props.verificationToken;
  }

  get allowPushNotification(): boolean | null {
    return this.props.allowPushNotification;
  };

  get createdAt(): Date {
    return this.props.createdAt;
  };

  get updatedAt(): Date {
    return this.props.updatedAt;
  };

  // Business Methods

  getProps(): Readonly<ProviderProps> {
    return { ...this.props }
  };

  block() {
    this.props.isBlocked = true;
    this.touch();
  };

  unblock() {
    this.props.isBlocked = false;
    this.touch();
  };

  markEmailVerified() {
    this.props.isEmailVerified = true;
    this.touch();
  };

  submitForAdminVerification() {
    this.props.adminVerificationStatus = AdminVerificationStatus.REQUESTED;
    this.props.verificationRejectionReason = null;
    this.touch();
  };

  resubmitForAdminVerification() {
    this.props.adminVerificationStatus = AdminVerificationStatus.RESUBMITTED;
    this.props.verificationRejectionReason = null;
    this.touch();
  };

  approveVerification() {
    if (
      this.props.adminVerificationStatus !== AdminVerificationStatus.REQUESTED &&
      this.props.adminVerificationStatus !== AdminVerificationStatus.RESUBMITTED
    ) {
      throw new Error("Provider has not requested verification");
    };

    this.props.isAdminVerified = true;
    this.props.verificationRejectionReason = null;
    this.props.adminVerificationStatus = AdminVerificationStatus.APPROVED;

    this.props.isAddressVerified = true;
    this.props.isServiceDetailsVerified = true;
    this.props.isAvailabilityVerified = true;
    this.props.isProofsVerified = true;

    this.touch();
  };

  rejectVerification(props: RejectVerification) {
    this.props.isAdminVerified = false;
    this.props.adminVerificationStatus = AdminVerificationStatus.REJECTED;
    this.props.verificationRejectionReason = props.verificationRejectionReason;

    this.props.isAddressVerified = props.isAddressVerified;
    this.props.isServiceDetailsVerified = props.isServiceDetailsVerified;
    this.props.isAvailabilityVerified = props.isAvailabilityVerified;
    this.props.isProofsVerified = props.isProofsVerified;

    this.touch();
  };


  grantTrustBadge() {
    this.props.trustedBySlotflow = true;
    this.touch();
  }

  revokeTrustBadge() {
    this.props.trustedBySlotflow = false;
    this.touch();
  }


  changePassword(props: ChangePassword) {
    this.ensureNotBlocked("update password");

    if (props.verificationToken) {
      this.props.verificationToken = props.verificationToken;
    }

    this.props.password = props.password;
    this.touch();
  }


  attachAddress(addressId: string) {
    this.ensureNotBlocked("update address");

    this.props.addressId = addressId;
    this.touch();
  }

  attachService(serviceId: string) {
    this.ensureNotBlocked("update service");

    this.props.serviceId = serviceId;
    this.touch();
  }

  attachServiceAvailability(serviceAvailabilityId: string) {
    this.ensureNotBlocked("update service availability");

    this.props.serviceAvailabilityId = serviceAvailabilityId;
    this.touch();
  }

  linkStripeAccount(stripeId: string) {
    this.ensureNotBlocked("update stripe");

    this.props.stripeAccountId = stripeId;
    this.touch();
  }

  linkGoogleAccount(props: LinkGoogleAccount) {
    this.ensureNotBlocked("update google data");

    this.props.googleId = props.googleId;
    this.props.googleConnected = props.googleConnected;
    this.touch();
  }


  activateSubscription(subscriptionId: string) {
    this.ensureNotBlocked("subscribe");

    this.props.subscription.push(subscriptionId);
    this.touch();
  }


  updateProfileInfo(props: ChangeProfileInfo) {
    this.ensureNotBlocked("update info");

    if (props.phone !== undefined) {
      this.props.phone = props.phone;
    }

    if (props.username !== undefined) {
      this.props.username = props.username;
    }

    this.touch();
  }

  updateProfileImage(props: ChangeProfileImage) {
    this.ensureNotBlocked("update profile image");

    this.props.profileImage = props.profileImage;
    this.touch();
  }


  submitIdentityProof(props: SubmitIdentityProof) {
    this.ensureNotBlocked("update identity proof");

    this.props.identityProof = props.identityProof;
    this.touch();
  }

  submitServiceProof(props: SubmitServiceProof) {
    this.ensureNotBlocked("update service proof");

    this.props.serviceProof = props.serviceProof;
    this.touch();
  }

}
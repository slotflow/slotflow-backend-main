import { AdminVerificationStatus } from "../enums/adminVerificationStatus.enum";
import { ChangePassword, ChangeProfileImage, ChangeProfileInfo, CreateGoogleProviderProps, CreateLocalProviderProps, LinkGoogleAccount, RejectVerification, SubmitIdentityProof, SubmitServiceProof } from "../commands/provider.commands";

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

  private ensureNotBlocked(action: string) {
    if (this.isBlocked) {
      throw new Error(`Blocked providers cannot ${action}`);
    }
  }

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

  submitForAdminVerification() { 
    this.adminVerificationStatus = AdminVerificationStatus.REQUESTED;
    this.verificationRejectionReason = null;
    this.updatedAt = new Date();
  }

  resubmitForAdminVerification() { 
    this.adminVerificationStatus = AdminVerificationStatus.RESUBMITTED;
    this.verificationRejectionReason = null;
    this.updatedAt = new Date();
  }

  approveVerification() { 
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

  rejectVerification(props: RejectVerification) { 
    this.isAdminVerified = false;
    this.adminVerificationStatus = AdminVerificationStatus.REJECTED;
    this.verificationRejectionReason = props.verificationRejectionReason;
    this.isAddressVerified = props.isAddressVerified;
    this.isServiceDetailsVerified = props.isServiceDetailsVerified;
    this.isAvailabilityVerified = props.isAvailabilityVerified;
    this.isProofsVerified = props.isProofsVerified;
    this.updatedAt = new Date();
  }

  grantTrustBadge() { 
    this.trustedBySlotflow = true;
    this.updatedAt = new Date();
  }

  revokeTrustBadge() { 
    this.trustedBySlotflow = false;
    this.updatedAt = new Date();
  }

  changePassword(props: ChangePassword) { 
    this.ensureNotBlocked("update password");

    if (props.verificationToken) {
      this.verificationToken = props.verificationToken;
    }
    this.password = props.password;
    this.updatedAt = new Date();
  }

  attachAddress(addressId: string) { 
    this.ensureNotBlocked("update address");
  
    this.addressId = addressId;
    this.updatedAt = new Date();
  }

  attachService(serviceId: string) { 
    this.ensureNotBlocked("update service");
    
    this.serviceId = serviceId;
    this.updatedAt = new Date();
  }

  attachServiceAvailability(serviceAvailabilityId: string) { 
    this.ensureNotBlocked("update service availability");
   
    this.serviceAvailabilityId = serviceAvailabilityId;
    this.updatedAt = new Date();
  }

  linkStripeAccount(stripeId: string) { 
    this.ensureNotBlocked("update stripe");
    
    this.stripeAccountId = stripeId;
    this.updatedAt = new Date();
  }

  activateSubscription(subscriptionId: string) { 
    this.ensureNotBlocked("subscribe");
    
    this.subscription.push(subscriptionId);
    this.updatedAt = new Date();
  }

  updateProfileInfo(props: ChangeProfileInfo) { 
    this.ensureNotBlocked("update info");
   
    if (props.phone !== undefined) {
      this.phone = props.phone;
    }

    if (props.username !== undefined) {
      this.username = props.username;
    }
    this.updatedAt = new Date();
  }

  submitIdentityProof(props: SubmitIdentityProof) { 
    this.ensureNotBlocked("update identity proof");
   
    this.identityProof = props.identityProof;
    this.updatedAt = new Date();
  }

  submitServiceProof(props: SubmitServiceProof) { 
    this.ensureNotBlocked("update service proof");
    
    this.serviceProof = props.serviceProof;
    this.updatedAt = new Date();
  }

  linkGoogleAccount(props: LinkGoogleAccount) { 
    this.ensureNotBlocked("update google data");
    
    this.googleId = props.googleId;
    this.googleConnected = props.googleConnected;
    this.updatedAt = new Date();
  }

  updateProfileImage(props: ChangeProfileImage) {
    this.ensureNotBlocked("update profile image");
    
    this.profileImage = props.profileImage;
    this.updatedAt = new Date();
  }

}
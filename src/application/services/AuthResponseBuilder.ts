import { PlanName } from "../../domain/enums/plan.enum";
import { User } from "../../domain/entities/user.entity";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";
import { ProviderProfile } from "../../domain/entities/providerProfile.entity";
import { IPlanRepository } from "../../domain/interfaces/repositories/IPlan.repository";
import { ISubscriptionRepository } from "../../domain/interfaces/repositories/ISubscription.repository";

export class AuthResponseBuilder {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository
  ) { }

  buildBaseUser(user: User) {
    return {
      uid: user._id,
      username: user.username,
      email: user.email,

      role: user.role,
      onboardingType: user.onboardingType,
      onboardingStatus: user.onboardingStatus,

      isBlocked: user.isBlocked,
      isLoggedIn: true,

      phone: user.phone,
      profileImage: user.profileImage,

      isAddressAdded: !!user.addressId,

      googleConnected: user.googleConnected,

      stripeAccountStatus: user.stripeAccountStatus,
      stripeCustomerId: user.stripeCustomerId,

      allowPushNotification: user.allowPushNotification,
    };
  }

  buildProviderFields(
    providerProfile: ProviderProfile | null,
    providerSubscription: PlanName
  ) {
    return {
      isServiceDetailsAdded: !!providerProfile?.serviceId,
      isServiceAvailabilityAdded: !!providerProfile?.serviceAvailabilityId,
      isProofSubmitted: {
        identityProof: !!providerProfile?.identityProof,
        serviceProof: !!providerProfile?.serviceProof,
      },

      isAddressVerified: providerProfile?.isAddressVerified ?? false,
      isServiceDetailsVerified:
        providerProfile?.isServiceDetailsVerified ?? false,
      isAvailabilityVerified:
        providerProfile?.isAvailabilityVerified ?? false,
      isProofsVerified: providerProfile?.isProofsVerified ?? false,
      isAdminVerified: providerProfile?.isAdminVerified ?? false,

      providerSubscription,
      verificationRejectionReason:
        providerProfile?.verificationRejectionReason ?? null,
      adminVerificationStatus: providerProfile?.adminVerificationStatus,
    };
  }

  async resolveSubscription(
    providerProfile: ProviderProfile
  ): Promise<PlanName> {
    const subscriptions = providerProfile.subscription;

    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return PlanName.NO_SUBSCRIPTION;
    }

    const subscriptionId = subscriptions[subscriptions.length - 1];

    const subscription =
      await this.subscriptionRepository.findById(subscriptionId);

    if (!subscription) return PlanName.NO_SUBSCRIPTION;

    const now = new Date();
    const isActive =
      subscription.subscriptionStatus === SubscriptionStatus.ACTIVE &&
      new Date(subscription.endDate) > now;

    if (!isActive) return PlanName.NO_SUBSCRIPTION;

    const plan = await this.planRepository.findById(
      subscription.subscriptionPlanId
    );

    return plan?.planName || PlanName.NO_SUBSCRIPTION;
  }
}
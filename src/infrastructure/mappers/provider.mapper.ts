import { Types } from "mongoose";
import { IProvider } from "../database/provider.model";
import { Provider } from "../../domain/entities/provider.entity";

export class ProviderMapper {

  static toDomain(doc: IProvider): Provider {
    return new Provider({
      _id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      password: doc.password ?? null,
      isBlocked: doc.isBlocked,
      isEmailVerified: doc.isEmailVerified,
      isAdminVerified: doc.isAdminVerified,
      verificationRejectionReason: doc.verificationRejectionReason ?? null,
      adminVerificationStatus: doc.adminVerificationStatus,
      isAddressVerified: doc.isAddressVerified,
      isServiceDetailsVerified: doc.isServiceDetailsVerified,
      isAvailabilityVerified: doc.isAvailabilityVerified,
      isProofsVerified: doc.isProofsVerified,
      phone: doc.phone ?? null,
      profileImage: doc.profileImage ?? null,
      addressId: doc.addressId ? doc.addressId.toString() : null,
      serviceId: doc.serviceId ? doc.serviceId.toString() : null,
      serviceAvailabilityId: doc.serviceAvailabilityId ? doc.serviceAvailabilityId.toString() : null,
      subscription: doc.subscription?.map(id => id.toString()) ?? [],
      verificationToken: doc.verificationToken ?? null,
      googleConnected: doc.googleConnected,
      googleId: doc.googleId ?? null,
      stripeAccountId: doc.stripeAccountId ?? null,
      trustedBySlotflow: doc.trustedBySlotflow,
      identityProof: doc.identityProof ?? null,
      serviceProof: doc.serviceProof ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(entity: Provider) {
    const props = entity.getProps();

    return {
      username: props.username,
      email: props.email,
      password: props.password,
      isBlocked: props.isBlocked,
      isEmailVerified: props.isEmailVerified,
      isAdminVerified: props.isAdminVerified,
      verificationRejectionReason: props.verificationRejectionReason,
      adminVerificationStatus: props.adminVerificationStatus,
      isAddressVerified: props.isAddressVerified,
      isServiceDetailsVerified: props.isServiceDetailsVerified,
      isAvailabilityVerified: props.isAvailabilityVerified,
      isProofsVerified: props.isProofsVerified,
      phone: props.phone,
      profileImage: props.profileImage,
      addressId: props.addressId ? new Types.ObjectId(props.addressId) : null,
      serviceId: props.serviceId ? new Types.ObjectId(props.serviceId) : null,
      serviceAvailabilityId: props.serviceAvailabilityId ? new Types.ObjectId(props.serviceAvailabilityId) : null,
      subscription: props.subscription.map(id => new Types.ObjectId(id)),
      verificationToken: props.verificationToken,
      googleConnected: props.googleConnected,
      googleId: props.googleId,
      stripeAccountId: props.stripeAccountId,
      trustedBySlotflow: props.trustedBySlotflow,
      identityProof: props.identityProof,
      serviceProof: props.serviceProof,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}

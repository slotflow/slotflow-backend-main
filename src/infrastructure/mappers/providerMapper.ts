import { Types } from "mongoose";
import { IProvider } from "../database/provider/provider.model";
import { Provider } from "../../domain/entities/provider.entity";

export class ProviderMapper {

  static toDomain(doc: IProvider): Provider {
    return new Provider(
      doc._id.toString(),
      doc.username,
      doc.email,
      doc.password ?? null,
      doc.isBlocked,

      doc.isEmailVerified,

      doc.isAdminVerified,
      doc.verificationRejectionReason ?? null,

      doc.adminVerificationStatus,
      doc.isAddressVerified,
      doc.isServiceDetailsVerified,
      doc.isAvailabilityVerified,
      doc.isProofsVerified,

      doc.phone ?? null,
      doc.profileImage ?? null,
      doc.addressId ? doc.addressId.toString() : null,
      doc.serviceId ? doc.serviceId.toString() : null,
      doc.serviceAvailabilityId ? doc.serviceAvailabilityId.toString() : null,

      doc.subscription?.map(id => id.toString()) ?? [],
      doc.verificationToken ?? null,
      doc.googleConnected,
      doc.googleId ?? null,
      doc.stripeAccountId ?? null,
      doc.trustedBySlotflow,
      doc.identityProof ?? null,
      doc.serviceProof ?? null,
      doc.createdAt,
      doc.updatedAt
    );
  }

  static toPersistence(entity: Provider) {
    return {
      username: entity.username,
      email: entity.email,
      password: entity.password,
      isBlocked: entity.isBlocked,

      isEmailVerified: entity.isEmailVerified,

      isAdminVerified: entity.isAdminVerified,
      verificationRejectionReason: entity.verificationRejectionReason,

      adminVerificationStatus: entity.adminVerificationStatus,
      isAddressVerified: entity.isAddressVerified,
      isServiceDetailsVerified: entity.isServiceDetailsVerified,
      isAvailabilityVerified: entity.isAvailabilityVerified,
      isProofsVerified: entity.isProofsVerified,

      phone: entity.phone,
      profileImage: entity.profileImage,
      addressId: entity.addressId ? new Types.ObjectId(entity.addressId) : null,
      serviceId: entity.serviceId ? new Types.ObjectId(entity.serviceId) : null,
      serviceAvailabilityId: entity.serviceAvailabilityId ? new Types.ObjectId(entity.serviceAvailabilityId) : null,

      subscription: entity.subscription.map(id => new Types.ObjectId(id)),
      verificationToken: entity.verificationToken,
      googleConnected: entity.googleConnected,
      googleId: entity.googleId,
      stripeAccountId: entity.stripeAccountId,
      trustedBySlotflow: entity.trustedBySlotflow,
      identityProof: entity.identityProof,
      serviceProof: entity.serviceProof,
    };
  }
}

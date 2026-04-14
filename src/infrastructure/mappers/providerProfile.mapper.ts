import { Types } from "mongoose";
import { ProviderProfile } from "../../domain/entities/providerProfile.entity";
import { IProviderProfile } from "../models/providerProfile.model";

export class ProviderProfileMapper {

  static toDomain(doc: IProviderProfile): ProviderProfile {
    return new ProviderProfile({
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      isAdminVerified: doc.isAdminVerified,
      verificationRejectionReason: doc.verificationRejectionReason ?? null,
      adminVerificationStatus: doc.adminVerificationStatus,
      isAddressVerified: doc.isAddressVerified,
      isServiceDetailsVerified: doc.isServiceDetailsVerified,
      isAvailabilityVerified: doc.isAvailabilityVerified,
      isProofsVerified: doc.isProofsVerified,
      serviceId: doc.serviceId ? doc.serviceId.toString() : null,
      serviceAvailabilityId: doc.serviceAvailabilityId ? doc.serviceAvailabilityId.toString() : null,
      subscription: doc.subscription?.map(id => id.toString()) ?? [],
      trustedBySlotflow: doc.trustedBySlotflow,
      identityProof: doc.identityProof ?? null,
      serviceProof: doc.serviceProof ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(entity: ProviderProfile) {
    const props = entity.getProps();

    return {
      userId: props.userId,
      isAdminVerified: props.isAdminVerified,
      verificationRejectionReason: props.verificationRejectionReason,
      adminVerificationStatus: props.adminVerificationStatus,
      isAddressVerified: props.isAddressVerified,
      isServiceDetailsVerified: props.isServiceDetailsVerified,
      isAvailabilityVerified: props.isAvailabilityVerified,
      isProofsVerified: props.isProofsVerified,
      serviceId: props.serviceId ? new Types.ObjectId(props.serviceId) : null,
      serviceAvailabilityId: props.serviceAvailabilityId ? new Types.ObjectId(props.serviceAvailabilityId) : null,
      subscription: props.subscription.map(id => new Types.ObjectId(id)),
      trustedBySlotflow: props.trustedBySlotflow,
      identityProof: props.identityProof,
      serviceProof: props.serviceProof,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}

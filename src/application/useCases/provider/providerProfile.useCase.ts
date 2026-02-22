import { awsConfig } from "../../../config/env";
import {
  ProviderDeleteProofRequest,
  ProviderAdminApprovalRequest,
  ProviderAdminApprovalResponse,
  ProviderUpdateProviderInfoRequest,
  ProviderUpdateServiceProofRequest,
  ProviderFetchProfileDetailsRequest,
  ProviderUpdateServiceProofResponse,
  ProviderUpdateprofileImageResponse,
  ProviderUpdateProviderInfoResponse,
  ProviderUpdateIdentityProofRequest,
  ProviderFetchProfileDetailsResponse,
  ProviderUpdateIdentityProofResponse,
  ProviderUpdateprofileImageRequestPayload,
  ProviderUpdatePushNotificationRequest,
} from "../../dtos/provider.dto";
import { log } from "../../../shared/logger/logger";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { AdminVerificationStatus } from "../../../domain/enums/adminVerificationStatus.enum";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";

export class ProviderFetchProfileDetailsUseCase {
  constructor(
    private providerRepository: IProviderRepository
  ) { };

  async execute(payload: ProviderFetchProfileDetailsRequest): Promise<ProviderFetchProfileDetailsResponse> {
    try {
      const { providerId } = payload;

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) return null;

      return {
        createdAt: provider.createdAt,
        email: provider.email,
        isAdminVerified: provider.isAdminVerified,
        isBlocked: provider.isBlocked,
        isEmailVerified: provider.isEmailVerified,
        phone: provider.phone,
        username: provider.username,
        trustedBySlotflow: provider.trustedBySlotflow,
        updatedAt: provider.updatedAt,
        adminVerificationStatus: provider.adminVerificationStatus,
        isAddressVerified: provider.isAddressVerified,
        isAvailabilityVerified: provider.isAvailabilityVerified,
        isProofsVerified: provider.isProofsVerified,
        isServiceDetailsVerified: provider.isServiceDetailsVerified,
      };
    } catch (error) {
      log.error("ProviderFetchProfileDetailsUseCase failed", error as Error);
      throw error;
    };
  };
};

export class ProviderUpdateProviderInfoUseCase {
  constructor(
    private providerRepository: IProviderRepository
  ) { };

  async execute(payload: ProviderUpdateProviderInfoRequest): Promise<ProviderUpdateProviderInfoResponse> {
    try {
      const { providerId, username, phone } = payload;

      if (!phone && !username) throw new Error("Invalid request");

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) throw new Error("No user found");

      provider.updateProfileInfo({
        phone: phone ?? undefined,
        username: username ?? undefined
      });

      const updatedProvider = await this.providerRepository.update(provider);
      if (!updatedProvider) throw new Error("Failed to update info, please try again");

      return { username: updatedProvider.username, phone: updatedProvider.phone };
    } catch (error) {
      log.error("ProviderUpdateProviderInfoUseCase failed", error as Error);
      throw error;
    };
  };
};


export class ProviderUpdateIdentityProofUseCase {

  constructor(
    private providerRepository: IProviderRepository,
    private signedUrlService: ISignedUrlService
  ) { };

  async exeute(payload: ProviderUpdateIdentityProofRequest): Promise<ProviderUpdateIdentityProofResponse> {
    try {

      const { providerId, identityProof } = payload;
      if (!providerId || !identityProof) throw new Error("Invalid request");

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) throw new Error("User not found");

      provider.submitIdentityProof({ identityProof });
      const updatedProvider = await this.providerRepository.update(provider);
      if (!updatedProvider) throw new Error("Failed to update proof");

      const signedUrl = await this.signedUrlService.save(identityProof);
      if (!signedUrl) throw new Error("Failed to generate signed url");

      return signedUrl;
    } catch (error) {
      log.error("ProviderUpdateIdentityProofUseCase failed", error as Error);
      throw error;
    };
  };
};

export class ProviderUpdateServiceProofUseCase {

  constructor(
    private providerRepository: IProviderRepository,
    private signedUrlService: ISignedUrlService
  ) { };

  async exeute(payload: ProviderUpdateServiceProofRequest): Promise<ProviderUpdateServiceProofResponse> {
    try {

      const { providerId, serviceProof } = payload;
      if (!providerId || !serviceProof) throw new Error("Invali drequest");

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) throw new Error("User not found");

      provider.submitServiceProof({ serviceProof });
      const updatedProvider = await this.providerRepository.update(provider);
      if (!updatedProvider) throw new Error("Failed to update proof");

      const signedUrl = await this.signedUrlService.save(serviceProof);
      if (!signedUrl) throw new Error("Failed to generate signed url");

      return signedUrl;
    } catch (error) {
      log.error("ProviderUpdateServiceProofUseCase failed", error as Error);
      throw error;
    };
  };
};


export class ProviderUpdateProfileImageUseCase {

  constructor(
    private providerRepository: IProviderRepository,
    private signedUrlService: ISignedUrlService
  ) { };

  async execute(payload: ProviderUpdateprofileImageRequestPayload): Promise<ProviderUpdateprofileImageResponse> {
    try {

      const { providerId, profileImage } = payload;
      if (!providerId || !profileImage) throw new Error("Invalid request");

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) throw new Error("User not found");

      provider.updateProfileImage({ profileImage });
      const updatedProvider = await this.providerRepository.update(provider);
      if (!updatedProvider) throw new Error("Failed to update profile image");

      const signedUrl = await this.signedUrlService.save(profileImage);
      if (!signedUrl) throw new Error("Failed to generate signed url");

      return signedUrl;
    } catch (error) {
      log.error("ProviderUpdateProfileImageUseCase failed", error as Error);
      throw error;
    };
  };
};


export class ProviderRequestForApprovalUseCase {
  constructor(
    private providerRepository: IProviderRepository
  ) { };

  async execute(payload: ProviderAdminApprovalRequest): Promise<ProviderAdminApprovalResponse> {
    try {

      const { providerId } = payload;

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) throw new Error("Invalid request");
      if (provider?.isAdminVerified) throw new Error("You are already verified");

      if (provider?.adminVerificationStatus === AdminVerificationStatus.REQUESTED ||
        provider?.adminVerificationStatus === AdminVerificationStatus.UNDER_REVIEW ||
        provider?.adminVerificationStatus === AdminVerificationStatus.APPROVED ||
        provider?.adminVerificationStatus === AdminVerificationStatus.RESUBMITTED
      ) {
        throw new Error("Invalid request");
      };

      if (provider?.adminVerificationStatus === AdminVerificationStatus.NOT_REQUESTED) {
        provider.submitForAdminVerification();
      };

      if (provider?.adminVerificationStatus === AdminVerificationStatus.REJECTED) {
        provider.resubmitForAdminVerification();
      };

      const updatedProvider = await this.providerRepository.update(provider);
      if (!updatedProvider) throw new Error("Failed to update approval request status");

      return { adminVerificationStatus: updatedProvider?.adminVerificationStatus };

    } catch (error) {
      log.error("ProviderRequestForApprovalUseCase failed", error as Error);
      throw error;
    };
  };
};


export class ProvideDeleteIdentityProofUseCase {
  constructor(
    private s3Client: S3Client,
    private providerRepository: IProviderRepository,
    private signedUrlService: ISignedUrlService
  ) { };

  async execute(payload: ProviderDeleteProofRequest): Promise<void> {
    try {
      const { providerId } = payload;

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) throw new Error("User not found");

      if (!provider.identityProof) throw new Error("No file found");

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: awsConfig.awsS3BucketName,
          Key: provider.identityProof,
        })
      );

      provider.submitIdentityProof({ identityProof: null });
      await this.providerRepository.update(provider);

      await this.signedUrlService.delete(provider.identityProof);

    } catch (error) {
      log.error("ProvideDeleteIdentityProofUseCase failed", error as Error);
      throw error;
    };
  };
};


export class ProvideDeleteServiceProofUseCase {
  constructor(
    private s3Client: S3Client,
    private providerRepository: IProviderRepository,
    private signedUrlService: ISignedUrlService
  ) { };

  async execute(payload: ProviderDeleteProofRequest): Promise<void> {
    try {
      const { providerId } = payload;

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) throw new Error("User not found");

      if (!provider.serviceProof) throw new Error("No file found");

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: awsConfig.awsS3BucketName,
          Key: provider.serviceProof,
        })
      );

      provider.submitServiceProof({ serviceProof: null });
      await this.providerRepository.update(provider);

      await this.signedUrlService.delete(provider.serviceProof);

    } catch (error) {
      log.error("ProvideDeleteServiceProofUseCase failed", error as Error);
      throw error;
    };
  };
};

export class ProviderUpdatePushNotificationUseCase {
    constructor(
        private providerRepository: IProviderRepository
    ) { };

    async execute(payload: ProviderUpdatePushNotificationRequest): Promise<void> {
        try {
            const { allowPushNotification, providerId } = payload;
            
            const provider = await this.providerRepository.findById(providerId);
            if (!provider) throw new Error("No provider found");
            
            provider.updatePushNotification({allowPushNotification});
            
            const updatedProvider = await this.providerRepository.update(provider);
            if (!updatedProvider) throw new Error("Info adding failed, please try again");
        } catch (error) {
            log.error("ProviderUpdatePushNotificationUseCase failed", error as Error);
            throw error;
        };
    };
};
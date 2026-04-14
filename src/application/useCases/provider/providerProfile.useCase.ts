import {
  ProviderDeleteProofRequest,
  ProviderAdminApprovalRequest,
  ProviderAdminApprovalResponse,
  ProviderUpdateServiceProofRequest,
  ProviderUpdateServiceProofResponse,
  ProviderUpdateIdentityProofRequest,
  ProviderUpdateIdentityProofResponse,
} from "../../dtos/providerProfile.dto";
import { awsConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { IUserQueries } from "../../queries/IUser.queries";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { AdminVerificationStatus } from "../../../domain/enums/adminVerificationStatus.enum";
import { ProviderGetOwnProfileDetailsInput, ProviderGetOwnProfileDetailsOutput } from "../../dtos/user.dto";
import { IProviderProfileRepository } from "../../../domain/interfaces/repositories/IProviderProfile.repository";

export class ProviderGetProfileDetailsUseCase {
  constructor(
    private readonly userQueries: IUserQueries
  ) { };

  async execute(input: ProviderGetOwnProfileDetailsInput): Promise<ProviderGetOwnProfileDetailsOutput> {
    try {
      const result = await this.userQueries.findProviderById(input);
      if (!result) throw new Error("Provider not found");
      
      return {
        username: result.username,
        email: result.email,
        isBlocked: result.isBlocked,
        phone: result.phone,
        createdAt: result.createdAt,
        isAdminVerified: result.isAdminVerified,
        trustedBySlotflow: result.trustedBySlotflow,
        adminVerificationStatus: result.adminVerificationStatus,
        isAddressVerified: result.isAddressVerified,
        isAvailabilityVerified: result.isAvailabilityVerified,
        isProofsVerified: result.isProofsVerified,
        isServiceDetailsVerified: result.isServiceDetailsVerified
      }
    } catch (error) {
      log.error("ProviderGetProfileDetailsUseCase failed", error as Error);
      throw error;
    };
  };
};

export class ProviderUpdateIdentityProofUseCase {
  constructor(
    private readonly providerProfileRepository: IProviderProfileRepository,
    private readonly signedUrlService: ISignedUrlService
  ) { };

  async exeute(input: ProviderUpdateIdentityProofRequest): Promise<ProviderUpdateIdentityProofResponse> {
    try {

      const { providerId, identityProof } = input;
      if (!providerId || !identityProof) throw new Error("Invalid request");

      const providerProfile = await this.providerProfileRepository.findById(providerId);
      if (!providerProfile) throw new Error("Profile not found");

      providerProfile.submitIdentityProof({ identityProof });
      const updatedProvider = await this.providerProfileRepository.update(providerProfile);
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
    private readonly providerProfileRepository: IProviderProfileRepository,
    private readonly signedUrlService: ISignedUrlService
  ) { };

  async exeute(input: ProviderUpdateServiceProofRequest): Promise<ProviderUpdateServiceProofResponse> {
    try {

      const { providerId, serviceProof } = input;
      if (!providerId || !serviceProof) throw new Error("Invalid request");

      const providerProfile = await this.providerProfileRepository.findById(providerId);
      if (!providerProfile) throw new Error("Profile not found");

      providerProfile.submitServiceProof({ serviceProof });
      const updatedProviderProfile = await this.providerProfileRepository.update(providerProfile);
      if (!updatedProviderProfile) throw new Error("Failed to update proof");

      const signedUrl = await this.signedUrlService.save(serviceProof);
      if (!signedUrl) throw new Error("Failed to generate signed url");

      return signedUrl;
    } catch (error) {
      log.error("ProviderUpdateServiceProofUseCase failed", error as Error);
      throw error;
    };
  };
};


export class ProviderRequestForApprovalUseCase {
  constructor(
    private readonly providerProfileRepository: IProviderProfileRepository
  ) { };

  async execute(input: ProviderAdminApprovalRequest): Promise<ProviderAdminApprovalResponse> {
    try {

      const { providerId } = input;

      const providerProfile = await this.providerProfileRepository.findById(providerId);
      if (!providerProfile) throw new Error("Profile not found");
      if (providerProfile?.isAdminVerified) throw new Error("You are already verified");

      if (providerProfile?.adminVerificationStatus === AdminVerificationStatus.REQUESTED ||
        providerProfile?.adminVerificationStatus === AdminVerificationStatus.UNDER_REVIEW ||
        providerProfile?.adminVerificationStatus === AdminVerificationStatus.APPROVED ||
        providerProfile?.adminVerificationStatus === AdminVerificationStatus.RESUBMITTED
      ) {
        throw new Error("Invalid request");
      };

      if (providerProfile?.adminVerificationStatus === AdminVerificationStatus.NOT_REQUESTED) {
        providerProfile.submitForAdminVerification();
      };

      if (providerProfile?.adminVerificationStatus === AdminVerificationStatus.REJECTED) {
        providerProfile.resubmitForAdminVerification();
      };

      const updatedProvider = await this.providerProfileRepository.update(providerProfile);
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
    private readonly s3Client: S3Client,
    private readonly providerProfileRepository: IProviderProfileRepository,
    private readonly signedUrlService: ISignedUrlService
  ) { };

  async execute(input: ProviderDeleteProofRequest): Promise<void> {
    try {
      const { providerId } = input;

      const providerProfile = await this.providerProfileRepository.findById(providerId);
      if (!providerProfile) throw new Error("Profile not found");

      if (!providerProfile.identityProof) throw new Error("No file found");

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: awsConfig.awsS3BucketName,
          Key: providerProfile.identityProof,
        })
      );

      providerProfile.submitIdentityProof({ identityProof: null });
      await this.providerProfileRepository.update(providerProfile);

      await this.signedUrlService.delete(providerProfile.identityProof);

    } catch (error) {
      log.error("ProvideDeleteIdentityProofUseCase failed", error as Error);
      throw error;
    };
  };
};


export class ProvideDeleteServiceProofUseCase {
  constructor(
    private readonly s3Client: S3Client,
    private readonly providerProfileRepository: IProviderProfileRepository,
    private readonly signedUrlService: ISignedUrlService
  ) { };

  async execute(input: ProviderDeleteProofRequest): Promise<void> {
    try {
      const { providerId } = input;

      const providerProfile = await this.providerProfileRepository.findById(providerId);
      if (!providerProfile) throw new Error("Profile not found");

      if (!providerProfile.serviceProof) throw new Error("No file found");

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: awsConfig.awsS3BucketName,
          Key: providerProfile.serviceProof,
        })
      );

      providerProfile.submitServiceProof({ serviceProof: null });
      await this.providerProfileRepository.update(providerProfile);

      await this.signedUrlService.delete(providerProfile.serviceProof);

    } catch (error) {
      log.error("ProvideDeleteServiceProofUseCase failed", error as Error);
      throw error;
    };
  };
};
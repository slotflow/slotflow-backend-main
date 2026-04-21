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
import { ERROR_CODES } from "../../../shared/utils/types";
import { IUserQueries } from "../../queries/IUser.queries";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { AppError, BadRequestError, NotFoundError } from "../../../shared/error/appError";
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
      const { providerId } = input;
      if (!providerId) {
        throw new BadRequestError();
      }

      const provider = await this.userQueries.findProviderById({ providerId });
      if (!provider) {
        throw new NotFoundError(
          "Provider not found",
          ERROR_CODES.USER_NOT_FOUND
        );
      }

      return {
        username: provider.username,
        email: provider.email,
        isBlocked: provider.isBlocked,
        phone: provider.phone,
        createdAt: provider.createdAt,
        isAdminVerified: provider.isAdminVerified,
        trustedBySlotflow: provider.trustedBySlotflow,
        adminVerificationStatus: provider.adminVerificationStatus,
        isAddressVerified: provider.isAddressVerified,
        isAvailabilityVerified: provider.isAvailabilityVerified,
        isProofsVerified: provider.isProofsVerified,
        isServiceDetailsVerified: provider.isServiceDetailsVerified
      }
    } catch (error: unknown) {
      throw toAppError(error, "Failed to profile details")
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
      if (!providerId || !identityProof) {
        throw new BadRequestError();
      }

      const providerProfile = await this.providerProfileRepository.findById(providerId);
      if (!providerProfile) {
        throw new NotFoundError(
          "Profile not found",
          ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
        );
      }

      providerProfile.submitIdentityProof({ identityProof });
      const updatedProvider = await this.providerProfileRepository.update(providerProfile);
      if (!updatedProvider) {
        throw new AppError(
          "Failed to update identity proof in profile.",
          500,
          true,
          ERROR_CODES.INTERNAL_ERROR
        );
      }

      const signedUrl = await this.signedUrlService.save(identityProof);

      return signedUrl;
    } catch (error: unknown) {
      throw toAppError(error, "Failed to update identity proof")
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
      if (!providerId || !serviceProof) {
        throw new BadRequestError();
      }

      const providerProfile = await this.providerProfileRepository.findById(providerId);
      if (!providerProfile) {
        throw new NotFoundError(
          "Profile not found",
          ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
        );
      }

      providerProfile.submitServiceProof({ serviceProof });
      const updatedProviderProfile = await this.providerProfileRepository.update(providerProfile);
      if (!updatedProviderProfile) {
        throw new AppError(
          "Failed to update identity proof in profile.",
          500,
          true,
          ERROR_CODES.INTERNAL_ERROR
        );
      }

      const signedUrl = await this.signedUrlService.save(serviceProof);
      return signedUrl;
    } catch (error: unknown) {
      throw toAppError(error, "Failed to update service proof");
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
      if (providerId) {
        throw new BadRequestError();
      }

      const providerProfile = await this.providerProfileRepository.findById(providerId);
      if (!providerProfile) {
        throw new NotFoundError(
          "Profile not found",
          ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
        );
      }

      if (providerProfile?.isAdminVerified) {
        throw new BadRequestError();
      }

      if (providerProfile?.adminVerificationStatus === AdminVerificationStatus.REQUESTED ||
        providerProfile?.adminVerificationStatus === AdminVerificationStatus.UNDER_REVIEW ||
        providerProfile?.adminVerificationStatus === AdminVerificationStatus.APPROVED ||
        providerProfile?.adminVerificationStatus === AdminVerificationStatus.RESUBMITTED
      ) {
        throw new BadRequestError();
      };

      if (providerProfile?.adminVerificationStatus === AdminVerificationStatus.NOT_REQUESTED) {
        providerProfile.submitForAdminVerification();
      };

      if (providerProfile?.adminVerificationStatus === AdminVerificationStatus.REJECTED) {
        providerProfile.resubmitForAdminVerification();
      };

      const updatedProvider = await this.providerProfileRepository.update(providerProfile);
      if (!updatedProvider) {
        throw new AppError(
          "Failed to update approval request status",
          500,
          true,
          ERROR_CODES.INTERNAL_ERROR
        );
      }

      return { adminVerificationStatus: updatedProvider?.adminVerificationStatus };

    } catch (error: unknown) {
      throw toAppError(error, "Failed to update provider approval request");
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
      if (!providerId) {
        throw new BadRequestError();
      }

      const providerProfile = await this.providerProfileRepository.findById(providerId);
      if (!providerProfile) {
        throw new NotFoundError(
          "Profile not found",
          ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
        );
      }

      if (!providerProfile.identityProof) throw new Error("No file found");

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: awsConfig.awsS3BucketName,
          Key: providerProfile.identityProof,
        })
      );

      providerProfile.submitIdentityProof({ identityProof: null });
      const updatedProfile = await this.providerProfileRepository.update(providerProfile);
      if (!updatedProfile) {
        throw new AppError(
          "Failed to delete identity proof",
          500,
          true,
          ERROR_CODES.INTERNAL_ERROR
        );
      }

      await this.signedUrlService.delete(providerProfile.identityProof);

    } catch (error: unknown) {
      throw toAppError(error, "Failed to delete identity proof");
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
      if (!providerId) {
        throw new BadRequestError();
      }

      const providerProfile = await this.providerProfileRepository.findById(providerId);
      if (!providerProfile) {
        throw new NotFoundError(
          "Profile not found",
          ERROR_CODES.PROVIDER_PROFILE_NOT_FOUND
        );
      }

      if (!providerProfile.serviceProof) {
        throw new BadRequestError();
      }

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: awsConfig.awsS3BucketName,
          Key: providerProfile.serviceProof,
        })
      );

      providerProfile.submitServiceProof({ serviceProof: null });
      const updatedProfile = await this.providerProfileRepository.update(providerProfile);
      if (!updatedProfile) {
        throw new AppError(
          "Failed to delete service proof",
          500,
          true,
          ERROR_CODES.INTERNAL_ERROR
        )
      }

      await this.signedUrlService.delete(providerProfile.serviceProof);

    } catch (error: unknown) {
      throw toAppError(error, "Failed to get ptovider profile");
    };
  };
};
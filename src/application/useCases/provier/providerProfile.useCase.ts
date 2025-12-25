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
} from "../../dtos/provider.dto";
import { log } from "../../../shared/logger/logger";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AdminVerificationStatus } from "../../../domain/enums/adminVerificationStatus.enum";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISignedUrlCacheRepository } from "../../../domain/interfaces/repositories/ISignedUrlCache.repository";

export class ProviderFetchProfileDetailsUseCase {
  constructor(
    private providerRepository: IProviderRepository
  ) { };

  async execute(payload: ProviderFetchProfileDetailsRequest): Promise<ProviderFetchProfileDetailsResponse> {
    try {
      const { providerId } = payload;

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) return null;

      const { _id, password, addressId, serviceId, subscription, updatedAt, profileImage, ...rest } = provider.getProps();
      return rest;
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

      if(!phone && !username) throw new Error("Invalid request");

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) throw new Error("No user found");

      provider.updateProfileInfo({ 
        phone: phone ?? undefined, 
        username: username ?? undefined
      });

      const updatedProvider = await this.providerRepository.update(provider);
      if (!updatedProvider) throw new Error("Failed to update info, please try again");

      const updatedData = { username: updatedProvider.username, phone: updatedProvider.phone };

      return updatedData;
    } catch (error) {
      log.error("ProviderUpdateProviderInfoUseCase failed", error as Error);
      throw error;
    };
  };
};


export class ProviderUpdateIdentityProofUseCase {

  constructor(
    protected s3Client: S3Client,
    protected providerRepository: IProviderRepository,
    protected signedUrlCacheRepository: ISignedUrlCacheRepository
  ) { }

  async exeute(payload: ProviderUpdateIdentityProofRequest): Promise<ProviderUpdateIdentityProofResponse> {
    try {

      const { providerId, identityProof } = payload;
      if(!providerId || !identityProof) throw new Error("Invalid request");
      
      const provider = await this.providerRepository.findById(providerId);
      if(!provider) throw new Error("User not found");
      
      provider.submitIdentityProof({identityProof});
      const updatedProvider = await this.providerRepository.update(provider);
      if(!updatedProvider) throw new Error("Failed to update proof");
      
      const command = new GetObjectCommand({
        Bucket: awsConfig.aws_s3Bucket_name,
        Key: identityProof,
      });
      
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 172800,
      });
      
      await this.signedUrlCacheRepository.updateSignedUrl({
        key: identityProof,
        url: signedUrl,
        expiresAt: new Date(Date.now() + 172800 * 1000),
      });
      
      return signedUrl;
    } catch(error) {
      log.error("ProviderUpdateIdentityProofUseCase failed",error as Error);
      throw error;
    };
  };
};

export class ProviderUpdateServiceProofUseCase {

  constructor(
    protected s3Client: S3Client,
    protected providerRepository: IProviderRepository,
    protected signedUrlCacheRepository: ISignedUrlCacheRepository
  ) { }

  async exeute(payload: ProviderUpdateServiceProofRequest): Promise<ProviderUpdateServiceProofResponse> {
    try {

      const { providerId, serviceProof} = payload;
      if(!providerId || !serviceProof) throw new Error("Invali drequest");
      
      const provider = await this.providerRepository.findById(providerId);
      if(!provider) throw new Error("User not found");
      
      provider.submitServiceProof({serviceProof});
      const updatedProvider = await this.providerRepository.update(provider);
      if(!updatedProvider) throw new Error("Failed to update proof");
      
      const command = new GetObjectCommand({
        Bucket: awsConfig.aws_s3Bucket_name,
        Key: serviceProof,
      });
      
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 172800,
      });
      
      await this.signedUrlCacheRepository.updateSignedUrl({
        key: serviceProof,
        url: signedUrl,
        expiresAt: new Date(Date.now() + 172800 * 1000),
      });
      
      return signedUrl;
    } catch(error) {
      log.error("ProviderUpdateServiceProofUseCase failed", error as Error);
      throw error;
    };
  };
};


export class ProviderUpdateProfileImageUseCase {

  constructor(
    protected s3Client: S3Client,
    protected providerRepository: IProviderRepository,
    protected signedUrlCacheRepository: ISignedUrlCacheRepository
  ) { };

  async execute(payload: ProviderUpdateprofileImageRequestPayload): Promise<ProviderUpdateprofileImageResponse> {
    try {

      const { providerId, profileImage } = payload;
      if(!providerId || !profileImage) throw new Error("Invalid request");
      
      const provider = await this.providerRepository.findById(providerId);
      if(!provider) throw new Error("User not found");
      
      provider.updateProfileImage({ profileImage });
      const updatedProvider = await this.providerRepository.update(provider);
      if(!updatedProvider) throw new Error("Failed to update profile image");
      
      const command = new GetObjectCommand({
        Bucket: awsConfig.aws_s3Bucket_name,
        Key: profileImage,
      });
      
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 172800,
      });
      
      await this.signedUrlCacheRepository.updateSignedUrl({
        key: profileImage,
        url: signedUrl,
        expiresAt: new Date(Date.now() + 172800 * 1000),
      });
      
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
      if(!provider) throw new Error("Invalid request");
      if (provider?.isAdminVerified) throw new Error("You are already verified");

      if (provider?.adminVerificationStatus === AdminVerificationStatus.REQUESTED ||
        provider?.adminVerificationStatus === AdminVerificationStatus.UNDER_REVIEW ||
        provider?.adminVerificationStatus === AdminVerificationStatus.APPROVED ||
        provider?.adminVerificationStatus === AdminVerificationStatus.RESUBMITTED
      ) {
        throw new Error("Invalid request");
      }

      if (provider?.adminVerificationStatus === AdminVerificationStatus.NOT_REQUESTED) {
        provider.submitForAdminVerification();
      } else if (provider?.adminVerificationStatus === AdminVerificationStatus.REJECTED) {
        provider.resubmitForAdminVerification();
      }

      const updatedProvider = await this.providerRepository.update(provider);
      if(!updatedProvider) throw new Error("Failed to update approval request status");

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
    private signedUrlCacheRepository: ISignedUrlCacheRepository
  ) { };

  async execute(payload: ProviderDeleteProofRequest): Promise<void> {
    try {
      const { providerId } = payload;

      const provider = await this.providerRepository.findById(providerId);
      if(!provider) throw new Error("User not found");
      
      if(!provider.identityProof) throw new Error("No file found");

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: awsConfig.aws_s3Bucket_name,
          Key: provider.identityProof,
        })
      );

      const signedUrl = await this.signedUrlCacheRepository.findSignedUrl({ key: provider.identityProof});
      if(signedUrl) {
        const result = await this.signedUrlCacheRepository.deleteSignedUrl(signedUrl._id);
        if(!result) throw new Error("Faile to remove existing file");
      }

      provider.submitIdentityProof({ identityProof: null });
      await this.providerRepository.update(provider);
      
    } catch(error) {
      log.error("ProvideDeleteIdentityProofUseCase failed",error as Error);
      throw error;
    };
  };
};


export class ProvideDeleteServiceProofUseCase {
  constructor(
    private s3Client: S3Client,
    private providerRepository: IProviderRepository,
    private signedUrlCacheRepository: ISignedUrlCacheRepository
  ) { };

  async execute(payload: ProviderDeleteProofRequest): Promise<void> {
    try {
      const { providerId } = payload;

      const provider = await this.providerRepository.findById(providerId);
      if(!provider) throw new Error("User not found");
      
      if(!provider.serviceProof) throw new Error("No file found");

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: awsConfig.aws_s3Bucket_name,
          Key: provider.serviceProof,
        })
      );

      const signedUrl = await this.signedUrlCacheRepository.findSignedUrl({ key: provider.serviceProof});
      if(signedUrl) {
        const result = await this.signedUrlCacheRepository.deleteSignedUrl(signedUrl._id);
        if(!result) throw new Error("Faile to remove existing file");
      }

      provider.submitServiceProof({ serviceProof: null });
      await this.providerRepository.update(provider);
      
    } catch(error) {
      log.error("ProvideDeleteServiceProofUseCase failed",error as Error);
      throw error;
    };
  };
};
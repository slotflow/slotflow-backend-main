import { awsConfig } from "../../../config/env";
import {
  ProviderUpdateProviderInfoRequest,
  ProviderUpdateServiceProofRequest,
  ProviderFetchProfileDetailsRequest,
  ProviderUpdateServiceProofResponse,
  ProviderUpdateprofileImageResponse,
  ProviderUpdateProviderInfoResponse,
  ProviderFetchProfileDetailsResponse,
  ProviderUpdateIdentityProofRequest,
  ProviderUpdateIdentityProofResponse,
  ProviderUpdateprofileImageRequestPayload,
  ProviderAdminApprovalResponse,
  ProviderAdminApprovalRequest,
  ProviderDeleteProofRequest,
} from "../../dtos/provider.dto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ApiResponse } from "../../dtos/common.dto";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISignedUrlCacheRepository } from "../../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { AdminVerificationStatus } from "../../../domain/entities/provider.entity";

export class ProviderFetchProfileDetailsUseCase {
  constructor(
    private providerRepository: IProviderRepository
  ) { }

  async execute(payload: ProviderFetchProfileDetailsRequest): Promise<ApiResponse<ProviderFetchProfileDetailsResponse>> {
    try {
      const { providerId } = payload;

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) throw new Error("Provider profile fetching error.");

      const { _id, password, addressId, serviceId, subscription, updatedAt, profileImage, ...rest } = provider;
      return { success: true, message: "Provider prfile detailed fetched.", data: rest };
    } catch (error) {
      console.log("ProviderFetchProfileDetailsUseCase error : ", error);
      throw new Error("Failed to fetch profile details");
    }
  }
}

export class ProviderUpdateProviderInfoUseCase {
  constructor(
    private providerRepository: IProviderRepository
  ) { }

  async execute(payload: ProviderUpdateProviderInfoRequest): Promise<ApiResponse<ProviderUpdateProviderInfoResponse>> {
    try {
      const { providerId, username, phone } = payload;

      if(!phone && !username) throw new Error("Invalid request");

      const provider = await this.providerRepository.findById(providerId);
      if (!provider) throw new Error("No user found");

      provider.updateInfo({ 
        phone: phone ?? undefined, 
        username: username ?? undefined
      });

      const updatedProvider = await this.providerRepository.update(provider);
      if (!updatedProvider) throw new Error("Failed to update info, please try again");

      const updatedData = { username: updatedProvider.username, phone: updatedProvider.phone };

      return { success: true, message: "Info updated successfully", data: updatedData }
    } catch (error) {
      console.log("ProviderUpdateProviderInfoUseCase error : ", error);
      throw new Error("Failed to update provider info");
    }
  }
}


export class ProviderUpdateIdentityProofUseCase {

  constructor(
    protected s3Client: S3Client,
    protected providerRepository: IProviderRepository,
    protected signedUrlCacheRepository: ISignedUrlCacheRepository
  ) { }

  async exeute(payload: ProviderUpdateIdentityProofRequest): Promise<ApiResponse<ProviderUpdateIdentityProofResponse>> {

    const { providerId, identityProof } = payload;
    if(!providerId || !identityProof) throw new Error("Invalid request");

    const provider = await this.providerRepository.findById(providerId);
    if(!provider) throw new Error("User not found");

    provider.updateIdentityProof({identityProof});
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

    return {
      success: true,
      message: "Identity proof updated successfully.",
      data: signedUrl
    };
  }
}

export class ProviderUpdateServiceProofUseCase {

  constructor(
    protected s3Client: S3Client,
    protected providerRepository: IProviderRepository,
    protected signedUrlCacheRepository: ISignedUrlCacheRepository
  ) { }

  async exeute(payload: ProviderUpdateServiceProofRequest): Promise<ApiResponse<ProviderUpdateServiceProofResponse>> {

    const { providerId, serviceProof} = payload;
    if(!providerId || !serviceProof) throw new Error("Invali drequest");

    const provider = await this.providerRepository.findById(providerId);
    if(!provider) throw new Error("User not found");

    provider.updateServiceProof({serviceProof});
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

    return {
      success: true,
      message: "Service proof updated successfully.",
      data: signedUrl
    };
  }
}


export class ProviderUpdateProfileImageUseCase {

  constructor(
    protected s3Client: S3Client,
    protected providerRepository: IProviderRepository,
    protected signedUrlCacheRepository: ISignedUrlCacheRepository
  ) { }

  async execute(payload: ProviderUpdateprofileImageRequestPayload): Promise<ApiResponse<ProviderUpdateprofileImageResponse>> {

    const { providerId, profileImage } = payload;
    if(!providerId || !profileImage) throw new Error("Invalid request");
    
    const provider = await this.providerRepository.findById(providerId);
    if(!provider) throw new Error("User not found");

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

    return {
      success: true,
      message: "Profile image updated successfully.",
      data: signedUrl
    };
  }
}


export class ProviderRequestForApprovalUseCase {
  constructor(
    private providerRepository: IProviderRepository
  ) { }

  async execute(payload: ProviderAdminApprovalRequest): Promise<ApiResponse<ProviderAdminApprovalResponse>> {
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
        provider.requestAdminVerification();
      } else if (provider?.adminVerificationStatus === AdminVerificationStatus.REJECTED) {
        provider.rerequestAdminVerification();
      }

      const updatedProvider = await this.providerRepository.update(provider);
      if(!updatedProvider) throw new Error("Failed to update approval request status");

      return { 
        success: true, 
        message: `${updatedProvider.adminVerificationStatus === AdminVerificationStatus.REQUESTED ? "Submitted" : "Resubmitted"} successfully`, 
        data: { adminVerificationStatus: updatedProvider?.adminVerificationStatus } }

    } catch (error) {
      console.log("ProviderRequestForApprovalUseCase error : ", error);
      throw new Error("Failed to update approval request status");
    }
  }
}


export class ProvideDeleteIdentityProofUseCase {
  constructor(
    private s3Client: S3Client,
    private providerRepository: IProviderRepository,
    private signedUrlCacheRepository: ISignedUrlCacheRepository
  ) { }

  async execute(payload: ProviderDeleteProofRequest): Promise<ApiResponse> {
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

      provider.updateIdentityProof({ identityProof: null });
      await this.providerRepository.update(provider);

      return {
        success: true,
        message: "File deleted successfully",
      };
      
    } catch(error) {
      console.log("ProvideDeleteIdentityProofUseCase error : ",error);
      throw new Error("Failed to delete identity proof");
    }
  }
}


export class ProvideDeleteServiceProofUseCase {
  constructor(
    private s3Client: S3Client,
    private providerRepository: IProviderRepository,
    private signedUrlCacheRepository: ISignedUrlCacheRepository
  ) { }

  async execute(payload: ProviderDeleteProofRequest): Promise<ApiResponse> {
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

      provider.updateServiceProof({ serviceProof: null });
      await this.providerRepository.update(provider);

      return {
        success: true,
        message: "File deleted successfully",
      };
      
    } catch(error) {
      console.log("ProvideDeleteServiceProofUseCase error : ",error);
      throw new Error("Failed to delete identity proof");
    }
  }
}
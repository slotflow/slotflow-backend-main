import { Types } from "mongoose";
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
} from "../../../infrastructure/dtos/provider.dto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ApiResponse } from "../../../infrastructure/dtos/common.dto";
import { IProviderRepository } from "../../../domain/interfaces/repositories/IProvider.repository";
import { ISignedUrlCacheRepository } from "../../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { adminVerificationStatsArray } from "../../../shared/utils/constants";

export class ProviderFetchProfileDetailsUseCase {
  constructor(
    private providerRepository: IProviderRepository
  ) { }

  async execute(payload: ProviderFetchProfileDetailsRequest): Promise<ApiResponse<ProviderFetchProfileDetailsResponse>> {
    try {
      const { providerId } = payload;

      const provider = await this.providerRepository.findProviderById(providerId);
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

      const provider = await this.providerRepository.findProviderById(providerId);
      if (!provider) throw new Error("No user found");

      const providerData = {
        ...provider,
        username: username,
        phone: phone
      }

      const updatedProvider = await this.providerRepository.updateProvider(providerData);
      if (!updatedProvider) throw new Error("Info adding failed, please try again");

      const updatedData = { username: updatedProvider.username, phone: updatedProvider.phone };

      return { success: true, message: "Info updated successfully", data: updatedData }
    } catch (error) {
      console.log("ProviderUpdateProviderInfoUseCase error : ", error);
      throw new Error("Failed to update provider info");
    }
  }
}


export abstract class ProviderFileUpdateBaseUseCase {
  constructor(
    protected s3Client: S3Client,
    protected providerRepository: IProviderRepository,
    protected signedUrlCacheRepository: ISignedUrlCacheRepository
  ) { }

  protected async updateFile(providerId: Types.ObjectId, field: string, key: string) {
    const updated = await this.providerRepository.updateProviderFields({
      _id: providerId,
      [field]: key
    });

    if (!updated) throw new Error(`Failed to update ${field}`);

    const command = new GetObjectCommand({
      Bucket: awsConfig.aws_s3Bucket_name,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 172800,
    });

    await this.signedUrlCacheRepository.updateSignedUrl({
      key,
      url: signedUrl,
      expiresAt: new Date(Date.now() + 172800 * 1000),
    });

    return signedUrl;
  }
}


export class ProviderIdentityProofUpdateUseCase extends ProviderFileUpdateBaseUseCase {

  async exeute(payload: ProviderUpdateIdentityProofRequest): Promise<ApiResponse<ProviderUpdateIdentityProofResponse>> {

    const url = await this.updateFile(payload.providerId, "identityProof", payload.identityProof);

    return {
      success: true,
      message: "Identity proof updated successfully.",
      data: url
    };
  }
}

export class ProviderServiceProofUpdateUseCase extends ProviderFileUpdateBaseUseCase {

  async exeute(payload: ProviderUpdateServiceProofRequest): Promise<ApiResponse<ProviderUpdateServiceProofResponse>> {

    const url = await this.updateFile(payload.providerId, "serviceProof", payload.serviceProof);

    return {
      success: true,
      message: "Service proof updated successfully.",
      data: url
    };
  }
}


export class ProviderUpdateProfileImageUseCase extends ProviderFileUpdateBaseUseCase {

  async execute(payload: ProviderUpdateprofileImageRequestPayload): Promise<ApiResponse<ProviderUpdateprofileImageResponse>> {

    const url = await this.updateFile(payload.providerId, "profileImage", payload.profileImage);

    return {
      success: true,
      message: "Profile image updated successfully.",
      data: url
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

      const provider = await this.providerRepository.findProviderById(providerId);
      if(!provider) throw new Error("Invalid request");
      if (provider?.isAdminVerified) throw new Error("You are already verified");

      if (provider?.adminVerificationStatus === adminVerificationStatsArray[0] ||
        provider?.adminVerificationStatus === adminVerificationStatsArray[1] ||
        provider?.adminVerificationStatus === adminVerificationStatsArray[2] ||
        provider?.adminVerificationStatus === adminVerificationStatsArray[4]
      ) {
        throw new Error("Invalid request");
      }

      if (provider?.adminVerificationStatus === adminVerificationStatsArray[5]) {
        provider.adminVerificationStatus = adminVerificationStatsArray[0]
      } else if (provider?.adminVerificationStatus === adminVerificationStatsArray[3]) {
        provider.adminVerificationStatus = adminVerificationStatsArray[4]
      }

      const updatedProvider = await this.providerRepository.updateProvider(provider);
      if(!updatedProvider) throw new Error("Failed to update approval request status");

      return { 
        success: true, 
        message: `${updatedProvider.adminVerificationStatus === adminVerificationStatsArray[0] ? "Submitted" : "Resubmitted"} successfully`, 
        data: { adminVerificationStatus: updatedProvider?.adminVerificationStatus } }

    } catch (error) {
      console.log("ProviderRequestForApprovalUseCase error : ", error);
      throw new Error("Failed to update approval request status");
    }
  }
}
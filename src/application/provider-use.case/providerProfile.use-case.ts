import { awsConfig } from "../../config/env";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import {
    ProviderUpdateProviderInfoRequest,
    ProviderUpdateprofileImageResponse,
    ProviderFetchProfileDetailsRequest,
    ProviderUpdateProviderInfoResponse,
    ProviderFetchProfileDetailsResponse,
    ProviderUpdateprofileImageRequestPayload,
} from "../../infrastructure/dtos/provider.dto";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { generateS3Key } from "../../infrastructure/helpers/generateS3Key";
import { GenerateSignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";

export class ProviderFetchProfileDetailsUseCase {
    constructor(private providerRepositoryImpl: ProviderRepositoryImpl) { }

    async execute(payload: ProviderFetchProfileDetailsRequest): Promise<ApiResponse<ProviderFetchProfileDetailsResponse>> {
        try {
            const { providerId } = payload;

            const provider = await this.providerRepositoryImpl.findProviderById(providerId);
            if (provider === null) return { success: true, message: "Provider prfile not addedd.", data: {} };
            if (!provider) throw new Error("Provider profile fetching error.");
            const { _id, password, addressId, serviceId, subscription, updatedAt, profileImage, ...rest } = provider;
            return { success: true, message: "Provider prfile detailed fetched.", data: rest };
        } catch (error) {
            console.log("ProviderFetchProfileDetailsUseCase error : ", error);
            throw new Error("Failed to fetch profile details");
        }
    }
}


export class ProviderUpdateProfileImageUseCase {
    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl,
        private s3: S3Client,
        private generateSignedUrlService: GenerateSignedUrlService
    ) { }

    async execute(payload: ProviderUpdateprofileImageRequestPayload): Promise<ApiResponse<ProviderUpdateprofileImageResponse>> {
        try {
            const { providerId, file } = payload;

            const provider = await this.providerRepositoryImpl.findProviderById(providerId);
            if (!provider) throw new Error("No user found, please try again.");

            const params = {
                Bucket: awsConfig.aws_s3Bucket_name as string,
                Key: generateS3Key({
                    folder: "slotflow-provider-profileImage",
                    userId: providerId,
                    originalname: file.originalname,
                }),
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            const upload = new Upload({
                client: this.s3,
                params: params,
            });

            const s3UploadResponse = await upload.done();
            if (!s3UploadResponse) throw new Error("Image uploading error, please try again");

            provider.profileImage = s3UploadResponse.Location ?? "";
            const updatedProvider = await this.providerRepositoryImpl.updateProvider(provider);
            if (!updatedProvider) throw new Error("Profile image returning failed.");

            const signedUrl = await this.generateSignedUrlService.execute(updatedProvider.profileImage);
            return { success: true, message: "Profile Image updated successfully.", data: signedUrl };

        } catch (error) {
            console.log("ProviderUpdateProfileImageUseCase error : ", error);
            throw new Error("Failed to update profile image");
        }
    }
}

export class ProviderUpdateProviderInfoUseCase {
    constructor(
        private providerRepositoryImpl: ProviderRepositoryImpl
    ) { }

    async execute(payload: ProviderUpdateProviderInfoRequest): Promise<ApiResponse<ProviderUpdateProviderInfoResponse>> {
        try {
            const { providerId, username, phone } = payload;

            const provider = await this.providerRepositoryImpl.findProviderById(providerId);
            if (!provider) throw new Error("No user found");

            const providerData = {
                ...provider,
                username: username,
                phone: phone
            }

            const updatedProvider = await this.providerRepositoryImpl.updateProvider(providerData);
            if (!updatedProvider) throw new Error("Info adding failed, please try again");

            const updatedData = { username: updatedProvider.username, phone: updatedProvider.phone };

            return { success: true, message: "Info updated successfully", data: updatedData }
        } catch (error) {
            console.log("ProviderUpdateProviderInfoUseCase error : ", error);
            throw new Error("Failed to update provider info");
        }
    }
}
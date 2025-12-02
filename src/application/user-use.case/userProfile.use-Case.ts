import {
    UserFetchProfileRequest,
    UserUpdateUserInfoRequest,
    UserUpdateUserInfoResponse,
    UsrUpdateProfileImageRequest,
    UserUpdateProfileImageResponse,
    UserFetchProfileDetailsResponse,
} from "../../infrastructure/dtos/user.dto";
import { awsConfig } from "../../config/env";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";

export class UserFetchProfileDetailsUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
    ) { }

    async execute(payload: UserFetchProfileRequest): Promise<ApiResponse<UserFetchProfileDetailsResponse>> {
        try {
            const { userId } = payload;

            const user = await this.userRepositoryImpl.findUserById(userId);
            if (!user) throw new Error("User not found.");

            const { _id, password, profileImage, updatedAt, addressId, bookingsId, verificationToken, ...rest } = user;

            return { success: true, message: "User profile details fetched.", data: rest };
        } catch (error) {
            console.log("UserFetchProfileDetailsUseCase error : ", error);
            throw new Error("Failed to fetch profile");
        }
    }
}

export class UserUpdateProfileImageUseCase {
    constructor(
        private s3Client: S3Client,
        private userRepositoryImpl: UserRepositoryImpl,
        private signedUrlCacheRepositoryImpl: SignedUrlCacheRepositoryImpl
    ) { }

    async execute(payload: UsrUpdateProfileImageRequest): Promise<ApiResponse<UserUpdateProfileImageResponse>> {
        try {
            const { userId, key } = payload

            const updatedUser = await this.userRepositoryImpl.updateUserFields({
                _id: userId,
                profileImage: key
            });
            if (!updatedUser) throw new Error("Failed to save profile image.");

            const command = new GetObjectCommand({
                Bucket: awsConfig.aws_s3Bucket_name,
                Key: key,
            });

            const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 172800 });
            const expiresAt = new Date(Date.now() + 172800 * 1000);

            await this.signedUrlCacheRepositoryImpl.updateSignedUrl({
                expiresAt,
                key,
                url: signedUrl
            });

            return { success: true, message: "Profile Image updated successfully.", data: signedUrl };

        } catch (error) {
            console.log("UserUpdateProfileImageUseCase error : ", error);
            throw new Error("Failed to update profile image");
        }
    }
}


export class UserUpdateProviderInfoUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl
    ) { }

    async execute(payload: UserUpdateUserInfoRequest): Promise<ApiResponse<UserUpdateUserInfoResponse>> {
        try {
            const { userId, username, phone } = payload;

            const user = await this.userRepositoryImpl.findUserById(userId);
            if (!user) throw new Error("No user found");

            const userData = {
                ...user,
                username: username,
                phone: phone
            }

            const updatedUser = await this.userRepositoryImpl.updateUser(userData);
            if (!updatedUser) throw new Error("Info adding failed, please try again");

            const updatedData = { username: updatedUser.username, phone: updatedUser.phone };

            return { success: true, message: "Info updated successfully", data: updatedData }
        } catch (error) {
            console.log("UserUpdateProviderInfoUseCase error : ", error);
            throw new Error("Failed to update profile info");
        }
    }
}
import { awsConfig } from "../../../config/env";
import { ApiResponse } from "../../dtos/common.dto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { ISignedUrlCacheRepository } from "../../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { UserFetchProfileDetailsResponse, UserFetchProfileRequest, UserUpdateProfileImageResponse, UserUpdateUserInfoRequest, UserUpdateUserInfoResponse, UsrUpdateProfileImageRequest } from "../../dtos/user.dto";

export class UserFetchProfileDetailsUseCase {
    constructor(
        private userRepository: IUserRepository,
    ) { }

    async execute(payload: UserFetchProfileRequest): Promise<ApiResponse<UserFetchProfileDetailsResponse>> {
        try {
            const { userId } = payload;

            const user = await this.userRepository.findById(userId);
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
        private userRepository: IUserRepository,
        private signedUrlCacheRepository: ISignedUrlCacheRepository
    ) { }

    async execute(payload: UsrUpdateProfileImageRequest): Promise<ApiResponse<UserUpdateProfileImageResponse>> {
        try {
            const { userId, profileImage } = payload
            if(!userId || !profileImage) throw new Error("Invalid request");

            const user = await this.userRepository.findById(userId);
            if(!user) throw new Error("No user found");

            user.updateProfileImage({ profileImage });
            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) throw new Error("Failed to save profile image");

            const command = new GetObjectCommand({
                Bucket: awsConfig.aws_s3Bucket_name,
                Key: profileImage,
            });

            const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 172800 });

            await this.signedUrlCacheRepository.updateSignedUrl({
                key: profileImage,
                url: signedUrl,
                expiresAt: new Date(Date.now() + 172800 * 1000),
            });

            return { success: true, message: "Profile Image updated successfully", data: signedUrl };

        } catch (error) {
            console.log("UserUpdateProfileImageUseCase error : ", error);
            throw new Error("Failed to update profile image");
        }
    }
}


export class UserUpdateProviderInfoUseCase {
    constructor(
        private userRepository: IUserRepository
    ) { }

    async execute(payload: UserUpdateUserInfoRequest): Promise<ApiResponse<UserUpdateUserInfoResponse>> {
        try {
            const { userId, username, phone } = payload;

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found");

            user.updateProfileInfo({
                phone: phone ?? undefined,
                username: username ?? undefined
            })

            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) throw new Error("Info adding failed, please try again");

            const updatedData = { username: updatedUser.username, phone: updatedUser.phone };

            return { success: true, message: "Info updated successfully", data: updatedData }
        } catch (error) {
            console.log("UserUpdateProviderInfoUseCase error : ", error);
            throw new Error("Failed to update profile info");
        }
    }
}
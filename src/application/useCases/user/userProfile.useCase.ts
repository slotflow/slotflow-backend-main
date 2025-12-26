import { S3Client } from "@aws-sdk/client-s3";
import { log } from "../../../shared/logger/logger";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { UserFetchProfileDetailsResponse, UserFetchProfileRequest, UserUpdateProfileImageResponse, UserUpdateUserInfoRequest, UserUpdateUserInfoResponse, UsrUpdateProfileImageRequest } from "../../dtos/user.dto";

export class UserFetchProfileDetailsUseCase {
    constructor(
        private userRepository: IUserRepository,
    ) { };

    async execute(payload: UserFetchProfileRequest): Promise<UserFetchProfileDetailsResponse> {
        try {
            const { userId } = payload;

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("User not found.");

            const { _id, password, profileImage, updatedAt, addressId, bookingsId, verificationToken, ...rest } = user.getProps();

            return rest;
        } catch (error) {
            log.error("UserFetchProfileDetailsUseCase failed", error as Error);
            throw error;
        };
    };
};

export class UserUpdateProfileImageUseCase {
    constructor(
        private s3Client: S3Client,
        private userRepository: IUserRepository,
        private signedUrlService: ISignedUrlService
    ) { };

    async execute(payload: UsrUpdateProfileImageRequest): Promise<UserUpdateProfileImageResponse> {
        try {
            const { userId, profileImage } = payload
            if(!userId || !profileImage) throw new Error("Invalid request");

            const user = await this.userRepository.findById(userId);
            if(!user) throw new Error("No user found");

            user.updateProfileImage({ profileImage });
            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) throw new Error("Failed to save profile image");

            const signedUrl = await this.signedUrlService.save(profileImage);
            if(!signedUrl) throw new Error("Internal error");

            return signedUrl;
        } catch (error) {
            log.error("UserUpdateProfileImageUseCase failed", error as Error);
            throw error;
        };
    };
};


export class UserUpdateProviderInfoUseCase {
    constructor(
        private userRepository: IUserRepository
    ) { };

    async execute(payload: UserUpdateUserInfoRequest): Promise<UserUpdateUserInfoResponse> {
        try {
            const { userId, username, phone } = payload;

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found");

            user.updateProfileInfo({
                phone: phone ?? undefined,
                username: username ?? undefined
            });

            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) throw new Error("Info adding failed, please try again");

            const updatedData = { username: updatedUser.username, phone: updatedUser.phone };

            return updatedData;
        } catch (error) {
            log.error("UserUpdateProviderInfoUseCase failed", error as Error);
            throw error;
        };
    };
};
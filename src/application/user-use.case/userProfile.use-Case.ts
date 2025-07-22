import {
    UserFetchProfileDetailsResponse,
    UserUpdateProfileImageResponse,
    UserFetchProfileRequest,
    UsrUpdateProfileImageRequest,
    UserUpdateUserInfoRequest,
    UserUpdateUserInfoResponse,
} from "../../infrastructure/dtos/user.dto";
import { awsConfig } from "../../config/env";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { generateS3Key } from "../../infrastructure/helpers/generateS3Key";
import { generateSignedUrl } from "../../infrastructure/services/signedUrl.service";
import { validateOrThrow, Validator } from "../../infrastructure/validator/validator";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";


export class UserFetchProfileDetailsUseCase {
    constructor(private userRepositoryImpl: UserRepositoryImpl) { }

    async execute(data: UserFetchProfileRequest): Promise<ApiResponse<UserFetchProfileDetailsResponse>> {
        const { userId } = data;
        if (!userId) throw new Error("Invalid request.");

        Validator.validateObjectId(userId, "userId");

        const user = await this.userRepositoryImpl.findUserById(userId);
        if (!user) throw new Error("User not found.");
        const { _id, password, profileImage, updatedAt, addressId, bookingsId, verificationToken, ...rest } = user;
        return { success: true, message: "User profile details fetched.", data: rest };
    }
}

export class UserUpdateProfileImageUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
        private s3: S3Client,
    ) { }

    async execute(data: UsrUpdateProfileImageRequest): Promise<ApiResponse<UserUpdateProfileImageResponse>> {
        const { userId, file } = data;
        if (!userId || !file) throw new Error("Invalid request.");

        Validator.validateObjectId(userId, "userId");
        Validator.validateFile(file);

        const user = await this.userRepositoryImpl.findUserById(userId);
        if (!user) throw new Error("User not found.");
        try {
            const params = {
                Bucket: awsConfig.aws_s3Bucket_name as string,
                Key: generateS3Key({
                    folder: "slotflow-user-profileImage",
                    userId: userId,
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

            user.profileImage = s3UploadResponse.Location ?? "";
            const updatedUser = await this.userRepositoryImpl.updateUser(user);
            if (!updatedUser) throw new Error("Profile image returning failed.");

            const signedUrl = await generateSignedUrl(updatedUser.profileImage);
            return { success: true, message: "Profile Image updated successfully.", data: signedUrl };

        } catch (error){
            console.log("Error : ",error);
            throw new Error("Unexpected error occured while updating profile image.");
        }
    }
}


export class UserUpdateProviderInfoUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl
    ) { }

    async execute(data: UserUpdateUserInfoRequest): Promise<ApiResponse<UserUpdateUserInfoResponse>> {
        const { userId, username, phone } = data;
        if (!userId || !username || !phone) throw new Error("Invalid request");

        Validator.validateObjectId(userId, "userId");
        Validator.validatePhone(phone);
        validateOrThrow("username", username);

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
    }
}
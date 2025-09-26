import {
    AdminFetchAllUsers,
    AdminChangeUserIsBlockedStatusRequest,
    AdminFetchUserProfileDetailsResponse,
} from "../../infrastructure/dtos/admin.dto";
import { User } from "../../domain/entities/user.entity";
import { Validator } from "../../infrastructure/validator/validator";
import { ApiPaginationRequest, ApiResponse } from "../../infrastructure/dtos/common.dto";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { generateSignedUrl } from "../../infrastructure/services/signedUrl.service";


export class AdminUserListUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
    ) { }

    async execute({ page, limit }: ApiPaginationRequest): Promise<ApiResponse<AdminFetchAllUsers>> {

        const result = await this.userRepositoryImpl.findAllUsers({ page, limit });
        if (!result) throw new Error("Users fetching failed, ");
        return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
    }
}


export class AdminChangeUserBlockStatusUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
    ) { }

    async execute({ userId, isBlocked }: AdminChangeUserIsBlockedStatusRequest): Promise<ApiResponse> {

        if (!userId || isBlocked === null) throw new Error("Invalid request");

        Validator.validateObjectId(userId, "userId");
        Validator.validateBooleanValue(isBlocked, "isBlocked");

        const user = await this.userRepositoryImpl.findUserById(userId);
        if (!user) throw new Error("No user found.");
        user.isBlocked = !isBlocked;
        const updatedUser = await this.userRepositoryImpl.updateUser(user);
        if (!updatedUser) throw new Error("User not found");
        return { success: true, message: `User ${isBlocked ? "unblocked" : "blocked"} successfully.` };
    }
}


export class AdminFetchUserDetailsUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
    ) { }

    async execute(userId: User["_id"]): Promise<ApiResponse<AdminFetchUserProfileDetailsResponse>> {

        if (!userId) throw new Error("Invalid request.");

        Validator.validateObjectId(userId, "user Id");

        const userData = await this.userRepositoryImpl.findUserById(userId);
        if (userData == null) return { success: true, message: "User details fetched", data: {} };

        if (userData.profileImage) {
            userData.profileImage = await generateSignedUrl(userData.profileImage);
        }

        const { addressId, verificationToken, password, updatedAt, ...user } = userData;
        return { success: true, message: "User details fetched", data: user };
    }
}
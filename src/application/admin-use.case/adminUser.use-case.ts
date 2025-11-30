import {
    AdminFetchAllUsers,
    AdminFetchUserProfileDetailsRequest,
    AdminFetchUserProfileDetailsResponse,
    AdminChangeUserIsBlockedStatusRequest,
} from "../../infrastructure/dtos/admin.dto";
import { ApiPaginationRequest, ApiResponse } from "../../infrastructure/dtos/common.dto";
import { GenerateSignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";

export class AdminUserListUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
    ) { }

    async execute(payload: ApiPaginationRequest): Promise<ApiResponse<AdminFetchAllUsers>> {
        try {
            const result = await this.userRepositoryImpl.findAllUsers(payload);
            if (!result) throw new Error("Users fetching failed");

            return { data: result.data, totalPages: result.totalPages, currentPage: result.currentPage, totalCount: result.totalCount };
        } catch (error) {
            console.log("AdminUserListUseCase error :", error);
            throw new Error("Failed to fetch users");
        }
    }
}

export class AdminChangeUserBlockStatusUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
    ) { }

    async execute(payload: AdminChangeUserIsBlockedStatusRequest): Promise<ApiResponse> {
        try {
            const { userId, isBlocked } = payload;

            const user = await this.userRepositoryImpl.findUserById(userId);
            if (!user) throw new Error("No user found.");

            user.isBlocked = !isBlocked;

            const updatedUser = await this.userRepositoryImpl.updateUser(user);
            if (!updatedUser) throw new Error("User not found");

            return { success: true, message: `User ${isBlocked ? "unblocked" : "blocked"} successfully.` };
        } catch (error) {
            console.log("AdminChangeUserBlockStatusUseCase error :", error);
            throw new Error("Failed to change user block status");
        }
    }
}

export class AdminFetchUserDetailsUseCase {
    constructor(
        private userRepositoryImpl: UserRepositoryImpl,
        private generateSignedUrlService: GenerateSignedUrlService
    ) { }

    async execute(payload: AdminFetchUserProfileDetailsRequest): Promise<ApiResponse<AdminFetchUserProfileDetailsResponse>> {
        try {
            const { userId } = payload;
            
            const userData = await this.userRepositoryImpl.findUserById(userId);
            if (userData == null) return { success: true, message: "User details fetched", data: {} };

            if (userData.profileImage) {
                userData.profileImage = await this.generateSignedUrlService.execute(userData.profileImage);
            }

            const { addressId, verificationToken, password, updatedAt, ...user } = userData;
            return { success: true, message: "User details fetched", data: user };
        } catch (error) {
            console.log("AdminFetchUserDetailsUseCase error :", error);
            throw new Error("Failed to fetch user details");
        }
    }
}

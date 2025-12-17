import {
    AdminFetchAllUsers,
    AdminFetchUserProfileDetailsRequest,
    AdminFetchUserProfileDetailsResponse,
    AdminChangeUserIsBlockedStatusRequest,
} from "../../dtos/admin.dto";
import { SignedUrlService } from "../../../infrastructure/services/signedUrl.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { ApiPaginationRequest, ApiResponse } from "../../dtos/common.dto";

export class AdminUserListUseCase {
    constructor(
        private userRepository: IUserRepository,
    ) { }

    async execute(payload: ApiPaginationRequest): Promise<ApiResponse<AdminFetchAllUsers>> {
        try {
            const result = await this.userRepository.findAllUsers(payload);
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
        private userRepository: IUserRepository,
    ) { }

    async execute(payload: AdminChangeUserIsBlockedStatusRequest): Promise<ApiResponse> {
        try {
            const { userId, isBlocked } = payload;

            const user = await this.userRepository.findUserById(userId);
            if (!user) throw new Error("No user found.");

            user.isBlocked = !isBlocked;

            const updatedUser = await this.userRepository.updateUser(user);
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
        private userRepository: IUserRepository,
        private signedUrlService: SignedUrlService
    ) { }

    async execute(payload: AdminFetchUserProfileDetailsRequest): Promise<ApiResponse<AdminFetchUserProfileDetailsResponse>> {
        try {
            const { userId } = payload;
            
            const userData = await this.userRepository.findUserById(userId);
            if (userData == null) return { success: true, message: "User details fetched", data: {} };

            if (userData.profileImage) {
                userData.profileImage = await this.signedUrlService.generate(userData.profileImage);
            }

            const { addressId, verificationToken, password, updatedAt, ...user } = userData;
            return { success: true, message: "User details fetched", data: user };
        } catch (error) {
            console.log("AdminFetchUserDetailsUseCase error :", error);
            throw new Error("Failed to fetch user details");
        }
    }
}

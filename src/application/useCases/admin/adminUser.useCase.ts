import {
    AdminFetchAllUsers,
    AdminFetchUserProfileDetailsRequest,
    AdminFetchUserProfileDetailsResponse,
    AdminChangeUserIsBlockedStatusRequest,
} from "../../dtos/admin.dto";
import { SignedUrlService } from "../../../infrastructure/services/signedUrl.service";
import { IUserRepository } from "../../../domain/interfaces/repositories/IUser.repository";
import { ApiPaginationRequest, ApiResponse } from "../../dtos/common.dto";
import { IAdminUserQuery } from "../../queries/admin/IAdminUserQuery";

export class AdminUserListUseCase {
    constructor(
        private adminUserQuery: IAdminUserQuery,
    ) { }

    async execute(payload: ApiPaginationRequest): Promise<ApiResponse<AdminFetchAllUsers>> {
        try {
            const result = await this.adminUserQuery.findAll(payload);
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

            const user = await this.userRepository.findById(userId);
            if (!user) throw new Error("No user found.");

            if(user.isBlocked) {
                user.unblock();
            } else {
                user.block();
            }

            const updatedUser = await this.userRepository.update(user);
            if (!updatedUser) throw new Error("User not found");

            return { success: true, message: `User ${updatedUser.isBlocked ? "blocked" : "unBlocked"} successfully.` };
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
            
            const user = await this.userRepository.findById(userId);
            if(!user) throw new Error("User not found")

            let signedProfileImage: string;
            if (user.profileImage) {
                 signedProfileImage = await this.signedUrlService.generate(user.profileImage);
            }

            const { addressId, verificationToken, password, updatedAt, ...rest } = user;
            return { success: true, message: "User details fetched", data: rest };
        } catch (error) {
            console.log("AdminFetchUserDetailsUseCase error :", error);
            throw new Error("Failed to fetch user details");
        }
    }
}

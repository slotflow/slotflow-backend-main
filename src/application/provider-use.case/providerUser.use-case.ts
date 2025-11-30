import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { GenerateSignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderFetchUsersForChatSideBarResponse, ProviderFetchUsersForChatSideBarRequest } from "../../infrastructure/dtos/provider.dto";

export class ProviderFetchUserForChatSidebarUseCase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl,
        private generateSignedUrlService: GenerateSignedUrlService
    ) { }

    async execute(payload: ProviderFetchUsersForChatSideBarRequest): Promise<ApiResponse<ProviderFetchUsersForChatSideBarResponse>> {
        try {
            const { providerId } = payload;
            const result = await this.bookingRepositoryImpl.findUsersforChatSideBar(providerId);

            const updatedResult = await Promise.all(
                (result as ProviderFetchUsersForChatSideBarResponse).map(async (user) => {
                    let profileImageUrl = user?.profileImage;

                    if (profileImageUrl) {
                        const signedUrl = await this.generateSignedUrlService.execute(profileImageUrl);
                        user.profileImage = signedUrl;
                    }

                    return user;
                })
            )

            return { data: updatedResult }
        } catch (error) {
            console.log("ProviderFetchUserForChatSidebarUseCase error : ", error);
            throw new Error("Failed to fetch user for chat sidebar");
        }
    }
}
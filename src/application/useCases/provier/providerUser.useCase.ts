import { ApiResponse } from "../../../infrastructure/dtos/common.dto";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { IBookingRepository } from "../../../domain/interfaces/repositories/IBooking.repository";
import { ProviderFetchUsersForChatSideBarResponse, ProviderFetchUsersForChatSideBarRequest } from "../../../infrastructure/dtos/provider.dto";

export class ProviderFetchUserForChatSidebarUseCase {
    constructor(
        private bookingRepository: IBookingRepository,
        private signedUrlService: ISignedUrlService
    ) { }

    async execute(payload: ProviderFetchUsersForChatSideBarRequest): Promise<ApiResponse<ProviderFetchUsersForChatSideBarResponse>> {
        try {
            const { providerId } = payload;
            const result = await this.bookingRepository.findUsersforChatSideBar(providerId);

            const updatedResult = await Promise.all(
                (result as ProviderFetchUsersForChatSideBarResponse).map(async (user) => {
                    let profileImageUrl = user?.profileImage;

                    if (profileImageUrl) {
                        const signedUrl = await this.signedUrlService.generate(profileImageUrl);
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
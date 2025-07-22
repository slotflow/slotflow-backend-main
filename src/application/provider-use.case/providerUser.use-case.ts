import { Provider } from "../../domain/entities/provider.entity";
import { ApiResponse } from "../../infrastructure/dtos/common.dto";
import { Validator } from "../../infrastructure/validator/validator";
import { generateSignedUrl } from "../../infrastructure/services/signedUrl.service";
import { ProviderFetchUsersForChatSideBar } from "../../infrastructure/dtos/provider.dto";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";

export class ProviderFetchUserForChatSidebarUseCase {
    constructor(
        private bookingRepositoryImpl: BookingRepositoryImpl
    ) { }

    async execute(providerId: Provider["_id"]): Promise<ApiResponse<ProviderFetchUsersForChatSideBar>> {

        Validator.validateObjectId(providerId, "Provider Id")
        const result = await this.bookingRepositoryImpl.findUsersforChatSideBar(providerId);

        const updatedResult: ProviderFetchUsersForChatSideBar = await Promise.all(
            result.map(async (user) => {
                let profileImageUrl = user?.profileImage;

                if (profileImageUrl) {
                    const signedUrl = await generateSignedUrl(profileImageUrl);
                    user.profileImage = signedUrl;
                }

                return user;
            })
        )

        return { data: updatedResult }
    }
}
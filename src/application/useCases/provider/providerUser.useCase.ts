import { log } from "../../../shared/logger/logger";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { ProviderGetUsersForChatSideBarResponse, ProviderGetUsersForChatSideBarRequest } from "../../dtos/provider.dto";

export class ProviderGetUserForChatSidebarUseCase {
    constructor(
        private signedUrlService: ISignedUrlService,
        private bookingQueries: IBookingQueries,
    ) { };

    async execute(payload: ProviderGetUsersForChatSideBarRequest): Promise<ProviderGetUsersForChatSideBarResponse> {
        try {
            const { providerId } = payload;
            const result = await this.bookingQueries.findUsersforChatSideBar(providerId);

            const updatedResult = await Promise.all(
                (result as ProviderGetUsersForChatSideBarResponse).map(async (user) => {
                    let profileImageUrl = user?.profileImage;

                    if (profileImageUrl) {
                        const signedUrl = await this.signedUrlService.get(profileImageUrl);
                        user.profileImage = signedUrl;
                    };

                    return user;
                }),
            );

            return updatedResult;
        } catch (error) {
            log.error("ProviderGetUserForChatSidebarUseCase failed", error as Error);
            throw error;
        };
    };
};
import { log } from "../../../shared/logger/logger";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { ProviderGetUsersForChatSideBarResponse, ProviderGetUsersForChatSideBarRequest } from "../../dtos/provider.dto";
import { Role } from "../../../domain/enums/common.enum";

export class GetUserForChatSidebarUseCase {
    constructor(
        private signedUrlService: ISignedUrlService,
        private bookingQueries: IBookingQueries,
    ) { };

    async execute(payload: ProviderGetUsersForChatSideBarRequest): Promise<ProviderGetUsersForChatSideBarResponse> {
        try {
            const { userId, role } = payload;
            const result = await this.bookingQueries.findUsersforChatSideBar({
                userId,
                role: role === Role.PROVIDER ? Role.USER : Role.PROVIDER
            });

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
            log.error("GetUserForChatSidebarUseCase failed", error as Error);
            throw error;
        };
    };
};
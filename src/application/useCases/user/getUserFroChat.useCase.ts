import { Role } from "../../../domain/enums/common.enum";
import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { IBookingQueries } from "../../interfaces/queries/IBooking.queries";
import { ISignedUrlService } from "../../interfaces/services/ISignedUrl.service";
import { GetUserForChatSidebarInput, GetUserForChatSidebarOutput } from "../../dtos/user.dto";

export class GetUserForChatSidebarUseCase {
    constructor(
        private readonly signedUrlService: ISignedUrlService,
        private readonly bookingQueries: IBookingQueries,
    ) { };

    async execute(input: GetUserForChatSidebarInput): Promise<GetUserForChatSidebarOutput> {
        try {
            const { userId, role, timeZone } = input;
            if (!userId || !role) {
                throw new BadRequestError();
            }

            const result = await this.bookingQueries.findUsersforChatSideBar({
                userId,
                role,
                timeZone
            });

            if (!result) {
                return [];
            }

            const updatedResult = await Promise.all(
                (result as GetUserForChatSidebarOutput).map(async (user) => {
                    let profileImageUrl = user?.profileImage;

                    if (profileImageUrl) {
                        const signedUrl = await this.signedUrlService.get(profileImageUrl);
                        user.profileImage = signedUrl;
                    };

                    return user;
                }),
            );

            return updatedResult;
        } catch (error: unknown) {
            throw toAppError(error, "Failed to get users");
        };
    };
};
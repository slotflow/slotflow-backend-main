import { Role } from "../../../domain/enums/common.enum";
import { IBookingQueries } from "../../queries/IBooking.queries";
import { BadRequestError } from "../../../shared/error/appError";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { ISignedUrlService } from "../../../domain/interfaces/services/ISignedUrl.service";
import { GetUserForChatSidebarInput, GetUserForChatSidebarOutput } from "../../dtos/user.dto";

export class GetUserForChatSidebarUseCase {
    constructor(
        private signedUrlService: ISignedUrlService,
        private bookingQueries: IBookingQueries,
    ) { };

    async execute(input: GetUserForChatSidebarInput): Promise<GetUserForChatSidebarOutput> {
        try {
            const { userId, role } = input;
            if (!userId || !role) {
                throw new BadRequestError();
            }

            const result = await this.bookingQueries.findUsersforChatSideBar({
                userId,
                role: role === Role.PROVIDER ? Role.USER : Role.PROVIDER
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
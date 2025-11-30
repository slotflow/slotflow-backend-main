import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { GenerateSignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderFetchUserForChatSidebarUseCase } from "../../application/provider-use.case/providerUser.use-case";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";

const bookingRepositoryImpl = new BookingRepositoryImpl();
const signedUrlCacheRepositoryImpl = new SignedUrlCacheRepositoryImpl();

const generateSignedUrlService = new GenerateSignedUrlService(signedUrlCacheRepositoryImpl);

const providerFetchUserForChatSidebarUseCase = new ProviderFetchUserForChatSidebarUseCase(bookingRepositoryImpl, generateSignedUrlService);

export class ProviderUserController {
    constructor(
        private providerFetchUserForChatSidebarUseCase: ProviderFetchUserForChatSidebarUseCase,
    ) {
        this.fetchUsersForChatSideBar = this.fetchUsersForChatSideBar.bind(this);
    }

    async fetchUsersForChatSideBar(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.providerFetchUserForChatSidebarUseCase.execute({ providerId: new Types.ObjectId(providerId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchUsersForChatSideBar error : ", error);
            next(error)
        }
    }
}

const providerUserController = new ProviderUserController(
    providerFetchUserForChatSidebarUseCase
);
export { providerUserController };
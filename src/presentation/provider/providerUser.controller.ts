import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { SignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { IBookingRepository } from "../../domain/interfaces/repositories/IBooking.repository";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ISignedUrlCacheRepository } from "../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { ProviderFetchUserForChatSidebarUseCase } from "../../application/useCases/provier/providerUser.useCase";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";

const bookingRepository: IBookingRepository = new BookingRepositoryImpl();
const signedUrlCacheRepository: ISignedUrlCacheRepository = new SignedUrlCacheRepositoryImpl();

const signedUrlService: ISignedUrlService = new SignedUrlService(signedUrlCacheRepository);

const providerFetchUserForChatSidebarUseCase = new ProviderFetchUserForChatSidebarUseCase(bookingRepository, signedUrlService);

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
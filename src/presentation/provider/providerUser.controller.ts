import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { IBookingQueries } from "../../application/queries/IBooking.queries";
import { SignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { BookingQueriesImpl } from "../../infrastructure/queries/bookingQueries.impl";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { ISignedUrlCacheRepository } from "../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { ProviderFetchUserForChatSidebarUseCase } from "../../application/useCases/provier/providerUser.useCase";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";

const signedUrlCacheRepository: ISignedUrlCacheRepository = new SignedUrlCacheRepositoryImpl();
const bookingQueries: IBookingQueries = new BookingQueriesImpl();

const signedUrlService: ISignedUrlService = new SignedUrlService(signedUrlCacheRepository);

const providerFetchUserForChatSidebarUseCase = new ProviderFetchUserForChatSidebarUseCase(signedUrlService, bookingQueries);

export class ProviderUserController {
    constructor(
        private providerFetchUserForChatSidebarUseCase: ProviderFetchUserForChatSidebarUseCase,
    ) {
        this.fetchUsersForChatSideBar = this.fetchUsersForChatSideBar.bind(this);
    };

    async fetchUsersForChatSideBar(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.providerFetchUserForChatSidebarUseCase.execute({ providerId });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchUsersForChatSideBar failed", error as Error);
            next(error);
        };
    };
    
};

export const providerUserController = new ProviderUserController(
    providerFetchUserForChatSidebarUseCase
);
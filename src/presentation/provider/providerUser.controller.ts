import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { redis } from "../../infrastructure/lib/redis";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { s3Client } from "../../infrastructure/lib/aws_s3";
import { IBookingQueries } from "../../application/queries/IBooking.queries";
import { BookingQueriesImpl } from "../../infrastructure/queries/bookingQueries.impl";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { SignedUrlServiceImpl } from "../../infrastructure/services/signedUrlService.impl";
import { ProviderFetchUserForChatSidebarUseCase } from "../../application/useCases/provier/providerUser.useCase";

const bookingQueries: IBookingQueries = new BookingQueriesImpl();

const signedUrlService: ISignedUrlService = new SignedUrlServiceImpl(redis, s3Client);

const providerFetchUserForChatSidebarUseCase = new ProviderFetchUserForChatSidebarUseCase(signedUrlService, bookingQueries);

class ProviderUserController {
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
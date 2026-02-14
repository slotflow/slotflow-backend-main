import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { providerFetchUserForChatSidebarUseCase } from ".";
import { DecodedUser } from "../../application/dtos/common.dto";
import { validateProviderIdSchema } from "../../shared/zod/provider.zod";
import { ProviderFetchUserForChatSidebarUseCase } from "../../application/useCases/provider/providerUser.useCase";

class ProviderUserController {
    constructor(
        private providerFetchUserForChatSidebarUseCase: ProviderFetchUserForChatSidebarUseCase,
    ) {
        this.fetchUsersForChatSideBar = this.fetchUsersForChatSideBar.bind(this);
    };

    async fetchUsersForChatSideBar(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId
            });
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
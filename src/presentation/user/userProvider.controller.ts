import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { validateProviderIdSchema } from "../../shared/zod/provider.zod";
import { fetchProviderServiceAvailabilitySchema } from "../../shared/zod/common.zod";
import { userFetchAllProvidersSchema, validateUserIdSchema } from "../../shared/zod/user.zod";
import { userFetchProvidersForChatSidebarUseCase, userFetchServiceProviderServiceAvailabilityUseCase, userFetchServiceProviderServiceDetailsUseCase, userFetchServiceProvidersUseCase } from ".";
import { UserFetchProvidersForChatSidebarUseCase, UserFetchServiceProviderServiceAvailabilityUseCase, UserFetchServiceProviderServiceDetailsUseCase, UserFetchServiceProvidersUseCase } from "../../application/useCases/user/userProvider.useCase";

class UserProviderController {
    constructor(
        private userFetchServiceProvidersUseCase: UserFetchServiceProvidersUseCase,
        private userFetchServiceProviderServiceDetailsUseCase: UserFetchServiceProviderServiceDetailsUseCase,
        private userFetchServiceProviderServiceAvailabilityUseCase: UserFetchServiceProviderServiceAvailabilityUseCase,
        private userFetchProvidersForChatSidebar: UserFetchProvidersForChatSidebarUseCase,
    ) {
        this.fetchServiceProviders = this.fetchServiceProviders.bind(this);
        this.fetchServiceProviderServiceDetails = this.fetchServiceProviderServiceDetails.bind(this);
        this.fetchServiceProviderServiceAvailability = this.fetchServiceProviderServiceAvailability.bind(this);
        this.fetchProvidersForChatSidebar = this.fetchProvidersForChatSidebar.bind(this);
    };

    async fetchServiceProviders(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = userFetchAllProvidersSchema.parse(req.query);
            const { categories, location, maxPrice, minPrice, slotflowTrusted, appServiceIds, skip, limit } = validatedData;
            let serviceIds: string[] = [];
            if (appServiceIds) {
                const servicesArray = Array.isArray(appServiceIds)
                    ? appServiceIds
                    : appServiceIds.split(",");

                serviceIds = servicesArray.map(id => id);
            };
            const result = await this.userFetchServiceProvidersUseCase.execute({ serviceIds, categories, location, maxPrice, minPrice, slotflowTrusted, skip, limit });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchServiceProviders failed", error as Error);
            next(error);
        };
    };

    async fetchServiceProviderServiceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({providerId: req.params.providerId});
            const result = await this.userFetchServiceProviderServiceDetailsUseCase.execute({ providerId });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchServiceProviderServiceDetails failed", error as Error);
            next(error);
        };
    };

    async fetchServiceProviderServiceAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, providerId } = fetchProviderServiceAvailabilitySchema.parse({
                providerId: req.params.providerId,
                date: req.query.date
            });
            const result = await this.userFetchServiceProviderServiceAvailabilityUseCase.execute({ providerId, date: new Date(date) });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchServiceProviderServiceAvailability failed", error as Error);
            next(error);
        };
    };

    async fetchProvidersForChatSidebar(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = validateUserIdSchema.parse({ userId: (req.user as DecodedUser).userOrProviderId });
            const result = await this.userFetchProvidersForChatSidebar.execute({ userId });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchProvidersForChatSidebar failed", error as Error);
            next(error);
        };
    };

};

export const userProviderController = new UserProviderController(
    userFetchServiceProvidersUseCase,
    userFetchServiceProviderServiceDetailsUseCase,
    userFetchServiceProviderServiceAvailabilityUseCase,
    userFetchProvidersForChatSidebarUseCase
);
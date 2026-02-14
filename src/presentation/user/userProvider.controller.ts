import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { validateProviderIdSchema } from "../../shared/zod/provider.zod";
import { fetchProviderServiceAvailabilitySchema } from "../../shared/zod/common.zod";
import { userFetchAllProvidersSchema, validateUserIdSchema } from "../../shared/zod/user.zod";
import { userFetchProvidersForChatSidebarUseCase, userFetchServiceProviderAddressUseCase, userFetchServiceProviderProfileDetailsUseCase, userFetchServiceProviderServiceAvailabilityUseCase, userFetchServiceProviderServiceDetailsUseCase, userFetchServiceProvidersUseCase } from ".";
import { UserFetchProvidersForChatSidebarUseCase, UserFetchServiceProviderAddressUseCase, UserFetchServiceProviderProfileDetailsUseCase, UserFetchServiceProviderServiceAvailabilityUseCase, UserFetchServiceProviderServiceDetailsUseCase, UserFetchServiceProvidersUseCase } from "../../application/useCases/user/userProvider.useCase";

class UserProviderController {
    constructor(
        private userFetchServiceProvidersUseCase: UserFetchServiceProvidersUseCase,
        private userFetchServiceProviderAddressUseCase: UserFetchServiceProviderAddressUseCase,
        private userFetchServiceProviderProfileDetailsUseCase: UserFetchServiceProviderProfileDetailsUseCase,
        private userFetchServiceProviderServiceDetailsUseCase: UserFetchServiceProviderServiceDetailsUseCase,
        private userFetchServiceProviderServiceAvailabilityUseCase: UserFetchServiceProviderServiceAvailabilityUseCase,
        private userFetchProvidersForChatSidebar: UserFetchProvidersForChatSidebarUseCase,
    ) {
        this.fetchServiceProviders = this.fetchServiceProviders.bind(this);
        this.fetchServiceProviderAddress = this.fetchServiceProviderAddress.bind(this);
        this.fetchServiceProviderProfileDetails = this.fetchServiceProviderProfileDetails.bind(this);
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

    async fetchServiceProviderAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({providerId: req.params.providerId});
            const result = await this.userFetchServiceProviderAddressUseCase.execute({ providerId });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchServiceProviderAddress failed", error as Error);
            next(error);
        };
    };

    async fetchServiceProviderProfileDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({providerId: req.params.providerId});
            const result = await this.userFetchServiceProviderProfileDetailsUseCase.execute({ providerId });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchServiceProviderProfileDetails failed", error as Error);
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
    userFetchServiceProviderAddressUseCase,
    userFetchServiceProviderProfileDetailsUseCase,
    userFetchServiceProviderServiceDetailsUseCase,
    userFetchServiceProviderServiceAvailabilityUseCase,
    userFetchProvidersForChatSidebarUseCase
);
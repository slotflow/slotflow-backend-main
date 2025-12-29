import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { UserFetchAllProvidersZodSchema } from "../../shared/zod/user.zod";
import { DateZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
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
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { selectedServices } = UserFetchAllProvidersZodSchema.parse(req.query);
            if (!userId) throw new Error("Invalid request.");
            let serviceIds: string[] = [];
            if (selectedServices) {
                const servicesArray = Array.isArray(selectedServices)
                    ? selectedServices
                    : selectedServices.split(",");

                serviceIds = servicesArray.map(id => id);
            }
            const result = await this.userFetchServiceProvidersUseCase.execute({ userId, serviceIds });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchServiceProviders failed", error as Error);
            next(error);
        };
    };

    async fetchServiceProviderAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!userId || !providerId) throw new Error("Invalid request");
            const result = await this.userFetchServiceProviderAddressUseCase.execute({ userId, providerId });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchServiceProviderAddress failed", error as Error);
            next(error);
        };
    };

    async fetchServiceProviderProfileDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!userId || !providerId) throw new Error("Invalid request");
            const result = await this.userFetchServiceProviderProfileDetailsUseCase.execute({ userId, providerId });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchServiceProviderProfileDetails failed", error as Error);
            next(error);
        };
    };

    async fetchServiceProviderServiceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!userId || !providerId) throw new Error("Invalid request");
            const result = await this.userFetchServiceProviderServiceDetailsUseCase.execute({ userId, providerId });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchServiceProviderServiceDetails failed", error as Error);
            next(error);
        };
    };

    async fetchServiceProviderServiceAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            const { date } = DateZodSchema.parse(req.query);
            if (!userId || !providerId || !date) throw new Error("Invalid request");
            const result = await this.userFetchServiceProviderServiceAvailabilityUseCase.execute({ userId, providerId, date: new Date(date) });
            sendResponse(res, result);
        } catch (error) {
            log.error("fetchServiceProviderServiceAvailability failed", error as Error);
            next(error);
        };
    };

    async fetchProvidersForChatSidebar(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
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
import { DecodedUser } from "../../express";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { UserFetchAllProvidersZodSchema } from "../../shared/zod/user.zod";
import { IBookingQueries } from "../../application/queries/IBooking.queries";
import { DateZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { SignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { BookingQueriesImpl } from "../../infrastructure/queries/bookingQueries.impl";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { IProviderServiceQueries } from "../../application/queries/IProviderService.queries";
import { IServiceAvailabilityQueries } from "../../application/queries/IServiceAvailability.queries";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { ProviderServiceQueriesImpl } from "../../infrastructure/queries/providerServiceQueries.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { ServiceAvailabilityQueriesImpl } from "../../infrastructure/queries/serviceAvailabilityQueries.impl";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";
import { UserFetchProvidersForChatSidebar, UserFetchServiceProviderAddressUseCase, UserFetchServiceProviderProfileDetailsUseCase, UserFetchServiceProviderServiceAvailabilityUseCase, UserFetchServiceProviderServiceDetailsUseCase, UserFetchServiceProvidersUseCase } from "../../application/useCases/user/userProvider.useCase";

const userRepositoryImpl = new UserRepositoryImpl();
const addressRepositoryImpl = new AddressRepositoryImpl();
const providerRepositoryImpl = new ProviderRepositoryImpl();
const signedUrlCacheRepositoryImpl = new SignedUrlCacheRepositoryImpl();

const signedUrlService: ISignedUrlService = new SignedUrlService(signedUrlCacheRepositoryImpl);

const bookingQueries: IBookingQueries = new BookingQueriesImpl();
const providerServiceQueries: IProviderServiceQueries = new ProviderServiceQueriesImpl();
const serviceAvailabilityQueries: IServiceAvailabilityQueries = new ServiceAvailabilityQueriesImpl();

const userFetchServiceProvidersUseCase = new UserFetchServiceProvidersUseCase(userRepositoryImpl, signedUrlService, providerServiceQueries);
const userFetchServiceProviderProfileDetailsUseCase = new UserFetchServiceProviderProfileDetailsUseCase(userRepositoryImpl, providerRepositoryImpl, signedUrlService);
const userFetchServiceProviderAddressUseCase = new UserFetchServiceProviderAddressUseCase(userRepositoryImpl, addressRepositoryImpl);
const userFetchServiceProviderServiceDetailsUseCase = new UserFetchServiceProviderServiceDetailsUseCase(userRepositoryImpl, providerServiceQueries);
const userFetchServiceProviderServiceAvailabilityUseCase = new UserFetchServiceProviderServiceAvailabilityUseCase(providerRepositoryImpl, userRepositoryImpl, serviceAvailabilityQueries);
const userFetchProvidersForChatSidebar = new UserFetchProvidersForChatSidebar(signedUrlService, bookingQueries);

export class UserProviderController {
    constructor(
        private userFetchServiceProvidersUseCase: UserFetchServiceProvidersUseCase,
        private userFetchServiceProviderAddressUseCase: UserFetchServiceProviderAddressUseCase,
        private userFetchServiceProviderProfileDetailsUseCase: UserFetchServiceProviderProfileDetailsUseCase,
        private userFetchServiceProviderServiceDetailsUseCase: UserFetchServiceProviderServiceDetailsUseCase,
        private userFetchServiceProviderServiceAvailabilityUseCase: UserFetchServiceProviderServiceAvailabilityUseCase,
        private userFetchProvidersForChatSidebar: UserFetchProvidersForChatSidebar,
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
    userFetchProvidersForChatSidebar
);
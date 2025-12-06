import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { NextFunction, Request, Response } from "express";
import { UserFetchAllProvidersZodSchema } from "../../shared/zod/user.zod";
import { DateZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { SignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { BookingRepositoryImpl } from "../../infrastructure/database/booking/booking.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";
import { ProviderServiceRepositoryImpl } from "../../infrastructure/database/providerService/providerService.repository.impl";
import { ServiceAvailabilityRepositoryImpl } from "../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";
import { UserFetchProvidersForChatSidebar, UserFetchServiceProviderAddressUseCase, UserFetchServiceProviderProfileDetailsUseCase, UserFetchServiceProviderServiceAvailabilityUseCase, UserFetchServiceProviderServiceDetailsUseCase, UserFetchServiceProvidersUseCase } from "../../application/useCases/user/userProvider.useCase";

const userRepositoryImpl = new UserRepositoryImpl();
const addressRepositoryImpl = new AddressRepositoryImpl();
const bookingRepositoryImpl = new BookingRepositoryImpl();
const providerRepositoryImpl = new ProviderRepositoryImpl();
const providerServiceRepository = new ProviderServiceRepositoryImpl();
const signedUrlCacheRepositoryImpl = new SignedUrlCacheRepositoryImpl();
const providerServiceRepositoryImpl = new ProviderServiceRepositoryImpl();
const serviceAvailabilityRepositoryImpl = new ServiceAvailabilityRepositoryImpl();

const signedUrlService: ISignedUrlService = new SignedUrlService(signedUrlCacheRepositoryImpl);

const userFetchProvidersForChatSidebar = new UserFetchProvidersForChatSidebar(bookingRepositoryImpl, signedUrlService);
const userFetchServiceProviderAddressUseCase = new UserFetchServiceProviderAddressUseCase(userRepositoryImpl, addressRepositoryImpl);
const userFetchServiceProviderServiceDetailsUseCase = new UserFetchServiceProviderServiceDetailsUseCase(userRepositoryImpl, providerServiceRepository);
const userFetchServiceProvidersUseCase = new UserFetchServiceProvidersUseCase(userRepositoryImpl, providerServiceRepositoryImpl, signedUrlService);
const userFetchServiceProviderServiceAvailabilityUseCase = new UserFetchServiceProviderServiceAvailabilityUseCase(userRepositoryImpl, serviceAvailabilityRepositoryImpl);
const userFetchServiceProviderProfileDetailsUseCase = new UserFetchServiceProviderProfileDetailsUseCase(userRepositoryImpl, providerRepositoryImpl, signedUrlService);

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
    }

    async fetchServiceProviders(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { selectedServices } = UserFetchAllProvidersZodSchema.parse(req.query);
            if (!userId) throw new Error("Invalid request.");
            let serviceIds: Types.ObjectId[] = [];
            if (selectedServices) {
                const servicesArray = Array.isArray(selectedServices)
                    ? selectedServices
                    : selectedServices.split(",");

                serviceIds = servicesArray.map(id => new Types.ObjectId(id));
            }
            const result = await this.userFetchServiceProvidersUseCase.execute({ userId: new Types.ObjectId(userId), serviceIds });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchServiceProviders error : ", error);
            next(error)
        }
    }

    async fetchServiceProviderAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!userId || !providerId) throw new Error("Invalid request");
            const result = await this.userFetchServiceProviderAddressUseCase.execute({ userId: new Types.ObjectId(userId), providerId: new Types.ObjectId(providerId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchServiceProviderAddress error : ", error);
            next(error)
        }
    }

    async fetchServiceProviderProfileDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!userId || !providerId) throw new Error("Invalid request");
            const result = await this.userFetchServiceProviderProfileDetailsUseCase.execute({ userId: new Types.ObjectId(userId), providerId: new Types.ObjectId(providerId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchServiceProviderProfileDetails error : ", error);
            next(error)
        }
    }

    async fetchServiceProviderServiceDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!userId || !providerId) throw new Error("Invalid request");
            const result = await this.userFetchServiceProviderServiceDetailsUseCase.execute({ userId: new Types.ObjectId(userId), providerId: new Types.ObjectId(providerId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchServiceProviderServiceDetails error : ", error);
            next(error)
        }
    }

    async fetchServiceProviderServiceAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            const { date } = DateZodSchema.parse(req.query);
            if (!userId || !providerId || !date) throw new Error("Invalid request");
            const result = await this.userFetchServiceProviderServiceAvailabilityUseCase.execute({ userId: new Types.ObjectId(userId), providerId: new Types.ObjectId(providerId), date: new Date(date) });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchServiceProviderServiceAvailability error : ", error);
            next(error)
        }
    }

    async fetchProvidersForChatSidebar(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.userFetchProvidersForChatSidebar.execute({ userId: new Types.ObjectId(userId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchProvidersForChatSidebar error : ", error);
            next(error)
        }
    }
}

const userProviderController = new UserProviderController(
    userFetchServiceProvidersUseCase,
    userFetchServiceProviderAddressUseCase,
    userFetchServiceProviderProfileDetailsUseCase,
    userFetchServiceProviderServiceDetailsUseCase,
    userFetchServiceProviderServiceAvailabilityUseCase,
    userFetchProvidersForChatSidebar
);

export { userProviderController };
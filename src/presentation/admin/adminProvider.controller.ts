import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { SignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { IAddressRepository } from "../../domain/interfaces/repositories/IAddress.repository";
import { IPaymentRepository } from "../../domain/interfaces/repositories/IPayment.repository";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { ISubscriptionRepository } from "../../domain/interfaces/repositories/ISubscription.repository";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { DateZodSchema, RequestQueryCommonZodSchema, ValidateObjectId } from "../../shared/zod/common.zod";
import { FetchProviderProofsUseCase } from "../../application/useCases/common/fetchProviderProofs.useCase";
import { ISignedUrlCacheRepository } from "../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { IProviderServiceRepository } from "../../domain/interfaces/repositories/IProviderService.repository";
import { AdminFetchUserOrProviderAddressUseCase } from "../../application/useCases/admin/adminAddress.useCase";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";
import { IServiceAvailabilityRepository } from "../../domain/interfaces/repositories/IServiceAvailability.repository";
import { ProviderServiceRepositoryImpl } from "../../infrastructure/database/providerService/providerService.repository.impl";
import { ServiceAvailabilityRepositoryImpl } from "../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";
import { AdminChangeProviderStatusZodSchema, AdminChangeProviderTrustedTagZodSchema, adminRejectProviderZodSchema } from "../../shared/zod/admin.zod";
import { AdminApproveProviderUseCase, AdminChangeProviderBlockStatusUseCase, AdminChangeProviderTrustTagUseCase, AdminProviderListUseCase, AdminRejectProviderUseCase } from "../../application/useCases/admin/adminProvider.useCase";
import { AdminFetchProviderDetailsUseCase, AdminFetchProviderPaymentsUseCase, AdminfetchProviderServiceAvailabilityUseCase, AdminFetchProviderServiceUseCase, AdminFetchProviderSubscriptionsUseCase } from "../../application/useCases/admin/adminProviderProfile.useCase";


const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();
const addressRepository: IAddressRepository = new AddressRepositoryImpl();
const providerRepository: IProviderRepository = new ProviderRepositoryImpl();
const subscriptionRepository: ISubscriptionRepository = new SubscriptionRepositoryImpl();
const signedUrlCacheRepository: ISignedUrlCacheRepository = new SignedUrlCacheRepositoryImpl();
const providerServiceRepository: IProviderServiceRepository = new ProviderServiceRepositoryImpl();
const serviceAvailability: IServiceAvailabilityRepository = new ServiceAvailabilityRepositoryImpl();

const signedUrlService: ISignedUrlService = new SignedUrlService(signedUrlCacheRepository);

const adminProviderListUseCase = new AdminProviderListUseCase(providerRepository);
const adminApproveProviderUseCase = new AdminApproveProviderUseCase(providerRepository);
const adminRejectProviderUseCase = new AdminRejectProviderUseCase(providerRepository);
const adminChangeProviderBlockStatusUseCase = new AdminChangeProviderBlockStatusUseCase(providerRepository);
const adminChangeProviderTrustTagUseCase = new AdminChangeProviderTrustTagUseCase(providerRepository);

const fetchProviderProofsUseCase = new FetchProviderProofsUseCase(signedUrlService, providerRepository);
const adminFetchUserOrProviderAddressUseCase = new AdminFetchUserOrProviderAddressUseCase(addressRepository);
const adminFetchProviderDetailsUseCase = new AdminFetchProviderDetailsUseCase(providerRepository, signedUrlService);
const adminFetchProviderPaymentsUseCase = new AdminFetchProviderPaymentsUseCase(providerRepository, paymentRepository)
const adminFetchProviderServiceUseCase = new AdminFetchProviderServiceUseCase(providerRepository, providerServiceRepository);
const adminFetchProviderSubscriptionsUseCase = new AdminFetchProviderSubscriptionsUseCase(providerRepository, subscriptionRepository);
const adminFetchProviderServiceAvailabilityUseCase = new AdminfetchProviderServiceAvailabilityUseCase(providerRepository, serviceAvailability);

class AdminProviderController {
    constructor(
        private adminProviderListUseCase: AdminProviderListUseCase,
        private adminApproveProviderUseCase: AdminApproveProviderUseCase,
        private adminRejectProviderUseCase: AdminRejectProviderUseCase,
        private adminChangeProviderBlockStatusUseCase: AdminChangeProviderBlockStatusUseCase,
        private adminChangeProviderTrustTagUseCase: AdminChangeProviderTrustTagUseCase,
        private adminFetchProviderDetailsUseCase: AdminFetchProviderDetailsUseCase,
        private adminFetchUserOrProviderAddressUseCase: AdminFetchUserOrProviderAddressUseCase,
        private adminFetchProviderServiceUseCase: AdminFetchProviderServiceUseCase,
        private adminFetchProviderServiceAvailabilityUseCase: AdminfetchProviderServiceAvailabilityUseCase,
        private adminFetchProviderSubscriptionsUseCase: AdminFetchProviderSubscriptionsUseCase,
        private adminFetchProviderPaymentsUseCase: AdminFetchProviderPaymentsUseCase,
        private fetchProviderProofsUseCase: FetchProviderProofsUseCase,
    ) {
        this.getAllProviders = this.getAllProviders.bind(this);
        this.approveProvider = this.approveProvider.bind(this);
        this.rejectProvider = this.rejectProvider.bind(this);
        this.changeProviderBlockStatus = this.changeProviderBlockStatus.bind(this);
        this.fetchProviderDetails = this.fetchProviderDetails.bind(this);
        this.fetchProviderAddress = this.fetchProviderAddress.bind(this);
        this.fetchProviderService = this.fetchProviderService.bind(this);
        this.fetchProviderServiceAvailability = this.fetchProviderServiceAvailability.bind(this);
        this.changeProviderTrustedTag = this.changeProviderTrustedTag.bind(this);
        this.fetchProviderSubscriptions = this.fetchProviderSubscriptions.bind(this);
        this.fetchProviderPayments = this.fetchProviderPayments.bind(this);
        this.fetchProviderProofs = this.fetchProviderProofs.bind(this);
    }

    async getAllProviders(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminProviderListUseCase.execute({ page, limit });
            sendResponse(res,result);
        } catch (error) {
            log.error("getAllProviders failed",error as Error);
            next(error);
        }
    }

    async approveProvider(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!providerId) throw new Error("Invalid request.");
            await this.adminApproveProviderUseCase.execute({ providerId });
            sendResponse(res,null,"Successfully approved provider");
        } catch (error) {
            log.error("approveProvider failed", error as Error);
            next(error);
        }
    }

    async rejectProvider(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!providerId) throw new Error("Invalid request.");
            const validatedData = adminRejectProviderZodSchema.parse(req.body);
            await this.adminRejectProviderUseCase.execute({
                providerId,
                ...validatedData
            });
            sendResponse(res,null,"Successfully rejected provider");
        } catch (error) {
            log.error("rejectProvider failed", error as Error);
            next(error);
        }
    }

    async changeProviderBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus } = AdminChangeProviderStatusZodSchema.parse(req.body);
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!providerId || blockStatus === null) throw new Error("Invalid request.");
            const result = await this.adminChangeProviderBlockStatusUseCase.execute({ providerId, isBlocked: blockStatus });
            sendResponse(res,result,`Successfully ${result.isBlocked ? "blocked" : "unblocked"} provider`);
        } catch (error) {
            log.error("changeProviderBlockStatus failed", error as Error);
            next(error);
        }
    }

    async changeProviderTrustedTag(req: Request, res: Response, next: NextFunction) {
        try {
            const { trustTag } = AdminChangeProviderTrustedTagZodSchema.parse(req.body);
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!providerId || trustTag === null || undefined) throw new Error("Invalid request.");
            const result = await this.adminChangeProviderTrustTagUseCase.execute({ providerId, trustedBySlotflow: trustTag });
            sendResponse(res,result,`Successfully ${result.trustedBySlotflow ? "given" : "revoked"} provider trust tag`);
        } catch (error) {
            log.error("changeProviderTrustedTag failed", error as Error);
            next(error);
        }
    }

    async fetchProviderDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.adminFetchProviderDetailsUseCase.execute({ providerId });
            res.status(200).json(result);
        } catch (error) {
            log.error("fetchProviderDetails failed", error as Error);
            next(error);
        }
    }

    async fetchProviderAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.adminFetchUserOrProviderAddressUseCase.execute(providerId);
            res.status(200).json({ 
                success: true, 
                message: result
                    ? "Address fetched successfully"
                    : "Address not added yet",
                data: result 
            });
        } catch (error) {
            log.error("fetchProviderAddress failed", error as Error);
            next(error);
        }
    }

    async fetchProviderService(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.adminFetchProviderServiceUseCase.execute({ providerId });
            res.status(200).json(result);
        } catch (error) {
            log.error("fetchProviderService failed", error as Error);
            next(error);
        }
    }

    async fetchProviderServiceAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            const { date } = DateZodSchema.parse(req.query);
            if (!providerId || !date) throw new Error("Invalid request.");
            const result = await this.adminFetchProviderServiceAvailabilityUseCase.execute({ providerId, date: new Date(date) });
            res.status(200).json(result);
        } catch (error) {
            log.error("fetchProviderServiceAvailability failed", error as Error);
            next(error);
        }
    }

    async fetchProviderSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminFetchProviderSubscriptionsUseCase.execute({ providerId, page, limit });
            res.status(200).json(result);
        } catch (error) {
            log.error("fetchProviderSubscriptions failed", error as Error);
            next(error);
        }
    }

    async fetchProviderPayments(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.adminFetchProviderPaymentsUseCase.execute({ providerId, page, limit });
            res.status(200).json(result);
        } catch (error) {
            log.error("fetchProviderPayments failed", error as Error);
            next(error);
        }
    }

    async fetchProviderProofs(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.fetchProviderProofsUseCase.execute({ providerId });
            res.status(200).json(result);
        } catch (error) {
            log.error("fetchProviderProofs failed", error as Error);
            next(error);
        }
    }

}

export const adminProviderController = new AdminProviderController(
    adminProviderListUseCase,
    adminApproveProviderUseCase,
    adminRejectProviderUseCase,
    adminChangeProviderBlockStatusUseCase,
    adminChangeProviderTrustTagUseCase,
    adminFetchProviderDetailsUseCase,
    adminFetchUserOrProviderAddressUseCase,
    adminFetchProviderServiceUseCase,
    adminFetchProviderServiceAvailabilityUseCase,
    adminFetchProviderSubscriptionsUseCase,
    adminFetchProviderPaymentsUseCase,
    fetchProviderProofsUseCase
);

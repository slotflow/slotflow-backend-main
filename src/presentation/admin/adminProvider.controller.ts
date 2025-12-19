import { NextFunction, Request, Response } from "express";
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
import { IAdminProviderQuery } from "../../application/queries/admin/IAdminProviderQuery";
import { AdminProviderQueryImpl } from "../../infrastructure/queries/admin/adminProviderQuery.impl";

const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();
const addressRepository: IAddressRepository = new AddressRepositoryImpl();
const providerRepository: IProviderRepository = new ProviderRepositoryImpl();
const subscriptionRepository: ISubscriptionRepository = new SubscriptionRepositoryImpl();
const signedUrlCacheRepository: ISignedUrlCacheRepository = new SignedUrlCacheRepositoryImpl();
const providerServiceRepository: IProviderServiceRepository = new ProviderServiceRepositoryImpl();
const serviceAvailability: IServiceAvailabilityRepository = new ServiceAvailabilityRepositoryImpl();
const adminProviderQuery: IAdminProviderQuery = new AdminProviderQueryImpl();

const signedUrlService: ISignedUrlService = new SignedUrlService(signedUrlCacheRepository);

const adminProviderListUseCase = new AdminProviderListUseCase(adminProviderQuery);
const adminRejectProviderUseCase = new AdminRejectProviderUseCase(providerRepository);
const adminApproveProviderUseCase = new AdminApproveProviderUseCase(providerRepository);
const adminChangeProviderTrustTagUseCase = new AdminChangeProviderTrustTagUseCase(providerRepository);
const fetchProviderProofsUseCase = new FetchProviderProofsUseCase(signedUrlService, providerRepository);
const adminChangeProviderBlockStatusUseCase = new AdminChangeProviderBlockStatusUseCase(providerRepository);
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
            res.status(200).json(result);
        } catch (error) {
            next(error)
        }
    }

    async approveProvider(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.adminApproveProviderUseCase.execute({ providerId });
            res.status(200).json(result);
        } catch (error) {
            console.log("approveProvider error : ", error);
            next(error)
        }
    }

    async rejectProvider(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!providerId) throw new Error("Invalid request.");
            console.log("req.body : ",req.body);
            const validatedData = adminRejectProviderZodSchema.parse(req.body);
            const result = await this.adminRejectProviderUseCase.execute({
                providerId,
                ...validatedData
            });
            res.status(200).json(result);
        } catch (error) {
            console.log("rejectProvider error : ", error);
            next(error)
        }
    }

    async changeProviderBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus } = AdminChangeProviderStatusZodSchema.parse(req.body);
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!providerId || blockStatus === null) throw new Error("Invalid request.");
            const result = await this.adminChangeProviderBlockStatusUseCase.execute({ providerId, isBlocked: blockStatus });
            res.status(200).json(result);
        } catch (error) {
            console.log("changeProviderBlockStatus error : ", error);
            next(error)
        }
    }

    async changeProviderTrustedTag(req: Request, res: Response, next: NextFunction) {
        try {
            const { trustTag } = AdminChangeProviderTrustedTagZodSchema.parse(req.body);
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if (!providerId || trustTag === null || undefined) throw new Error("Invalid request.");
            const result = await this.adminChangeProviderTrustTagUseCase.execute({ providerId, trustedBySlotflow: trustTag });
            res.status(200).json(result);
        } catch (error) {
            console.log("changeProviderTrustedTag error : ", error);
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
            console.log("fetchProviderDetails error : ", error);
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
            console.log("fetchProviderAddress error : ", error);
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
            console.log("fetchProviderService error : ", error);
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
            console.log("fetchProviderServiceAvailability error : ", error);
            next(error)
        }
    }

    async fetchProviderSubscriptions(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminFetchProviderSubscriptionsUseCase.execute({ providerId, page, limit });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchProviderSubscriptions error : ", error);
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
            console.log("fetchProviderPayments error : ", error);
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
            console.log("fetchProviderProofs error : ", error);
            next(error);
        }
    }

}

const adminProviderController = new AdminProviderController(
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

export { adminProviderController };


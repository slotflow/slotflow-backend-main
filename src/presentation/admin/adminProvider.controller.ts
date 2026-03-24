import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { paginationSchema } from "../../shared/zod/base.zod";
import { fetchProviderServiceAvailabilitySchema } from "../../shared/zod/common.zod";
import { validateProviderIdSchema } from "../../shared/zod/provider.zod";
import { FetchProviderProofsUseCase } from "../../application/useCases/common/fetchProviderProofs.useCase";
import { AdminFetchUserOrProviderAddressUseCase } from "../../application/useCases/admin/adminAddress.useCase";
import { adminChangeProviderBlockStatusSchema, adminChangeProviderTrustTagSchema, adminRejectProviderSchema } from "../../shared/zod/admin.zod";
import { AdminApproveProviderUseCase, AdminChangeProviderBlockStatusUseCase, AdminChangeProviderTrustTagUseCase, AdminProviderListUseCase, AdminRejectProviderUseCase } from "../../application/useCases/admin/adminProvider.useCase";
import { AdminfetchProviderServiceAvailabilityUseCase, AdminFetchProviderServiceUseCase } from "../../application/useCases/admin/adminProviderProfile.useCase";
import { adminApproveProviderUseCase, adminChangeProviderBlockStatusUseCase, adminChangeProviderTrustTagUseCase, adminFetchProviderServiceAvailabilityUseCase, adminFetchProviderServiceUseCase, adminFetchUserOrProviderAddressUseCase, adminProviderListUseCase, adminRejectProviderUseCase, fetchProviderProofsUseCase } from ".";

class AdminProviderController {
    constructor(
        private adminProviderListUseCase: AdminProviderListUseCase,
        private adminApproveProviderUseCase: AdminApproveProviderUseCase,
        private adminRejectProviderUseCase: AdminRejectProviderUseCase,
        private adminChangeProviderBlockStatusUseCase: AdminChangeProviderBlockStatusUseCase,
        private adminChangeProviderTrustTagUseCase: AdminChangeProviderTrustTagUseCase,
        private adminFetchUserOrProviderAddressUseCase: AdminFetchUserOrProviderAddressUseCase,
        private adminFetchProviderServiceUseCase: AdminFetchProviderServiceUseCase,
        private adminFetchProviderServiceAvailabilityUseCase: AdminfetchProviderServiceAvailabilityUseCase,
        private fetchProviderProofsUseCase: FetchProviderProofsUseCase,
    ) {
        this.getAllProviders = this.getAllProviders.bind(this);
        this.approveProvider = this.approveProvider.bind(this);
        this.rejectProvider = this.rejectProvider.bind(this);
        this.changeProviderBlockStatus = this.changeProviderBlockStatus.bind(this);
        this.fetchProviderAddress = this.fetchProviderAddress.bind(this);
        this.fetchProviderService = this.fetchProviderService.bind(this);
        this.fetchProviderServiceAvailability = this.fetchProviderServiceAvailability.bind(this);
        this.changeProviderTrustedTag = this.changeProviderTrustedTag.bind(this);
        this.fetchProviderProofs = this.fetchProviderProofs.bind(this);
    };

    async getAllProviders(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, limit } = paginationSchema.parse(req.query);
            const result = await this.adminProviderListUseCase.execute({ page, limit });
            sendResponse(res,result);
        } catch (error) {
            log.error("getAllProviders failed",error as Error);
            next(error);
        };
    };

    async approveProvider(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({ providerId: req.params.providerId });
            await this.adminApproveProviderUseCase.execute({ providerId });
            sendResponse(res,null,"Successfully approved provider");
        } catch (error) {
            log.error("approveProvider failed", error as Error);
            next(error);
        };
    };

    async rejectProvider(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = adminRejectProviderSchema.parse({
                providerId: req.params.providerId,
                ...req.body
            });
            await this.adminRejectProviderUseCase.execute({
                ...validatedData
            });
            sendResponse(res,null,"Successfully rejected provider");
        } catch (error) {
            log.error("rejectProvider failed", error as Error);
            next(error);
        };
    };

    async changeProviderBlockStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { blockStatus, providerId } = adminChangeProviderBlockStatusSchema.parse({
                providerId: req.params.providerId,
                blockStatus: req.body.blockStatus
            });
            const result = await this.adminChangeProviderBlockStatusUseCase.execute({ providerId, isBlocked: blockStatus });
            sendResponse(res,result,`Successfully ${result.isBlocked ? "blocked" : "unblocked"} provider`);
        } catch (error) {
            log.error("changeProviderBlockStatus failed", error as Error);
            next(error);
        };
    };

    async changeProviderTrustedTag(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId, trustTag } = adminChangeProviderTrustTagSchema.parse({
                trustTag: req.body.trustTag,
                providerId: req.params.providerId
            });
            const result = await this.adminChangeProviderTrustTagUseCase.execute({ providerId, trustedBySlotflow: trustTag });
            sendResponse(res,result,`Successfully ${result.trustedBySlotflow ? "given" : "revoked"} provider trust tag`);
        } catch (error) {
            log.error("changeProviderTrustedTag failed", error as Error);
            next(error);
        };
    };

    async fetchProviderAddress(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({ providerId: req.params.providerId });
            const result = await this.adminFetchUserOrProviderAddressUseCase.execute({ userId: providerId });
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
        };
    };

    async fetchProviderService(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({ providerId: req.params.providerId });
            const result = await this.adminFetchProviderServiceUseCase.execute({ providerId });
            sendResponse(res,result);
        } catch (error) {
            log.error("fetchProviderService failed", error as Error);
            next(error);
        };
    };

    async fetchProviderServiceAvailability(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, providerId } = fetchProviderServiceAvailabilitySchema.parse({
                providerId: req.params.providerId,
                date: req.query.date
            });
            const result = await this.adminFetchProviderServiceAvailabilityUseCase.execute({ providerId, date: new Date(date) });
            res.status(200).json(result);
        } catch (error) {
            log.error("fetchProviderServiceAvailability failed", error as Error);
            next(error);
        };
    };

    async fetchProviderProofs(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({ providerId: req.params.providerId });
            const result = await this.fetchProviderProofsUseCase.execute({ providerId });
            res.status(200).json(result);
        } catch (error) {
            log.error("fetchProviderProofs failed", error as Error);
            next(error);
        };
    };

};

export const adminProviderController = new AdminProviderController(
    adminProviderListUseCase,
    adminApproveProviderUseCase,
    adminRejectProviderUseCase,
    adminChangeProviderBlockStatusUseCase,
    adminChangeProviderTrustTagUseCase,
    adminFetchUserOrProviderAddressUseCase,
    adminFetchProviderServiceUseCase,
    adminFetchProviderServiceAvailabilityUseCase,
    fetchProviderProofsUseCase
);

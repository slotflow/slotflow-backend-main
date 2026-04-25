import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { providerValidateUpdateFileSchema } from "../../shared/zod/provider.zod";
import { paginationSchema, validateProviderIdSchema } from "../../shared/zod/base.zod";
import { AdminProviderListUseCase } from "../../application/useCases/provider/getProviders.useCase";
import { GetProviderProofsUseCase } from "../../application/useCases/common/getProviderProofs.useCase";
import { AdminRejectProviderUseCase } from "../../application/useCases/provider/adminRejectProvider.useCase";
import { AdminApproveProviderUseCase } from "../../application/useCases/provider/adminApproveProvider.useCase";
import { ChangeProviderTrustTagUseCase } from "../../application/useCases/provider/changeProviderTrustTag.useCase";
import { UserGetProviderDetailsUseCase } from "../../application/useCases/provider/userGetProviderDetails.useCase";
import { AdminGetProviderDetailsUseCase } from "../../application/useCases/provider/adminGetProviderDetails.useCase";
import { ChangeProviderBlockStatusUseCase } from "../../application/useCases/provider/changeProviderBlockStatus.useCase";
import { adminChangeProviderBlockStatusSchema, adminChangeProviderTrustTagSchema, adminRejectProviderSchema } from "../../shared/zod/admin.zod";
import { ProvideDeleteIdentityProofUseCase, ProvideDeleteServiceProofUseCase, ProviderGetProfileDetailsUseCase, ProviderUpdateIdentityProofUseCase, ProviderRequestForApprovalUseCase, ProviderUpdateServiceProofUseCase } from "../../application/useCases/provider/providerProfile.useCase";
import { adminApproveProviderUseCase, changeProviderBlockStatusUseCase, changeProviderTrustTagUseCase, adminGetProviderDetailsUseCase, adminProviderListUseCase, adminRejectProviderUseCase, getProviderProofsUseCase, provideDeleteIdentityProofUseCase, provideDeleteServiceProofUseCase, providerGetProfileDetailsUseCase, providerRequestForApprovalUseCase, providerUpdateIdentityProofUseCase, providerUpdateServiceProofUseCase, userGetProviderDetailsUseCase } from ".";

class ProviderProfileController {
    constructor(
        private adminGetProviderDetailsUseCase: AdminGetProviderDetailsUseCase,
        private userGetProviderDetailsUseCase: UserGetProviderDetailsUseCase,
        private providerGetProfileDetailsUseCase: ProviderGetProfileDetailsUseCase,
        private providerUpdateIdentityProofUseCase: ProviderUpdateIdentityProofUseCase,
        private providerUpdateServiceProofUseCase: ProviderUpdateServiceProofUseCase,
        private getProviderProofsUseCase: GetProviderProofsUseCase,
        private providerRequestForApprovalUseCase: ProviderRequestForApprovalUseCase,
        private provideDeleteIdentityProofUseCase: ProvideDeleteIdentityProofUseCase,
        private provideDeleteServiceProofUseCase: ProvideDeleteServiceProofUseCase,
        private adminProviderListUseCase: AdminProviderListUseCase,
        private adminApproveProviderUseCase: AdminApproveProviderUseCase,
        private adminRejectProviderUseCase: AdminRejectProviderUseCase,
        private changeProviderBlockStatusUseCase: ChangeProviderBlockStatusUseCase,
        private changeProviderTrustTagUseCase: ChangeProviderTrustTagUseCase,
    ) {
        this.getProfileDetails = this.getProfileDetails.bind(this);
        this.updateIdentityProof = this.updateIdentityProof.bind(this);
        this.updateServiceProof = this.updateServiceProof.bind(this);
        this.getProofs = this.getProofs.bind(this);
        this.requestAdminApproval = this.requestAdminApproval.bind(this);
        this.deleteIdentityProof = this.deleteIdentityProof.bind(this);
        this.deleteServiceProof = this.deleteServiceProof.bind(this);

        this.getProviders = this.getProviders.bind(this);

        this.approveProvider = this.approveProvider.bind(this);
        this.rejectProvider = this.rejectProvider.bind(this);
        this.changeProviderBlockStatus = this.changeProviderBlockStatus.bind(this);
        this.changeProviderTrustedTag = this.changeProviderTrustedTag.bind(this);
    };

    async getProfileDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            let providerId: string;
            if (user.role === Role.PROVIDER) {
                providerId = user.id;
            } else {
                providerId = validateProviderIdSchema.parse(req.params).providerId;
            }

            if (user.role === Role.ADMIN) {
                const result = await this.adminGetProviderDetailsUseCase.execute({ providerId });
                return sendResponse(res, result);
            }

            if (user.role === Role.USER) {
                const result = await this.userGetProviderDetailsUseCase.execute({ providerId });
                return sendResponse(res, result);
            }

            if (user.role === Role.PROVIDER) {
                const result = await this.providerGetProfileDetailsUseCase.execute({ providerId });
                return sendResponse(res, result);
            }
        } catch (error) {
            log.error("getProfileDetails failed", error as Error);
            next(error);
        };
    };

    async updateIdentityProof(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const { s3FileKey } = providerValidateUpdateFileSchema.parse({
                ...req.body
            });
            const result = await this.providerUpdateIdentityProofUseCase.exeute({
                providerId: user.id,
                identityProof: s3FileKey
            });
            sendResponse(res, result, "Identity proof updated successfully");
        } catch (error) {
            log.error("updateProviderIdentityProof failed", error as Error);
            next(error);
        };
    };

    async updateServiceProof(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const { s3FileKey } = providerValidateUpdateFileSchema.parse({ ...req.body });
            const result = await this.providerUpdateServiceProofUseCase.exeute({
                providerId: user.id,
                serviceProof: s3FileKey
            });
            sendResponse(res, result, "Service proof updated successfully");
        } catch (error) {
            log.error("updateProviderServiceProof failed", error as Error);
            next(error);
        };
    };

    async getProofs(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            if (user.role === Role.ADMIN) {
                const { providerId } = validateProviderIdSchema.parse({ providerId: req.params.providerId });
                const result = await this.getProviderProofsUseCase.execute({ providerId });
                res.status(200).json(result);
            }

            if (user.role === Role.PROVIDER) {
                const result = await this.getProviderProofsUseCase.execute({ providerId: user.id });
                res.status(200).json(result);
            }
        } catch (error) {
            console.log("getProofs error : ", error);
            next(error);
        };
    };

    async requestAdminApproval(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            const result = await this.providerRequestForApprovalUseCase.execute({ providerId: user.id });
            sendResponse(res, result, "Requested admin approval");
        } catch (error) {
            log.error("updateAdminVerificationStatus failed", error as Error);
            next(error);
        };
    };

    async deleteIdentityProof(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            await this.provideDeleteIdentityProofUseCase.execute({ providerId: user.id });
            sendResponse(res, null, "Identity proof deleted successfully");
        } catch (error) {
            log.error("deleteIdentityProof failed", error as Error);
            next(error);
        };
    };

    async deleteServiceProof(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            await this.provideDeleteServiceProofUseCase.execute({ providerId: user.id });
            sendResponse(res, null, "Service proof deleted successfully");
        } catch (error) {
            log.error("deleteServiceProof failed", error as Error);
            next(error);
        };
    };

    async getProviders(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser;
            if (user.role === Role.ADMIN) {
                const { page, limit } = paginationSchema.parse(req.query);
                const result = await this.adminProviderListUseCase.execute({ page, limit });
                sendResponse(res, result);
            }
        } catch (error) {
            log.error("getProviders failed", error as Error);
            next(error);
        };
    };

    async approveProvider(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({ providerId: req.params.providerId });
            await this.adminApproveProviderUseCase.execute({ providerId });
            sendResponse(res, null, "Successfully approved provider");
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
            sendResponse(res, null, "Successfully rejected provider");
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
            const result = await this.changeProviderBlockStatusUseCase.execute({ providerId, isBlocked: blockStatus });
            sendResponse(res, result, `Successfully ${result.isBlocked ? "blocked" : "unblocked"} provider`);
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
            const result = await this.changeProviderTrustTagUseCase.execute({ providerId, trustedBySlotflow: trustTag });
            sendResponse(res, result, `Successfully ${result.trustedBySlotflow ? "given" : "revoked"} provider trust tag`);
        } catch (error) {
            log.error("changeProviderTrustedTag failed", error as Error);
            next(error);
        };
    };
};

export const providerProfileController = new ProviderProfileController(
    adminGetProviderDetailsUseCase,
    userGetProviderDetailsUseCase,
    providerGetProfileDetailsUseCase,
    providerUpdateIdentityProofUseCase,
    providerUpdateServiceProofUseCase,
    getProviderProofsUseCase,
    providerRequestForApprovalUseCase,
    provideDeleteIdentityProofUseCase,
    provideDeleteServiceProofUseCase,
    adminProviderListUseCase,
    adminApproveProviderUseCase,
    adminRejectProviderUseCase,
    changeProviderBlockStatusUseCase,
    changeProviderTrustTagUseCase,
);
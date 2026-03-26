import { log } from "../../shared/logger/logger";
import { Role } from "../../domain/enums/common.enum";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { paginationSchema } from "../../shared/zod/base.zod";
import { DecodedUser } from "../../application/dtos/common.dto";
import { userFetchAllProvidersSchema } from "../../shared/zod/user.zod";
import { AdminProviderListUseCase } from "../../application/useCases/provider/getProviders.useCase";
import { FetchProviderProofsUseCase } from "../../application/useCases/common/fetchProviderProofs.useCase";
import { GetProvidersForChatUseCase } from "../../application/useCases/provider/getProvidersForChat.useCase";
import { AdminRejectProviderUseCase } from "../../application/useCases/provider/adminRejectProvider.useCase";
import { GetProvidersByFilterUseCase } from "../../application/useCases/provider/getProvidersByFilter.useCase";
import { AdminApproveProviderUseCase } from "../../application/useCases/provider/adminApproveProvider.useCase";
import { ChangeProviderTrustTagUseCase } from "../../application/useCases/provider/changeProviderTrustTag.useCase";
import { UserFetchProviderDetailsUseCase } from "../../application/useCases/provider/userFetchProviderDetails.useCase";
import { AdminFetchProviderDetailsUseCase } from "../../application/useCases/provider/adminFetchProviderDetails.useCase";
import { ChangeProviderBlockStatusUseCase } from "../../application/useCases/provider/changeProviderBlockStatus.useCase";
import { adminChangeProviderBlockStatusSchema, adminChangeProviderTrustTagSchema, adminRejectProviderSchema } from "../../shared/zod/admin.zod";
import { providerValidateUpdateInfoSchema, providerValidateUpdateFileSchema, validateProviderIdSchema, providerUpdatePushNotificationSchema } from "../../shared/zod/provider.zod";
import { ProvideDeleteIdentityProofUseCase, ProvideDeleteServiceProofUseCase, ProviderFetchProfileDetailsUseCase, ProviderUpdateIdentityProofUseCase, ProviderRequestForApprovalUseCase, ProviderUpdateServiceProofUseCase, ProviderUpdateProfileImageUseCase, ProviderUpdateProviderInfoUseCase, ProviderUpdatePushNotificationUseCase } from "../../application/useCases/provider/providerProfile.useCase";
import { adminApproveProviderUseCase, changeProviderBlockStatusUseCase, changeProviderTrustTagUseCase, adminFetchProviderDetailsUseCase, adminProviderListUseCase, adminRejectProviderUseCase, fetchProviderProofsUseCase, provideDeleteIdentityProofUseCase, provideDeleteServiceProofUseCase, providerFetchProfileDetailsUseCase, providerRequestForApprovalUseCase, providerUpdateIdentityProofUseCase, providerUpdateProfileImageUseCase, providerUpdateProviderInfoUseCase, providerUpdatePushNotificationUseCase, providerUpdateServiceProofUseCase, userFetchProviderDetailsUseCase, getProvidersByFilterUseCase, getProvidersForChatUseCase } from ".";

class ProviderProfileController {
    constructor(
        private adminFetchProviderDetailsUseCase: AdminFetchProviderDetailsUseCase,
        private userFetchProviderDetailsUseCase: UserFetchProviderDetailsUseCase,
        private providerFetchProfileDetailsUseCase: ProviderFetchProfileDetailsUseCase,
        private providerUpdateProfileImageUseCase: ProviderUpdateProfileImageUseCase,
        private providerUpdateProviderInfoUseCase: ProviderUpdateProviderInfoUseCase,
        private providerUpdateIdentityProofUseCase: ProviderUpdateIdentityProofUseCase,
        private providerUpdateServiceProofUseCase: ProviderUpdateServiceProofUseCase,
        private fetchProviderProofsUseCase: FetchProviderProofsUseCase,
        private providerRequestForApprovalUseCase: ProviderRequestForApprovalUseCase,
        private provideDeleteIdentityProofUseCase: ProvideDeleteIdentityProofUseCase,
        private provideDeleteServiceProofUseCase: ProvideDeleteServiceProofUseCase,
        private providerUpdatePushNotificationUseCase: ProviderUpdatePushNotificationUseCase,
        private adminProviderListUseCase: AdminProviderListUseCase,
        private getProvidersByFilterUseCase: GetProvidersByFilterUseCase,
        private getProvidersForChatUseCase: GetProvidersForChatUseCase,
        private adminApproveProviderUseCase: AdminApproveProviderUseCase,
        private adminRejectProviderUseCase: AdminRejectProviderUseCase,
        private changeProviderBlockStatusUseCase: ChangeProviderBlockStatusUseCase,
        private changeProviderTrustTagUseCase: ChangeProviderTrustTagUseCase,
    ) {
        this.getProfileDetails = this.getProfileDetails.bind(this);
        this.updateProfileImage = this.updateProfileImage.bind(this);
        this.updateInfo = this.updateInfo.bind(this);
        this.updateIdentityProof = this.updateIdentityProof.bind(this);
        this.updateServiceProof = this.updateServiceProof.bind(this);
        this.getProofs = this.getProofs.bind(this);
        this.requestAdminApproval = this.requestAdminApproval.bind(this);
        this.deleteIdentityProof = this.deleteIdentityProof.bind(this);
        this.deleteServiceProof = this.deleteServiceProof.bind(this);
        this.updatePushNotification = this.updatePushNotification.bind(this);
        this.getProviders = this.getProviders.bind(this);
        this.getProvidersForChat = this.getProvidersForChat.bind(this);

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
                providerId = user.userOrProviderId;
            } else {
                providerId = req.params.providerId as string;
                if (!providerId) {
                    throw new Error("Provider ID is required");
                }
            }

            if (user.role === Role.ADMIN) {
                const result = await this.adminFetchProviderDetailsUseCase.execute({ providerId });
                return sendResponse(res, result);
            }

            if (user.role === Role.USER) {
                const result = await this.userFetchProviderDetailsUseCase.execute({ providerId });
                return sendResponse(res, result);
            }

            if (user.role === Role.PROVIDER) {
                const result = await this.providerFetchProfileDetailsUseCase.execute({ providerId });
                return sendResponse(res, result);
            }

        } catch (error) {
            log.error("getProfileDetails failed", error as Error);
            next(error);
        };
    };

    async updateProfileImage(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId, s3FileKey } = providerValidateUpdateFileSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                ...req.body
            });
            const result = await this.providerUpdateProfileImageUseCase.execute({
                providerId,
                profileImage: s3FileKey
            });
            sendResponse(res, result, "Profile image updated successfully");
        } catch (error) {
            log.error("updateProfileImage failed", error as Error);
            next(error);
        };
    };

    async updateInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const { phone, providerId, username } = providerValidateUpdateInfoSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                ...req.body,
            });
            const result = await this.providerUpdateProviderInfoUseCase.execute({
                providerId,
                username,
                phone
            })
            sendResponse(res, result, "Info updated successfully");
        } catch (error) {
            log.error("updateProviderInfo failed", error as Error);
            next(error);
        };
    };

    async updateIdentityProof(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId, s3FileKey } = providerValidateUpdateFileSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                ...req.body
            });
            const result = await this.providerUpdateIdentityProofUseCase.exeute({
                providerId,
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
            const { providerId, s3FileKey } = providerValidateUpdateFileSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                ...req.body
            });
            const result = await this.providerUpdateServiceProofUseCase.exeute({
                providerId,
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
                const result = await this.fetchProviderProofsUseCase.execute({ providerId });
                res.status(200).json(result);
            }

            if (user.role === Role.PROVIDER) {
                const result = await this.fetchProviderProofsUseCase.execute({ providerId: user.userOrProviderId });
                res.status(200).json(result);
            }
        } catch (error) {
            console.log("fetchProviderProofs error : ", error);
            next(error);
        };
    };

    async requestAdminApproval(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId
            });
            const result = await this.providerRequestForApprovalUseCase.execute({ providerId });
            sendResponse(res, result, "Requested admin approval");
        } catch (error) {
            log.error("updateAdminVerificationStatus failed", error as Error);
            next(error);
        };
    };

    async deleteIdentityProof(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse((req.user as DecodedUser).userOrProviderId);
            await this.provideDeleteIdentityProofUseCase.execute({ providerId });
            sendResponse(res, null, "Identity proof deleted successfully");
        } catch (error) {
            log.error("deleteIdentityProof failed", error as Error);
            next(error);
        };
    };

    async deleteServiceProof(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse((req.user as DecodedUser).userOrProviderId);
            await this.provideDeleteServiceProofUseCase.execute({ providerId });
            sendResponse(res, null, "Service proof deleted successfully");
        } catch (error) {
            log.error("deleteServiceProof failed", error as Error);
            next(error);
        };
    };

    async updatePushNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const { allowPushNotification, providerId } = providerUpdatePushNotificationSchema.parse({
                providerId: (req.user as DecodedUser).userOrProviderId,
                ...req.body
            });
            const result = await this.providerUpdatePushNotificationUseCase.execute({ providerId, allowPushNotification });
            sendResponse(res, result, "Push notification updated successfully");
        } catch (error) {
            log.error("updatePushNotification failed", error as Error);
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

            if (user.role === Role.USER) {
                const validatedData = userFetchAllProvidersSchema.parse(req.query);
                const { categories, location, maxPrice, minPrice, slotflowTrusted, appServiceIds, skip, limit } = validatedData;
                let serviceIds: string[] = [];
                if (appServiceIds) {
                    const servicesArray = Array.isArray(appServiceIds)
                        ? appServiceIds
                        : appServiceIds.split(",");

                    serviceIds = servicesArray.map(id => id);
                };
                const result = await this.getProvidersByFilterUseCase.execute({ serviceIds, categories, location, maxPrice, minPrice, slotflowTrusted, skip, limit });
                sendResponse(res, result);
            }

        } catch (error) {
            log.error("fetchServiceProviders failed", error as Error);
            next(error);
        };
    };

    async getProvidersForChat(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as DecodedUser
            const result = await this.getProvidersForChatUseCase.execute({ userId: user.userOrProviderId });
            sendResponse(res, result);
        } catch (error) {
            log.error("getProvidersForChat failed", error as Error);
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
    adminFetchProviderDetailsUseCase,
    userFetchProviderDetailsUseCase,
    providerFetchProfileDetailsUseCase,
    providerUpdateProfileImageUseCase,
    providerUpdateProviderInfoUseCase,
    providerUpdateIdentityProofUseCase,
    providerUpdateServiceProofUseCase,
    fetchProviderProofsUseCase,
    providerRequestForApprovalUseCase,
    provideDeleteIdentityProofUseCase,
    provideDeleteServiceProofUseCase,
    providerUpdatePushNotificationUseCase,
    adminProviderListUseCase,
    getProvidersByFilterUseCase,
    getProvidersForChatUseCase,
    adminApproveProviderUseCase,
    adminRejectProviderUseCase,
    changeProviderBlockStatusUseCase,
    changeProviderTrustTagUseCase,
);
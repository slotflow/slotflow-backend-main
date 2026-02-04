import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { DecodedUser } from "../../application/dtos/common.dto";
import { FetchProviderProofsUseCase } from "../../application/useCases/common/fetchProviderProofs.useCase";
import { providerValidateUpdateInfoSchema, providerValidateUpdateFileSchema, validateProviderIdSchema, providerUpdatePushNotificationSchema } from "../../shared/zod/provider.zod";
import { fetchProviderProofsUseCase, provideDeleteIdentityProofUseCase, provideDeleteServiceProofUseCase, providerFetchProfileDetailsUseCase, providerRequestForApprovalUseCase, providerUpdateIdentityProofUseCase, providerUpdateProfileImageUseCase, providerUpdateProviderInfoUseCase, providerUpdatePushNotificationUseCase, providerUpdateServiceProofUseCase } from ".";
import { ProvideDeleteIdentityProofUseCase, ProvideDeleteServiceProofUseCase, ProviderFetchProfileDetailsUseCase, ProviderUpdateIdentityProofUseCase, ProviderRequestForApprovalUseCase, ProviderUpdateServiceProofUseCase, ProviderUpdateProfileImageUseCase, ProviderUpdateProviderInfoUseCase, ProviderUpdatePushNotificationUseCase } from "../../application/useCases/provider/providerProfile.useCase";

class ProviderProfileController {
    constructor(
        private providerFetchProfileDetailsUseCase: ProviderFetchProfileDetailsUseCase,
        private providerUpdateProfileImageUseCase: ProviderUpdateProfileImageUseCase,
        private providerUpdateProviderInfoUseCase: ProviderUpdateProviderInfoUseCase,
        private providerUpdateIdentityProofUseCase: ProviderUpdateIdentityProofUseCase,
        private providerUpdateServiceProofUseCase: ProviderUpdateServiceProofUseCase,
        private fetchProviderProofsUseCase: FetchProviderProofsUseCase,
        private providerRequestForApprovalUseCase: ProviderRequestForApprovalUseCase,
        private provideDeleteIdentityProofUseCase: ProvideDeleteIdentityProofUseCase,
        private provideDeleteServiceProofUseCase: ProvideDeleteServiceProofUseCase,
        private providerUpdatePushNotificationUseCase: ProviderUpdatePushNotificationUseCase
    ) {
        this.getProfileDetails = this.getProfileDetails.bind(this);
        this.updateProfileImage = this.updateProfileImage.bind(this);
        this.updateInfo = this.updateInfo.bind(this);
        this.updateIdentityProof = this.updateIdentityProof.bind(this);
        this.updateServiceProof = this.updateServiceProof.bind(this);
        this.fetchProofs = this.fetchProofs.bind(this);
        this.requestAdminApproval = this.requestAdminApproval.bind(this);
        this.deleteIdentityProof = this.deleteIdentityProof.bind(this);
        this.deleteServiceProof = this.deleteServiceProof.bind(this);
        this.updatePushNotification = this.updatePushNotification.bind(this);
    };

    async getProfileDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse((req.user as DecodedUser).userOrProviderId)
            const result = await this.providerFetchProfileDetailsUseCase.execute({ providerId });
            sendResponse(res, result);
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

    async fetchProofs(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse((req.user as DecodedUser).userOrProviderId);
            const result = await this.fetchProviderProofsUseCase.execute({ providerId });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchProviderProofs error : ", error);
            next(error);
        };
    };

    async requestAdminApproval(req: Request, res: Response, next: NextFunction) {
        try {
            const { providerId } = validateProviderIdSchema.parse((req.user as DecodedUser).userOrProviderId);
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

};

export const providerProfileController = new ProviderProfileController(
    providerFetchProfileDetailsUseCase,
    providerUpdateProfileImageUseCase,
    providerUpdateProviderInfoUseCase,
    providerUpdateIdentityProofUseCase,
    providerUpdateServiceProofUseCase,
    fetchProviderProofsUseCase,
    providerRequestForApprovalUseCase,
    provideDeleteIdentityProofUseCase,
    provideDeleteServiceProofUseCase,
    providerUpdatePushNotificationUseCase
);
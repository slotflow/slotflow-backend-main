import { DecodedUser } from "../../express";
import { s3Client } from "../../infrastructure/lib/aws_s3";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { SignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { s3FileKeyZodSchmema, UserOrProviderUpdateInfoZodSchema } from "../../shared/zod/common.zod";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { FetchProviderProofsUseCase } from "../../application/useCases/common/fetchProviderProofs.useCase";
import { ProvideDeleteIdentityProofUseCase, ProvideDeleteServiceProofUseCase, ProviderFetchProfileDetailsUseCase, ProviderUpdateIdentityProofUseCase, ProviderRequestForApprovalUseCase, ProviderUpdateServiceProofUseCase, ProviderUpdateProfileImageUseCase, ProviderUpdateProviderInfoUseCase } from "../../application/useCases/provier/providerProfile.useCase";

const providerRepository: IProviderRepository = new ProviderRepositoryImpl();

const signedUrlService: ISignedUrlService = new SignedUrlService();

const providerUpdateProviderInfoUseCase = new ProviderUpdateProviderInfoUseCase(providerRepository);
const providerRequestForApprovalUseCase = new ProviderRequestForApprovalUseCase(providerRepository);
const providerFetchProfileDetailsUseCase = new ProviderFetchProfileDetailsUseCase(providerRepository);
const fetchProviderProofsUseCase = new FetchProviderProofsUseCase(signedUrlService, providerRepository);
const providerUpdateProfileImageUseCase = new ProviderUpdateProfileImageUseCase(s3Client, providerRepository);
const providerUpdateServiceProofUseCase = new ProviderUpdateServiceProofUseCase(s3Client, providerRepository);
const providerUpdateIdentityProofUseCase = new ProviderUpdateIdentityProofUseCase(s3Client, providerRepository);
const provideDeleteIdentityProofUseCase = new ProvideDeleteIdentityProofUseCase(s3Client, providerRepository);
const provideDeleteServiceProofUseCase = new ProvideDeleteServiceProofUseCase(s3Client, providerRepository);

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
    };

    async getProfileDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.providerFetchProfileDetailsUseCase.execute({providerId});
            sendResponse(res, result);
        } catch (error) {
            log.error("getProfileDetails failed", error as Error);
            next(error);
        };
    };

    async updateProfileImage(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const validatedData = s3FileKeyZodSchmema.parse(req.body);
            const result = await this.providerUpdateProfileImageUseCase.execute({
                providerId,
                profileImage: validatedData.s3FileKey
            });
            sendResponse(res, result, "Profile image updated successfully");
        } catch (error) {
            log.error("updateProfileImage failed", error as Error);
            next(error);
        };
    };

    async updateInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { username, phone } = UserOrProviderUpdateInfoZodSchema.parse(req.body);
            if (!providerId || !username || !phone) throw new Error("Invalid request");
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
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const validatedData = s3FileKeyZodSchmema.parse(req.body);
            const result = await this.providerUpdateIdentityProofUseCase.exeute({
                providerId,
                identityProof: validatedData.s3FileKey
            });
            sendResponse(res, result, "Identity proof updated successfully");
        } catch (error) {
            log.error("updateProviderIdentityProof failed", error as Error);
            next(error);
        };
    };

    async updateServiceProof(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const validatedData = s3FileKeyZodSchmema.parse(req.body);
            const result = await this.providerUpdateServiceProofUseCase.exeute({
                providerId,
                serviceProof: validatedData.s3FileKey
            });
            sendResponse(res, result, "Service proof updated successfully");
        } catch (error) {
            log.error("updateProviderServiceProof failed", error as Error);
            next(error);
        };
    };

    async fetchProofs(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.fetchProviderProofsUseCase.execute({providerId});
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchProviderProofs error : ", error);
            next(error);
        };
    };

    async requestAdminApproval(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.providerRequestForApprovalUseCase.execute({providerId});
            sendResponse(res,result, "Request admin approval");
        } catch (error) {
            log.error("updateAdminVerificationStatus failed", error as Error);
            next(error);
        };
    };

    async deleteIdentityProof(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            await this.provideDeleteIdentityProofUseCase.execute({providerId});
            sendResponse(res, null, "Identity proof deleted successfully");
        } catch (error) {
            log.error("deleteIdentityProof failed", error as Error);
            next(error);
        };
    };

    async deleteServiceProof(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.provideDeleteServiceProofUseCase.execute({providerId});
            sendResponse(res, null, "Service proof deleted successfully");
        } catch (error) {
            log.error("deleteServiceProof failed", error as Error);
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
    provideDeleteServiceProofUseCase
);
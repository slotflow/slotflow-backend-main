import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { s3Client } from "../../config/aws_s3";
import { NextFunction, Request, Response } from "express";
import { SignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { IProviderRepository } from "../../domain/interfaces/repositories/IProvider.repository";
import { s3FileKeyZodSchmema, UserOrProviderUpdateInfoZodSchema } from "../../shared/zod/common.zod";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { FetchProviderProofsUseCase } from "../../application/useCases/common/fetchProviderProofs.useCase";
import { ISignedUrlCacheRepository } from "../../domain/interfaces/repositories/ISignedUrlCache.repository";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";
import { ProvideDeleteIdentityProofUseCase, ProvideDeleteServiceProofUseCase, ProviderFetchProfileDetailsUseCase, ProviderIdentityProofUpdateUseCase, ProviderRequestForApprovalUseCase, ProviderServiceProofUpdateUseCase, ProviderUpdateProfileImageUseCase, ProviderUpdateProviderInfoUseCase } from "../../application/useCases/provier/providerProfile.useCase";

const providerRepository: IProviderRepository = new ProviderRepositoryImpl();
const signedUrlCacheRepository: ISignedUrlCacheRepository = new SignedUrlCacheRepositoryImpl();

const signedUrlService: ISignedUrlService = new SignedUrlService(signedUrlCacheRepository);

const providerUpdateProviderInfoUseCase = new ProviderUpdateProviderInfoUseCase(providerRepository);
const providerRequestForApprovalUseCase = new ProviderRequestForApprovalUseCase(providerRepository);
const providerFetchProfileDetailsUseCase = new ProviderFetchProfileDetailsUseCase(providerRepository);
const fetchProviderProofsUseCase = new FetchProviderProofsUseCase(signedUrlService, providerRepository);
const providerUpdateProfileImageUseCase = new ProviderUpdateProfileImageUseCase(s3Client, providerRepository, signedUrlCacheRepository);
const providerServiceProofUpdateUseCase = new ProviderServiceProofUpdateUseCase(s3Client, providerRepository, signedUrlCacheRepository);
const providerIdentityProofUpdateUseCase = new ProviderIdentityProofUpdateUseCase(s3Client, providerRepository, signedUrlCacheRepository);
const provideDeleteIdentityProofUseCase = new ProvideDeleteIdentityProofUseCase(s3Client, providerRepository, signedUrlCacheRepository);
const provideDeleteServiceProofUseCase = new ProvideDeleteServiceProofUseCase(s3Client, providerRepository, signedUrlCacheRepository);

class ProviderProfileController {
    constructor(
        private providerFetchProfileDetailsUseCase: ProviderFetchProfileDetailsUseCase,
        private providerUpdateProfileImageUseCase: ProviderUpdateProfileImageUseCase,
        private providerUpdateProviderInfoUseCase: ProviderUpdateProviderInfoUseCase,
        private providerIdentityProofUpdateUseCase: ProviderIdentityProofUpdateUseCase,
        private providerServiceProofUpdateUseCase: ProviderServiceProofUpdateUseCase,
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
    }

    async getProfileDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if (!providerId) throw new Error("Invalid request.");
            const result = await this.providerFetchProfileDetailsUseCase.execute({ providerId: new Types.ObjectId(providerId) });
            res.status(200).json(result);
        } catch (error) {
            console.log("getProfileDetails error : ", error);
            next(error);
        }
    }

    async updateProfileImage(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const validatedData = s3FileKeyZodSchmema.parse(req.body);
            const result = await this.providerUpdateProfileImageUseCase.execute({
                providerId: new Types.ObjectId(providerId),
                profileImage: validatedData.s3FileKey
            });
            res.status(200).json(result);
        } catch (error) {
            console.log("updateProfileImage error : ", error);
            next(error);
        }
    }

    async updateInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { username, phone } = UserOrProviderUpdateInfoZodSchema.parse(req.body);
            if (!providerId || !username || !phone) throw new Error("Invalid request");
            const result = await this.providerUpdateProviderInfoUseCase.execute({
                providerId: new Types.ObjectId(providerId),
                username,
                phone
            })
            res.status(200).json(result)
        } catch (error) {
            console.log("updateProviderInfo error : ", error);
            next(error);
        }
    }

    async updateIdentityProof(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const validatedData = s3FileKeyZodSchmema.parse(req.body);
            const result = await this.providerIdentityProofUpdateUseCase.exeute({
                providerId: new Types.ObjectId(providerId),
                identityProof: validatedData.s3FileKey
            });
            res.status(200).json(result)
        } catch (error) {
            console.log("updateProviderIdentityProof error : ", error);
            next(error);
        }
    }

    async updateServiceProof(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const validatedData = s3FileKeyZodSchmema.parse(req.body);
            const result = await this.providerServiceProofUpdateUseCase.exeute({
                providerId: new Types.ObjectId(providerId),
                serviceProof: validatedData.s3FileKey
            });
            res.status(200).json(result)
        } catch (error) {
            console.log("updateProviderServiceProof error : ", error);
            next(error);
        }
    }

    async fetchProofs(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.fetchProviderProofsUseCase.execute({
                providerId: new Types.ObjectId(providerId)
            });
            res.status(200).json(result);
        } catch (error) {
            console.log("fetchProviderProofs error : ", error);
            next(error);
        }
    }

    async requestAdminApproval(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.providerRequestForApprovalUseCase.execute({
                providerId: new Types.ObjectId(providerId)
            });
            res.status(200).json(result);
        } catch (error) {
            console.log("updateAdminVerificationStatus error : ", error);
            next(error);
        }
    }

    async deleteIdentityProof(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.provideDeleteIdentityProofUseCase.execute({
                providerId: new Types.ObjectId(providerId)
            })
            res.status(200).json(result);
        } catch (error) {
            console.log("deleteIdentityProof error : ", error);
            next(error);
        }
    }

    async deleteServiceProof(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const result = await this.provideDeleteServiceProofUseCase.execute({
                providerId: new Types.ObjectId(providerId)
            })
            res.status(200).json(result);
        } catch (error) {
            console.log("deleteServiceProof error : ", error);
            next(error);
        }
    }

}

const providerProfileController = new ProviderProfileController(
    providerFetchProfileDetailsUseCase,
    providerUpdateProfileImageUseCase,
    providerUpdateProviderInfoUseCase,
    providerIdentityProofUpdateUseCase,
    providerServiceProofUpdateUseCase,
    fetchProviderProofsUseCase,
    providerRequestForApprovalUseCase,
    provideDeleteIdentityProofUseCase,
    provideDeleteServiceProofUseCase
);

export { providerProfileController };
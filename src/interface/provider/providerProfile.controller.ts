import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { s3Client } from "../../config/aws_s3";
import { NextFunction, Request, Response } from "express";
import { s3FileKeyZodSchmema, UserOrProviderUpdateInfoZodSchema } from "../../infrastructure/zod/common.zod";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";
import { ProviderFetchProfileDetailsUseCase, ProviderIdentityProofUpdateUseCase, ProviderServiceProofUpdateUseCase, ProviderUpdateProfileImageUseCase, ProviderUpdateProviderInfoUseCase } from "../../application/provider-use.case/providerProfile.use-case";

const providerRepositoryImpl = new ProviderRepositoryImpl();
const signedUrlCacheRepositoryImpl = new SignedUrlCacheRepositoryImpl();

const providerUpdateProviderInfoUseCase = new ProviderUpdateProviderInfoUseCase(providerRepositoryImpl);
const providerFetchProfileDetailsUseCase = new ProviderFetchProfileDetailsUseCase(providerRepositoryImpl);
const providerUpdateProfileImageUseCase = new ProviderUpdateProfileImageUseCase(s3Client, providerRepositoryImpl, signedUrlCacheRepositoryImpl);
const providerIdentityProofUpdateUseCase = new ProviderIdentityProofUpdateUseCase(s3Client, providerRepositoryImpl, signedUrlCacheRepositoryImpl);
const providerServiceProofUpdateUseCase = new ProviderServiceProofUpdateUseCase(s3Client, providerRepositoryImpl, signedUrlCacheRepositoryImpl);

class ProviderProfileController {
    constructor(
        private providerFetchProfileDetailsUseCase: ProviderFetchProfileDetailsUseCase,
        private providerUpdateProfileImageUseCase: ProviderUpdateProfileImageUseCase,
        private providerUpdateProviderInfoUseCase: ProviderUpdateProviderInfoUseCase,
        private providerIdentityProofUpdateUseCase: ProviderIdentityProofUpdateUseCase,
        private providerServiceProofUpdateUseCase: ProviderServiceProofUpdateUseCase,
    ) {
        this.getProfileDetails = this.getProfileDetails.bind(this);
        this.updateProfileImage = this.updateProfileImage.bind(this);
        this.updateProviderInfo = this.updateProviderInfo.bind(this);
        this.updateProviderIdentityProof = this.updateProviderIdentityProof.bind(this);
        this.updateProviderServiceProof = this.updateProviderServiceProof.bind(this);
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

    async updateProviderInfo(req: Request, res: Response, next: NextFunction) {
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

    async updateProviderIdentityProof(req: Request, res: Response, next: NextFunction) {
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

    async updateProviderServiceProof(req: Request, res: Response, next: NextFunction) {
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

}

const providerProfileController = new ProviderProfileController(
    providerFetchProfileDetailsUseCase,
    providerUpdateProfileImageUseCase,
    providerUpdateProviderInfoUseCase,
    providerIdentityProofUpdateUseCase,
    providerServiceProofUpdateUseCase
);

export { providerProfileController };
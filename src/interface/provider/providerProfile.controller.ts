import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { s3Client } from "../../config/aws_s3";
import { NextFunction, Request, Response } from "express";
import { UserOrProviderUpdateInfoZodSchema } from "../../infrastructure/zod/common.zod";
import { GenerateSignedUrlService } from "../../infrastructure/services/signedUrl.service";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";
import { ProviderFetchProfileDetailsUseCase, ProviderUpdateProfileImageUseCase, ProviderUpdateProviderInfoUseCase } from "../../application/provider-use.case/providerProfile.use-case";

const providerRepositoryImpl = new ProviderRepositoryImpl();
const signedUrlCacheRepositoryImpl = new SignedUrlCacheRepositoryImpl();
const generateSignedUrlService = new GenerateSignedUrlService(signedUrlCacheRepositoryImpl);

const providerUpdateProviderInfoUseCase = new ProviderUpdateProviderInfoUseCase(providerRepositoryImpl);
const providerFetchProfileDetailsUseCase = new ProviderFetchProfileDetailsUseCase(providerRepositoryImpl);
const providerUpdateProfileImageUseCase = new ProviderUpdateProfileImageUseCase(providerRepositoryImpl,s3Client, generateSignedUrlService);

class ProviderProfileController {
    constructor(
        private providerFetchProfileDetailsUseCase: ProviderFetchProfileDetailsUseCase,
        private providerUpdateProfileImageUseCase: ProviderUpdateProfileImageUseCase,
        private providerUpdateProviderInfoUseCase: ProviderUpdateProviderInfoUseCase,
    ) {
        this.getProfileDetails = this.getProfileDetails.bind(this);
        this.updateProfileImage = this.updateProfileImage.bind(this);
        this.updateProviderInfo = this.updateProviderInfo.bind(this);
    }

    async getProfileDetails(req: Request, res: Response, next: NextFunction) {
        try{
            const providerId = (req.user as DecodedUser).userOrProviderId;
            if(!providerId) throw new Error("Invalid request.");
            const result = await this.providerFetchProfileDetailsUseCase.execute({providerId: new Types.ObjectId(providerId)});
            res.status(200).json(result);
        }catch(error){
            console.log("getProfileDetails error : ",error);
            next(error);
        }
    }

    async updateProfileImage(req: Request, res: Response, next: NextFunction) {
        try{
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const file = req.file;
            if(!providerId || !file) throw new Error("Invalid request.");
            const result = await this.providerUpdateProfileImageUseCase.execute({providerId: new Types.ObjectId(providerId), file});
            res.status(200).json(result);
        }catch(error){
            console.log("updateProfileImage error : ",error);
            next(error);
        }
    }

    async updateProviderInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const providerId = (req.user as DecodedUser).userOrProviderId;
            const { username, phone } = UserOrProviderUpdateInfoZodSchema.parse(req.body);
            if(!providerId || !username || !phone) throw new Error("Invalid request");
            const result = await this.providerUpdateProviderInfoUseCase.execute({
                 providerId: new Types.ObjectId(providerId),
                 username,
                 phone
                })
            res.status(200).json(result)
        } catch(error){ 
           console.log("updateProviderInfo error : ",error);
            next(error);
        }
    }
}

const providerProfileController = new ProviderProfileController( 
    providerFetchProfileDetailsUseCase, 
    providerUpdateProfileImageUseCase,
    providerUpdateProviderInfoUseCase
);

export { providerProfileController };
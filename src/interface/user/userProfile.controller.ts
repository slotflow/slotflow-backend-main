import { Types } from "mongoose";
import { DecodedUser } from "../../express";
import { s3Client } from "../../config/aws_s3";
import { NextFunction, Request, Response } from "express";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { s3FileKeyZodSchmema, UserOrProviderUpdateInfoZodSchema } from "../../shared/zod/common.zod";
import { SignedUrlCacheRepositoryImpl } from "../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl";
import { UserFetchProfileDetailsUseCase, UserUpdateProfileImageUseCase, UserUpdateProviderInfoUseCase } from "../../application/user-use.case/userProfile.use-Case";

const userRepositoryImpl = new UserRepositoryImpl();
const signedUrlCacheRepositoryImpl = new SignedUrlCacheRepositoryImpl();

const userUpdateProviderInfoUseCase = new UserUpdateProviderInfoUseCase(userRepositoryImpl);
const userFetchProfileDetailsUseCase = new UserFetchProfileDetailsUseCase(userRepositoryImpl);
const userUpdateProfileImageUseCase = new UserUpdateProfileImageUseCase(s3Client, userRepositoryImpl, signedUrlCacheRepositoryImpl);

export class UserProfileController {
    constructor(
        private userFetchProfileDetailsUseCase: UserFetchProfileDetailsUseCase,
        private userUpdateProfileImageUseCase: UserUpdateProfileImageUseCase,
        private userUpdateProviderInfoUseCase: UserUpdateProviderInfoUseCase,
    ){
        this.getProfileDetails = this.getProfileDetails.bind(this);
        this.updateProfileImage = this.updateProfileImage.bind(this);
        this.updateUserInfo = this.updateUserInfo.bind(this);
    }

    async getProfileDetails(req:Request, res: Response, next: NextFunction) {
        try{
            const userId = (req.user as DecodedUser).userOrProviderId;
            if(!userId) throw new Error("Invalid request.");
            const result = await this.userFetchProfileDetailsUseCase.execute({userId: new Types.ObjectId(userId)});
            res.status(200).json(result);
        }catch(error){
            console.log("getProfileDetails error : ",error);
            next(error)
        }
    }

    async updateProfileImage(req: Request, res: Response, next: NextFunction) {
        try{
            const userId = (req.user as DecodedUser).userOrProviderId;
            if(!userId) throw new Error("Invalid request.");
            const validatedData = s3FileKeyZodSchmema.parse(req.body);
            const result = await this.userUpdateProfileImageUseCase.execute({userId: new Types.ObjectId(userId), key: validatedData.s3FileKey});
            res.status(200).json(result);
        }catch(error){
            console.log("updateProfileImage error : ",error);
            next(error)
        }
    }

    async updateUserInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { username, phone } = UserOrProviderUpdateInfoZodSchema.parse(req.body);
            if(!userId || !username || !phone) throw new Error("Invalid request");
            const result = await this.userUpdateProviderInfoUseCase.execute({ userId: new Types.ObjectId(userId), username, phone })
            res.status(200).json(result)
        } catch(error){ 
            console.log("updateUserInfo error : ",error);
            next(error);
        }
    }
    
}

const userProfileController = new UserProfileController( 
    userFetchProfileDetailsUseCase, 
    userUpdateProfileImageUseCase,
    userUpdateProviderInfoUseCase,
);
export { userProfileController };
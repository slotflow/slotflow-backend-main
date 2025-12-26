import { DecodedUser } from "../../express";
import { s3Client } from "../../infrastructure/lib/aws_s3";
import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../shared/utils/response";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";
import { UserRepositoryImpl } from "../../infrastructure/database/user/user.repository.impl";
import { s3FileKeyZodSchmema, UserOrProviderUpdateInfoZodSchema } from "../../shared/zod/common.zod";
import { UserFetchProfileDetailsUseCase, UserUpdateProfileImageUseCase, UserUpdateProviderInfoUseCase } from "../../application/useCases/user/userProfile.useCase";

const userRepository: IUserRepository = new UserRepositoryImpl();

const userUpdateProviderInfoUseCase = new UserUpdateProviderInfoUseCase(userRepository);
const userFetchProfileDetailsUseCase = new UserFetchProfileDetailsUseCase(userRepository);
const userUpdateProfileImageUseCase = new UserUpdateProfileImageUseCase(s3Client, userRepository);

class UserProfileController {
    constructor(
        private userFetchProfileDetailsUseCase: UserFetchProfileDetailsUseCase,
        private userUpdateProfileImageUseCase: UserUpdateProfileImageUseCase,
        private userUpdateProviderInfoUseCase: UserUpdateProviderInfoUseCase,
    ){
        this.getProfileDetails = this.getProfileDetails.bind(this);
        this.updateProfileImage = this.updateProfileImage.bind(this);
        this.updateUserInfo = this.updateUserInfo.bind(this);
    };

    async getProfileDetails(req:Request, res: Response, next: NextFunction) {
        try{
            const userId = (req.user as DecodedUser).userOrProviderId;
            if(!userId) throw new Error("Invalid request.");
            const result = await this.userFetchProfileDetailsUseCase.execute({ userId });
            sendResponse(res, result);
        }catch(error){
            log.error("getProfileDetails failed",error as Error);
            next(error);
        };
    };

    async updateProfileImage(req: Request, res: Response, next: NextFunction) {
        try{
            const userId = (req.user as DecodedUser).userOrProviderId;
            if(!userId) throw new Error("Invalid request.");
            const validatedData = s3FileKeyZodSchmema.parse(req.body);
            const result = await this.userUpdateProfileImageUseCase.execute({userId, profileImage: validatedData.s3FileKey});
            sendResponse(res, result, "Profile image updated successfully");
        }catch(error){
            log.error("updateProfileImage failed",error as Error);
            next(error);
        };
    };

    async updateUserInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req.user as DecodedUser).userOrProviderId;
            const { username, phone } = UserOrProviderUpdateInfoZodSchema.parse(req.body);
            if(!userId || !username || !phone) throw new Error("Invalid request");
            const result = await this.userUpdateProviderInfoUseCase.execute({ userId, username, phone })
            sendResponse(res, result, "Info updated successfully");
        } catch(error){ 
            log.error("updateUserInfo failed",error as Error);
            next(error);
        };
    };
    
};

export const userProfileController = new UserProfileController( 
    userFetchProfileDetailsUseCase, 
    userUpdateProfileImageUseCase,
    userUpdateProviderInfoUseCase,
);
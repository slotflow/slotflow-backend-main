import { Types } from 'mongoose';
import { DecodedUser } from '../../express';
import { appConfig } from '../../config/env';
import { NextFunction, Request, Response } from 'express';
import { LoginUseCase } from '../../application/useCases/auth/login.useCase';
import { RegisterUseCase } from '../../application/useCases/auth/register.useCase';
import { SignedUrlService } from '../../infrastructure/services/signedUrl.service';
import { ResendOtpUseCase } from '../../application/useCases/auth/resendOtp.useCase';
import { VerifyOTPUseCase } from '../../application/useCases/auth/verifyOtp.useCase';
import { ISignedUrlService } from '../../domain/interfaces/services/ISignedUrl.service';
import { IUserRepository } from '../../domain/interfaces/repositories/IUser.repository';
import { IPlanRepository } from '../../domain/interfaces/repositories/IPlan.repository';
import { PlanRepositoryImpl } from '../../infrastructure/database/plan/plan.repository.impl';
import { UserRepositoryImpl } from '../../infrastructure/database/user/user.repository.impl';
import { UpdatePasswordUseCase } from '../../application/useCases/auth/updatePassword.useCase';
import { IProviderRepository } from '../../domain/interfaces/repositories/IProvider.repository';
import { CheckUserStatusUseCase } from '../../application/useCases/auth/checkUserStatus.useCase';
import { ISubscriptionRepository } from '../../domain/interfaces/repositories/ISubscription.repository';
import { ProviderRepositoryImpl } from '../../infrastructure/database/provider/provider.repository.impl';
import { ISignedUrlCacheRepository } from '../../domain/interfaces/repositories/ISignedUrlCache.repository';
import { SubscriptionRepositoryImpl } from '../../infrastructure/database/subscription/subscription.repository.impl';
import { SignedUrlCacheRepositoryImpl } from '../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl';
import { LoginZodSchema, OTPVerificationZodSchema, RegisterZodSchema, ResendOTPZodSchema, UpdatePasswordZodSchema } from '../../shared/zod/auth.zod';

const userRepository: IUserRepository = new UserRepositoryImpl();
const planRepository: IPlanRepository = new PlanRepositoryImpl();
const providerRepository: IProviderRepository = new ProviderRepositoryImpl();
const subscriptionRepository: ISubscriptionRepository = new SubscriptionRepositoryImpl();
const signedUrlCacheRepository: ISignedUrlCacheRepository = new SignedUrlCacheRepositoryImpl();

const signedUrlService: ISignedUrlService = new SignedUrlService(signedUrlCacheRepository);

const registerUseCase = new RegisterUseCase(userRepository, providerRepository);
const verifyOTPUseCase = new VerifyOTPUseCase(userRepository, providerRepository);
const resendOtpUseCase = new ResendOtpUseCase(userRepository, providerRepository);
const updatePasswordUseCase = new UpdatePasswordUseCase(userRepository, providerRepository);
const checkUserStatusUseCase = new CheckUserStatusUseCase(userRepository, providerRepository);
const loginUseCase = new LoginUseCase(userRepository, providerRepository, planRepository, subscriptionRepository, signedUrlService);

export class AuthController {

  constructor(
    private registerUseCase: RegisterUseCase,
    private verifyOTPUseCase: VerifyOTPUseCase,
    private resendOtpUseCase: ResendOtpUseCase,
    private loginUseCase: LoginUseCase,
    private updatePasswordUseCase: UpdatePasswordUseCase,
    private checkUserStatusUseCase: CheckUserStatusUseCase
  ) {
    this.register = this.register.bind(this);
    this.verifyOTP = this.verifyOTP.bind(this);
    this.resendOtp = this.resendOtp.bind(this);
    this.login = this.login.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.checkUserStatus = this.checkUserStatus.bind(this);
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = RegisterZodSchema.parse(req.body);
      const result = await this.registerUseCase.execute({...validateData});
      res.cookie("token", result.authUser.token, {
        maxAge: 2 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: appConfig.nodeEnv === 'development' ? 'lax' : 'none',
        secure: appConfig.nodeEnv !== 'development'
      });
      const { token: token, ...authUserWithoutToken } = result.authUser;
      const resultWithoutToken = {
        ...result,
        authUser: authUserWithoutToken,
    };
      res.status(200).json(resultWithoutToken);
    } catch (error) {
      console.log("register error : ",error);
      next(error)
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = OTPVerificationZodSchema.parse(req.body);
      const result = await this.verifyOTPUseCase.execute({...validateData});
      res.status(200).json(result);
    } catch (error) {
      console.log("verifyOTP error : ",error);
      next(error)
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = ResendOTPZodSchema.parse(req.body);
      const { role, verificationToken, email } = validateData;
      if (!role || (!verificationToken && !email)) throw new Error("Invalid request.");
      const result = await this.resendOtpUseCase.execute({role, verificationToken, email});
      res.status(200).json(result);
    } catch (error) {
      console.log("resendOtp error : ",error);
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = LoginZodSchema.parse(req.body);
      const { email, password, role } = validateData;
      if (!email || !password || !role) throw new Error("Invalid request.");
      const { success, message, authUser } = await this.loginUseCase.execute({email, password, role});
      res.cookie("token", authUser.token, {
        maxAge: 2 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: appConfig.nodeEnv === 'development' ? 'lax' : 'none',
        secure: appConfig.nodeEnv !== 'development'
      });
      const { token: token, ...authUserWithoutToken } = authUser;
      const resultWithoutToken = {
        success, message,
        authUser: authUserWithoutToken,
      };
      res.status(200).json(resultWithoutToken);
    } catch (error) {
      console.log("login error : ",error);
      next(error)
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("token");
      res.status(200).json({ success: true, message: "Logged out successfully." });
    } catch (error) {
      console.log("logout error : ",error);
      next(error)
    }
  }

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = UpdatePasswordZodSchema.parse(req.body);
      const { role, verificationToken, password } = validateData;
      if (!role || !verificationToken || !password) throw new Error("Invalid request.");
      const result = await this.updatePasswordUseCase.execute({role, verificationToken, password});
      res.status(200).json(result);
    } catch (error) {
      console.log("updatePassword error : ",error);
      next(error)
    }
  }

  async checkUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req.user as DecodedUser);
      if(!user) throw new Error("")
      const result = await this.checkUserStatusUseCase.execute({_id: new Types.ObjectId(user.userOrProviderId), role: user.role});
      res.status(result.status).json(result);
    } catch (error) {
      console.log("checkUserStatus error : ",error);
      next(error)
    }
  }
}

const authController = new AuthController(registerUseCase, verifyOTPUseCase, resendOtpUseCase, loginUseCase, updatePasswordUseCase, checkUserStatusUseCase);
export { authController };

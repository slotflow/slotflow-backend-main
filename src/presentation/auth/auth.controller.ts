import { appConfig } from '../../config/env';
import { log } from '../../shared/logger/logger';
import { redis } from '../../infrastructure/lib/redis';
import { NextFunction, Request, Response } from 'express';
import { s3Client } from '../../infrastructure/lib/aws_s3';
import { sendResponse } from '../../shared/utils/response';
import { LoginUseCase } from '../../application/useCases/auth/login.useCase';
import { OTPServiceImpl } from '../../infrastructure/services/otpService.impl';
import { RegisterUseCase } from '../../application/useCases/auth/register.useCase';
import { IOTPService } from '../../domain/interfaces/services/IOtpService.service';
import { ResendOtpUseCase } from '../../application/useCases/auth/resendOtp.useCase';
import { VerifyOTPUseCase } from '../../application/useCases/auth/verifyOtp.useCase';
import { ISignedUrlService } from '../../domain/interfaces/services/ISignedUrl.service';
import { IUserRepository } from '../../domain/interfaces/repositories/IUser.repository';
import { IPlanRepository } from '../../domain/interfaces/repositories/IPlan.repository';
import { SignedUrlServiceImpl } from '../../infrastructure/services/signedUrlService.impl';
import { PlanRepositoryImpl } from '../../infrastructure/database/plan/plan.repository.impl';
import { UserRepositoryImpl } from '../../infrastructure/database/user/user.repository.impl';
import { UpdatePasswordUseCase } from '../../application/useCases/auth/updatePassword.useCase';
import { IProviderRepository } from '../../domain/interfaces/repositories/IProvider.repository';
import { ISubscriptionRepository } from '../../domain/interfaces/repositories/ISubscription.repository';
import { ProviderRepositoryImpl } from '../../infrastructure/database/provider/provider.repository.impl';
import { SubscriptionRepositoryImpl } from '../../infrastructure/database/subscription/subscription.repository.impl';
import { LoginZodSchema, OTPVerificationZodSchema, RegisterZodSchema, ResendOTPZodSchema, UpdatePasswordZodSchema } from '../../shared/zod/auth.zod';

const userRepository: IUserRepository = new UserRepositoryImpl();
const planRepository: IPlanRepository = new PlanRepositoryImpl();
const providerRepository: IProviderRepository = new ProviderRepositoryImpl();
const subscriptionRepository: ISubscriptionRepository = new SubscriptionRepositoryImpl();

const otpService: IOTPService = new OTPServiceImpl();
const signedUrlService: ISignedUrlService = new SignedUrlServiceImpl(redis, s3Client);

const registerUseCase = new RegisterUseCase(userRepository, providerRepository, otpService);
const updatePasswordUseCase = new UpdatePasswordUseCase(userRepository, providerRepository);
const verifyOTPUseCase = new VerifyOTPUseCase(userRepository, providerRepository, otpService);
const resendOtpUseCase = new ResendOtpUseCase(userRepository, providerRepository, otpService);
const loginUseCase = new LoginUseCase(userRepository, providerRepository, planRepository, subscriptionRepository, signedUrlService);

class AuthController {

  constructor(
    private registerUseCase: RegisterUseCase,
    private verifyOTPUseCase: VerifyOTPUseCase,
    private resendOtpUseCase: ResendOtpUseCase,
    private loginUseCase: LoginUseCase,
    private updatePasswordUseCase: UpdatePasswordUseCase,
  ) {
    this.register = this.register.bind(this);
    this.verifyOTP = this.verifyOTP.bind(this);
    this.resendOtp = this.resendOtp.bind(this);
    this.login = this.login.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
  };

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = RegisterZodSchema.parse(req.body);
      const result = await this.registerUseCase.execute({ ...validateData });
      res.cookie("token", result.authUser.token, {
        maxAge: 2 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: appConfig.nodeEnv === 'development' ? 'lax' : 'none',
        secure: appConfig.nodeEnv !== 'development'
      });
      const { token, ...authUserWithoutToken } = result.authUser;
      sendResponse(res, authUserWithoutToken, "An OTP has bees sent to your email");
    } catch (error) {
      log.error("RegisterUseCase failed", error as Error);
      next(error);
    };
  };

  async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = OTPVerificationZodSchema.parse(req.body);
      await this.verifyOTPUseCase.execute({ ...validateData });
      sendResponse(res, null, "OTP verified successfully");
    } catch (error) {
      log.error("verifyOTP controller failed", error as Error);
      next(error)
    };
  };
  
  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = ResendOTPZodSchema.parse(req.body);
      const { role, verificationToken, email } = validateData;
      if (!role || (!verificationToken && !email)) throw new Error("Invalid request.");
      const result = await this.resendOtpUseCase.execute({ role, verificationToken, email });
      sendResponse(res, result.authUser, "OTP has been sent to your email");
    } catch (error) {
      log.error("resendOtp controller failed", error as Error);
      next(error)
    };
  };

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("login controller");
      const validateData = LoginZodSchema.parse(req.body);
      const { email, password, role } = validateData;
      if (!email || !password || !role) throw new Error("Invalid request.");
      const result = await this.loginUseCase.execute({ email, password, role });
      res.cookie("token", result.authUser.token, {
        maxAge: 2 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: appConfig.nodeEnv === 'development' ? 'lax' : 'none',
        secure: appConfig.nodeEnv !== 'development'
      });
      const { token: token, ...authUserWithoutToken } = result.authUser;
      console.log("result : ",result);
      sendResponse(res, authUserWithoutToken, "Login successfully");
    } catch (error) {
      log.error("login failed", error as Error);
      next(error)
    };
  };

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("token");
      sendResponse(res, null, "Logged out successfully");
    } catch (error) {
      log.error("logout failed", error as Error);
      next(error)
    };
  };

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = UpdatePasswordZodSchema.parse(req.body);
      const { role, verificationToken, password } = validateData;
      if (!role || !verificationToken || !password) throw new Error("Invalid request.");
      await this.updatePasswordUseCase.execute({ role, verificationToken, password });
      sendResponse(res, null, "Password updated successfully");
    } catch (error) {
      log.error("updatePassword failed", error as Error);
      next(error);
    };
  };

};

export const authController = new AuthController(
  registerUseCase,
  verifyOTPUseCase,
  resendOtpUseCase,
  loginUseCase,
  updatePasswordUseCase,
);

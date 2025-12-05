import { Types } from 'mongoose';
import { DecodedUser } from '../../express';
import { appConfig } from '../../config/env';
import { NextFunction, Request, Response } from 'express';
import { LoginUseCase } from '../../application/auth-use.case/login.use-case';
import { RegisterUseCase } from '../../application/auth-use.case/register.use-case';
import { ResendOtpUseCase } from '../../application/auth-use.case/resend-otp.use-case';
import { VerifyOTPUseCase } from '../../application/auth-use.case/verify-otp.use-case';
import { GenerateSignedUrlService } from '../../infrastructure/services/signedUrl.service';
import { PlanRepositoryImpl } from '../../infrastructure/database/plan/plan.repository.impl';
import { UserRepositoryImpl } from '../../infrastructure/database/user/user.repository.impl';
import { UpdatePasswordUseCase } from '../../application/auth-use.case/updatePassword.use-case';
import { CheckUserStatusUseCase } from '../../application/auth-use.case/checkUserStatus.use-case';
import { ProviderRepositoryImpl } from '../../infrastructure/database/provider/provider.repository.impl';
import { SubscriptionRepositoryImpl } from '../../infrastructure/database/subscription/subscription.repository.impl';
import { SignedUrlCacheRepositoryImpl } from '../../infrastructure/database/signedUrl/signedUrlCacheRepository.impl';
import { LoginZodSchema, OTPVerificationZodSchema, RegisterZodSchema, ResendOTPZodSchema, UpdatePasswordZodSchema } from '../../shared/zod/auth.zod';

const userRepositoryImpl = new UserRepositoryImpl();
const planRepositoryImpl = new PlanRepositoryImpl();
const providerRepositoryImpl = new ProviderRepositoryImpl();
const subscriptionRepositoryImpl = new SubscriptionRepositoryImpl();
const signedUrlCacheRepositoryImpl = new SignedUrlCacheRepositoryImpl();
const generateSignedUrlService = new GenerateSignedUrlService(signedUrlCacheRepositoryImpl);

const registerUseCase = new RegisterUseCase(userRepositoryImpl, providerRepositoryImpl );
const verifyOTPUseCase = new VerifyOTPUseCase(userRepositoryImpl, providerRepositoryImpl);
const resendOtpUseCase = new ResendOtpUseCase(userRepositoryImpl, providerRepositoryImpl );
const updatePasswordUseCase = new UpdatePasswordUseCase(userRepositoryImpl, providerRepositoryImpl);
const checkUserStatusUseCase = new CheckUserStatusUseCase(userRepositoryImpl, providerRepositoryImpl);
const loginUseCase = new LoginUseCase(userRepositoryImpl, providerRepositoryImpl, planRepositoryImpl, subscriptionRepositoryImpl, generateSignedUrlService);

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

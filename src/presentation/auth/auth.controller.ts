import { appConfig } from '../../config/env';
import { log } from '../../shared/logger/logger';
import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../../shared/utils/response';
import { LoginUseCase } from '../../application/useCases/auth/login.useCase';
import { RegisterUseCase } from '../../application/useCases/auth/register.useCase';
import { ResendOtpUseCase } from '../../application/useCases/auth/resendOtp.useCase';
import { VerifyOTPUseCase } from '../../application/useCases/auth/verifyOtp.useCase';
import { UpdatePasswordUseCase } from '../../application/useCases/auth/updatePassword.useCase';
import { loginUseCase, registerUseCase, resendOtpUseCase, updatePasswordUseCase, verifyOTPUseCase } from '.';
import { loginSchema, otpVerificationSchema, registerSchema, resendOTPSchema, updatePasswordSchema } from '../../shared/zod/auth.zod';

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
      const validateData = registerSchema.parse(req.body);
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
      const validateData = otpVerificationSchema.parse(req.body);
      await this.verifyOTPUseCase.execute({ ...validateData });
      sendResponse(res, null, "OTP verified successfully");
    } catch (error) {
      log.error("verifyOTP controller failed", error as Error);
      next(error)
    };
  };
  
  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = resendOTPSchema.parse(req.body);
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
      const validateData = loginSchema.parse(req.body);
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
      const validateData = updatePasswordSchema.parse(req.body);
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

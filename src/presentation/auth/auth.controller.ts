import { appConfig } from '../../config/env';
import { log } from '../../shared/logger/logger';
import { NextFunction, Request, Response } from 'express';
import { sendResponse } from '../../shared/utils/response';
import { LoginUseCase } from '../../application/useCases/auth/login.useCase';
import { RegisterUseCase } from '../../application/useCases/auth/register.useCase';
import { ResendOtpUseCase } from '../../application/useCases/auth/resendOtp.useCase';
import { VerifyOTPUseCase } from '../../application/useCases/auth/verifyOtp.useCase';
import { VerifyEmailUseCase } from '../../application/useCases/auth/verifyEmail.useCase';
import { UpdatePasswordUseCase } from '../../application/useCases/auth/updatePassword.useCase';
import { loginUseCase, registerUseCase, resendOtpUseCase, updatePasswordUseCase, verifyEmailUseCase, verifyOTPUseCase } from '.';
import { loginSchema, otpVerificationSchema, registerSchema, updatePasswordSchema, verifyEmailSchema } from '../../shared/zod/auth.zod';

class AuthController {

  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyOTPUseCase: VerifyOTPUseCase,
    private readonly resendOtpUseCase: ResendOtpUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
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
      res.cookie("token", result.token, {
        maxAge: 2 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: appConfig.nodeEnv === 'development' ? 'lax' : 'none',
        secure: appConfig.nodeEnv !== 'development'
      });
      sendResponse(res, null, "An OTP has bees sent to your email");
    } catch (error) {
      log.error("RegisterUseCase failed", error as Error);
      next(error);
    };
  };

  async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.cookies;
      if (!token) throw new Error("Invalid request.");
      const validateData = otpVerificationSchema.parse(req.body);
      await this.verifyOTPUseCase.execute({ ...validateData, token });
      sendResponse(res, null, "OTP verified successfully");
    } catch (error) {
      log.error("verifyOTP controller failed", error as Error);
      next(error)
    };
  };

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.cookies;
      if (!token) throw new Error("Invalid request.");
      await this.resendOtpUseCase.execute({ token });
      sendResponse(res, null, "OTP has been sent to your email");
    } catch (error) {
      log.error("resendOtp controller failed", error as Error);
      next(error)
    };
  };

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = verifyEmailSchema.parse(req.body);
      const result = await this.verifyEmailUseCase.execute({ ...validateData });
      res.cookie("token", result.token, {
        maxAge: 2 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: appConfig.nodeEnv === 'development' ? 'lax' : 'none',
        secure: appConfig.nodeEnv !== 'development'
      });
      sendResponse(res, null, "Otp has been sent to your email");
    } catch (error) {
      log.error("verifyEmail controller failed", error as Error);
      next(error)
    };
  };

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("login controller");
      const validateData = loginSchema.parse(req.body);
      const result = await this.loginUseCase.execute({ ...validateData });
      const { token, ...authData } = result.authUser;
      res.cookie("token", token, {
        maxAge: 2 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: appConfig.nodeEnv === 'development' ? 'lax' : 'none',
        secure: appConfig.nodeEnv !== 'development'
      });
      console.log("authUserWithToken : ", result.authUser);
      sendResponse(res, authData, "Login successfully");
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
      const { password } = validateData;
      const { token } = req.cookies;
      if (!token) throw new Error("Invalid request.");
      if (!password) throw new Error("Invalid request.");
      await this.updatePasswordUseCase.execute({ token, password });
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
  verifyEmailUseCase,
  loginUseCase,
  updatePasswordUseCase,
);

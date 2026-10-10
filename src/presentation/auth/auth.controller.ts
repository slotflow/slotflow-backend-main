import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { ERROR_CODES } from "../../shared/utils/types/enums";
import { UnauthorizedError } from "../../shared/error/appError";
import { sendResponse } from "../../shared/utils/helpers/response";
import { cookieOptions } from "../../shared/utils/constants/constant";
import { LoginUseCase } from "../../application/useCases/auth/login.useCase";
import { RegisterUseCase } from "../../application/useCases/auth/register.useCase";
import { ResendOtpUseCase } from "../../application/useCases/auth/resendOtp.useCase";
import { VerifyEmailUseCase } from "../../application/useCases/auth/verifyEmail.useCase";
import { ResetPasswordUseCase } from "../../application/useCases/auth/resetPassword.useCase";
import { RegisterOtpVerificationUseCase } from "../../application/useCases/auth/registerOtpVerification.useCase";
import {
  loginSchema,
  otpVerificationSchema,
  registerSchema,
  updatePasswordSchema,
  verifyEmailSchema,
} from "../../shared/zod/auth.zod";
import {
  loginUseCase,
  registerUseCase,
  resendOtpUseCase,
  resetPasswordUseCase,
  verifyEmailUseCase,
  registerOtpVerificationUseCase,
} from ".";

class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly registerOtpVerificationUseCase: RegisterOtpVerificationUseCase,
    private readonly resendOtpUseCase: ResendOtpUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {
    this.register = this.register.bind(this);
    this.registerOtpVerification = this.registerOtpVerification.bind(this);
    this.resendOtp = this.resendOtp.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = registerSchema.parse(req.body);
      const result = await this.registerUseCase.execute({ ...validateData });
      res.cookie("token", result.token, cookieOptions);
      sendResponse(res, null, "An OTP has been sent to your email");
    } catch (error) {
      log.error("RegisterUseCase failed", { error });
      next(error);
    }
  }

  async registerOtpVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.cookies;
      if (!token) throw new UnauthorizedError("Token is required", ERROR_CODES.UNAUTHORIZED);
      const validateData = otpVerificationSchema.parse(req.body);
      await this.registerOtpVerificationUseCase.execute({ ...validateData, token });
      sendResponse(res, null, "OTP verified successfully");
    } catch (error) {
      log.error("registerOtpVerification controller failed", { error });
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.cookies;
      if (!token) throw new UnauthorizedError("Token is required", ERROR_CODES.UNAUTHORIZED);
      await this.resendOtpUseCase.execute({ token });
      sendResponse(res, null, "OTP has been sent to your email");
    } catch (error) {
      log.error("resendOtp controller failed", { error });
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = verifyEmailSchema.parse(req.body);
      const result = await this.verifyEmailUseCase.execute({ ...validateData });
      res.cookie("token", result.token, cookieOptions);
      sendResponse(res, null, "Otp has been sent to your email");
    } catch (error) {
      log.error("verifyEmail controller failed", { error });
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = loginSchema.parse(req.body);
      const result = await this.loginUseCase.execute({ ...validateData });
      const { token, ...user } = result;
      res.cookie("token", token, cookieOptions);
      sendResponse(res, user, "Login successfully");
    } catch (error) {
      log.error("login failed", { error });
      next(error);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("token");
      sendResponse(res, null, "Logged out successfully");
    } catch (error) {
      log.error("logout failed", { error });
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = updatePasswordSchema.parse(req.body);
      const { password } = validateData;
      const { token } = req.cookies;
      if (!token) throw new UnauthorizedError("Token is required", ERROR_CODES.UNAUTHORIZED);
      await this.resetPasswordUseCase.execute({ token, password });
      sendResponse(res, null, "Password updated successfully");
    } catch (error) {
      log.error("updatePassword failed", { error });
      next(error);
    }
  }
}

export const authController = new AuthController(
  registerUseCase,
  registerOtpVerificationUseCase,
  resendOtpUseCase,
  verifyEmailUseCase,
  loginUseCase,
  resetPasswordUseCase,
);

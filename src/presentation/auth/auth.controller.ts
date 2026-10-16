import { log } from "../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { ERROR_CODES } from "../../shared/utils/types/enums";
import { UnauthorizedError } from "../../shared/error/appError";
import { sendResponse } from "../../shared/utils/helpers/response";
import { LoginUseCase } from "../../application/useCases/auth/login.useCase";
import { RegisterUseCase } from "../../application/useCases/auth/register.useCase";
import { ResendOtpUseCase } from "../../application/useCases/auth/resendOtp.useCase";
import { VerifyEmailUseCase } from "../../application/useCases/auth/verifyEmail.useCase";
import { ResetPasswordUseCase } from "../../application/useCases/auth/resetPassword.useCase";
import { RegisterOtpVerificationUseCase } from "../../application/useCases/auth/registerOtpVerification.useCase";
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  updatePasswordSchema,
  otpVerificationSchema,
} from "../../shared/zod/auth.zod";
import {
  loginUseCase,
  registerUseCase,
  resendOtpUseCase,
  verifyEmailUseCase,
  refreshTokenUseCase,
  resetPasswordUseCase,
  verifyResetOtpUseCase,
  registerOtpVerificationUseCase,
} from ".";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  temporaryCookieOptions,
  clearAuthCookieOptions,
} from "../../shared/utils/constants/constant";
import { RefreshTokenUseCase } from "../../application/useCases/auth/refreshToken.useCase";
import { VerifyResetOtpUseCase } from "../../application/useCases/auth/verifyResetOtp.useCase";

class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly registerOtpVerificationUseCase: RegisterOtpVerificationUseCase,
    private readonly resendOtpUseCase: ResendOtpUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly verifyResetOtpUseCase: VerifyResetOtpUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {
    this.register = this.register.bind(this);
    this.registerOtpVerification = this.registerOtpVerification.bind(this);
    this.resendOtp = this.resendOtp.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.verifyResetOtp = this.verifyResetOtp.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.login = this.login.bind(this);
    this.refresh = this.refresh.bind(this);
    this.logout = this.logout.bind(this);
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = registerSchema.parse(req.body);
      const { registrationId } = await this.registerUseCase.execute({ ...validateData });
      res.cookie("registrationId", registrationId, temporaryCookieOptions);
      sendResponse(res, null, "An OTP has been sent to your email");
    } catch (error) {
      log.error("RegisterUseCase failed", { error });
      next(error);
    }
  }

  async registerOtpVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const registrationId: unknown = req.cookies?.registrationId;
      if (typeof registrationId !== "string" || !registrationId) {
        throw new UnauthorizedError("Registration session expired", ERROR_CODES.UNAUTHORIZED);
      }
      const validateData = otpVerificationSchema.parse(req.body);
      await this.registerOtpVerificationUseCase.execute({
        registrationId,
        otp: validateData.otp,
      });
      const { maxAge: _ma, ...clearOptions } = clearAuthCookieOptions;
      res.clearCookie("registrationId", clearOptions);
      sendResponse(res, null, "OTP verified successfully");
    } catch (error) {
      log.error("registerOtpVerification controller failed", { error });
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const registrationId: unknown = req.cookies?.registrationId;
      if (typeof registrationId !== "string" || !registrationId) {
        throw new UnauthorizedError("Registration session expired", ERROR_CODES.UNAUTHORIZED);
      }
      await this.resendOtpUseCase.execute({ registrationId });
      sendResponse(res, null, "OTP resent successfully");
    } catch (error) {
      log.error("resendOtp controller failed", { error });
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = verifyEmailSchema.parse(req.body);
      const { resetRequestId } = await this.verifyEmailUseCase.execute(validateData);
      res.cookie("resetRequestId", resetRequestId, temporaryCookieOptions);
      sendResponse(res, null, "If the email is registered, an OTP has been sent");
    } catch (error) {
      log.error("verifyEmail controller failed", { error });
      next(error);
    }
  }

  async verifyResetOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const resetRequestId: string = req.cookies?.resetRequestId;
      if (typeof resetRequestId !== "string" || !resetRequestId) {
        throw new UnauthorizedError("Password reset session expired", ERROR_CODES.UNAUTHORIZED);
      }
      const validateData = otpVerificationSchema.parse(req.body);
      const { resetGrant } = await this.verifyResetOtpUseCase.execute({
        resetRequestId,
        otp: validateData.otp,
      });
      res.clearCookie("resetRequestId", clearAuthCookieOptions);
      res.cookie("resetGrant", resetGrant, temporaryCookieOptions);
      sendResponse(res, null, "OTP verified successfully");
    } catch (error) {
      log.error("verifyResetOtp controller failed", { error });
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const resetGrant: unknown = req.cookies?.resetGrant;
      if (typeof resetGrant !== "string" || !resetGrant) {
        throw new UnauthorizedError("Password reset session expired", ERROR_CODES.UNAUTHORIZED);
      }
      const validateData = updatePasswordSchema.parse(req.body);
      await this.resetPasswordUseCase.execute({
        resetGrant,
        password: validateData.password,
      });
      res.clearCookie("resetGrant", clearAuthCookieOptions);
      sendResponse(res, null, "Password updated successfully");
    } catch (error) {
      log.error("updatePassword failed", { error });
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validateData = loginSchema.parse(req.body);
      const result = await this.loginUseCase.execute({ ...validateData });
      const {
        tokens: { accessToken, refreshToken },
        ...user
      } = result;
      res.cookie("token", accessToken, accessTokenCookieOptions);
      res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
      sendResponse(res, user, "Login successfully");
    } catch (error) {
      log.error("login failed", { error });
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token: unknown = req.cookies?.refreshToken;
      if (typeof token !== "string" || !token) {
        throw new UnauthorizedError("Refresh token is required");
      }
      const accessToken = await this.refreshTokenUseCase.execute(token);
      res.cookie("token", accessToken, accessTokenCookieOptions);
      sendResponse(res, null, "Token refreshed successfully");
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("token", clearAuthCookieOptions);
      res.clearCookie("refreshToken", clearAuthCookieOptions);
      sendResponse(res, null, "Logged out successfully");
    } catch (error) {
      log.error("logout failed", { error });
      next(error);
    }
  }
}

export const authController = new AuthController(
  registerUseCase,
  registerOtpVerificationUseCase,
  resendOtpUseCase,
  verifyEmailUseCase,
  verifyResetOtpUseCase,
  resetPasswordUseCase,
  loginUseCase,
  refreshTokenUseCase,
);

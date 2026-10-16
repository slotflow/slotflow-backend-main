import {
  userRepository,
  creditAccountRepository,
  providerProfileRepository,
} from "../../infrastructure/repository";
import { kafkaProducer } from "../../infrastructure/messaging";
import { redisClient } from "../../infrastructure/cache/redis/redis";
import { passwordHasher } from "../../infrastructure/security";
import { LoginUseCase } from "../../application/useCases/auth/login.useCase";
import { RegisterUseCase } from "../../application/useCases/auth/register.useCase";
import { ResendOtpUseCase } from "../../application/useCases/auth/resendOtp.useCase";
import { VerifyEmailUseCase } from "../../application/useCases/auth/verifyEmail.useCase";
import { RefreshTokenUseCase } from "../../application/useCases/auth/refreshToken.useCase";
import { ResetPasswordUseCase } from "../../application/useCases/auth/resetPassword.useCase";
import { VerifyResetOtpUseCase } from "../../application/useCases/auth/verifyResetOtp.useCase";
import {
  authResponseBuilder,
  authTokenService,
  signedUrlService,
} from "../../infrastructure/services";
import { GoogleAuthOrchestratorUseCase } from "../../application/useCases/auth/googleAuthOrchestrate.useCase";
import { RegisterOtpVerificationUseCase } from "../../application/useCases/auth/registerOtpVerification.useCase";

export const resendOtpUseCase = new ResendOtpUseCase(kafkaProducer, redisClient);

export const verifyEmailUseCase = new VerifyEmailUseCase(
  userRepository,
  kafkaProducer,
  redisClient,
);

export const registerOtpVerificationUseCase = new RegisterOtpVerificationUseCase(
  userRepository,
  kafkaProducer,
  creditAccountRepository,
  redisClient,
);

export const registerUseCase = new RegisterUseCase(
  userRepository,
  passwordHasher,
  kafkaProducer,
  redisClient,
);

export const resetPasswordUseCase = new ResetPasswordUseCase(
  userRepository,
  passwordHasher,
  kafkaProducer,
  redisClient,
);

export const loginUseCase = new LoginUseCase(
  userRepository,
  providerProfileRepository,
  signedUrlService,
  authTokenService,
  passwordHasher,
  authResponseBuilder,
);

// google auth controller dependency injection
export const googleAuthOrchestratorUseCase = new GoogleAuthOrchestratorUseCase(
  userRepository,
  providerProfileRepository,
  kafkaProducer,
  authResponseBuilder,
  creditAccountRepository,
  authTokenService,
);

export const refreshTokenUseCase = new RefreshTokenUseCase(authTokenService, userRepository);

export const verifyResetOtpUseCase = new VerifyResetOtpUseCase(redisClient);

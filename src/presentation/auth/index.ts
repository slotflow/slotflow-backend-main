import { kafkaProducer } from "../../infrastructure/messaging";
import { jwtService, passwordHasher } from "../../infrastructure/security";
import { LoginUseCase } from "../../application/useCases/auth/login.useCase";
import { RegisterUseCase } from "../../application/useCases/auth/register.useCase";
import { ResendOtpUseCase } from "../../application/useCases/auth/resendOtp.useCase";
import { RegisterOtpVerificationUseCase } from "../../application/useCases/auth/registerOtpVerification.useCase";
import { VerifyEmailUseCase } from "../../application/useCases/auth/verifyEmail.useCase";
import { ResetPasswordUseCase } from "../../application/useCases/auth/resetPassword.useCase";
import { authResponseBuilder, otpService, signedUrlService } from "../../infrastructure/services";
import { GoogleAuthOrchestratorUseCase } from "../../application/useCases/auth/googleAuthOrchestrate.useCase";
import { creditAccountRepository, providerProfileRepository, userRepository } from "../../infrastructure/repository";

// auth controller dependency injection
export const resendOtpUseCase = new ResendOtpUseCase(otpService, kafkaProducer, jwtService);

export const verifyEmailUseCase = new VerifyEmailUseCase(userRepository, otpService, jwtService);

export const registerOtpVerificationUseCase = new RegisterOtpVerificationUseCase(userRepository, otpService, kafkaProducer, jwtService, creditAccountRepository);

export const registerUseCase = new RegisterUseCase(userRepository, otpService, jwtService, passwordHasher, kafkaProducer);

export const resetPasswordUseCase = new ResetPasswordUseCase(userRepository, passwordHasher, kafkaProducer, jwtService);

export const loginUseCase = new LoginUseCase(userRepository, providerProfileRepository, signedUrlService, jwtService, passwordHasher, authResponseBuilder);

// google auth controller dependency injection
export const googleAuthOrchestratorUseCase = new GoogleAuthOrchestratorUseCase(userRepository, providerProfileRepository, jwtService, kafkaProducer, authResponseBuilder, creditAccountRepository);

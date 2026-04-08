import { kafkaProducer } from "../../infrastructure/messaging";
import { jwtService, passwordHasher } from "../../infrastructure/security";
import { LoginUseCase } from "../../application/useCases/auth/login.useCase";
import { RegisterUseCase } from "../../application/useCases/auth/register.useCase";
import { ResendOtpUseCase } from "../../application/useCases/auth/resendOtp.useCase";
import { VerifyOTPUseCase } from "../../application/useCases/auth/verifyOtp.useCase";
import { VerifyEmailUseCase } from "../../application/useCases/auth/verifyEmail.useCase";
import { UpdatePasswordUseCase } from "../../application/useCases/auth/updatePassword.useCase";
import { aesEncryptionService, otpService, signedUrlService } from "../../infrastructure/services";
import { GoogleAuthOrchestratorUseCase } from "../../application/useCases/auth/googleAuthOrchestrate.useCase";
import { credentialRepository, planRepository, providerProfileRepository, providerRepository, subscriptionRepository, userRepository } from "../../infrastructure/repositoryImpls";

// auth controller dependency injection
export const resendOtpUseCase = new ResendOtpUseCase(otpService, kafkaProducer, jwtService);

export const verifyEmailUseCase = new VerifyEmailUseCase(userRepository, otpService, jwtService);

export const verifyOTPUseCase = new VerifyOTPUseCase(userRepository, otpService, kafkaProducer, jwtService);

export const registerUseCase = new RegisterUseCase(userRepository, otpService, jwtService, passwordHasher, kafkaProducer);

export const updatePasswordUseCase = new UpdatePasswordUseCase(userRepository, providerRepository, passwordHasher, kafkaProducer, jwtService);

export const loginUseCase = new LoginUseCase(userRepository, providerProfileRepository, planRepository, subscriptionRepository, signedUrlService, jwtService, passwordHasher);

// google auth controller dependency injection
export const googleAuthOrchestratorUseCase = new GoogleAuthOrchestratorUseCase(userRepository, providerRepository, credentialRepository, aesEncryptionService, subscriptionRepository, planRepository, jwtService, kafkaProducer);

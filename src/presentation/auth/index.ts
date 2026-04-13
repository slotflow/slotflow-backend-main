import { kafkaProducer } from "../../infrastructure/messaging";
import { jwtService, passwordHasher } from "../../infrastructure/security";
import { LoginUseCase } from "../../application/useCases/auth/login.useCase";
import { RegisterUseCase } from "../../application/useCases/auth/register.useCase";
import { ResendOtpUseCase } from "../../application/useCases/auth/resendOtp.useCase";
import { VerifyOTPUseCase } from "../../application/useCases/auth/verifyOtp.useCase";
import { AuthResponseBuilder } from "../../application/services/AuthResponseBuilder";
import { VerifyEmailUseCase } from "../../application/useCases/auth/verifyEmail.useCase";
import { UpdatePasswordUseCase } from "../../application/useCases/auth/updatePassword.useCase";
import { aesEncryptionService, otpService, signedUrlService } from "../../infrastructure/services";
import { GoogleAuthOrchestratorUseCase } from "../../application/useCases/auth/googleAuthOrchestrate.useCase";
import { credentialRepository, planRepository, providerProfileRepository, subscriptionRepository, userRepository } from "../../infrastructure/repositoryImpls";

const authResponseBuilder = new AuthResponseBuilder(subscriptionRepository, planRepository);

// auth controller dependency injection
export const resendOtpUseCase = new ResendOtpUseCase(otpService, kafkaProducer, jwtService);

export const verifyEmailUseCase = new VerifyEmailUseCase(userRepository, otpService, jwtService);

export const verifyOTPUseCase = new VerifyOTPUseCase(userRepository, otpService, kafkaProducer, jwtService);

export const registerUseCase = new RegisterUseCase(userRepository, otpService, jwtService, passwordHasher, kafkaProducer);

export const updatePasswordUseCase = new UpdatePasswordUseCase(userRepository, passwordHasher, kafkaProducer, jwtService);

export const loginUseCase = new LoginUseCase(userRepository, providerProfileRepository, signedUrlService, jwtService, passwordHasher, authResponseBuilder);

// google auth controller dependency injection
export const googleAuthOrchestratorUseCase = new GoogleAuthOrchestratorUseCase(userRepository, providerProfileRepository, credentialRepository, aesEncryptionService, jwtService, kafkaProducer, authResponseBuilder);

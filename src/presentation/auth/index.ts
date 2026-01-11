import { jwtService, passwordHasher } from "../../infrastructure/security";
import { LoginUseCase } from "../../application/useCases/auth/login.useCase";
import { RegisterUseCase } from "../../application/useCases/auth/register.useCase";
import { ResendOtpUseCase } from "../../application/useCases/auth/resendOtp.useCase";
import { VerifyOTPUseCase } from "../../application/useCases/auth/verifyOtp.useCase";
import { UpdatePasswordUseCase } from "../../application/useCases/auth/updatePassword.useCase";
import { aesEncryptionService, otpService, signedUrlService } from "../../infrastructure/services";
import { GoogleAuthOrchestratorUseCase } from "../../application/useCases/auth/googleAuthOrchestrate.useCase";
import { credentialRepository, planRepository, providerRepository, subscriptionRepository, userRepository } from "../../infrastructure/repositoryImpls";

// auth controller dependency injection
export const updatePasswordUseCase = new UpdatePasswordUseCase(userRepository, providerRepository, passwordHasher);
export const registerUseCase = new RegisterUseCase(userRepository, providerRepository, otpService, jwtService, passwordHasher);
export const resendOtpUseCase = new ResendOtpUseCase(userRepository, providerRepository, otpService);
export const verifyOTPUseCase = new VerifyOTPUseCase(userRepository, providerRepository, otpService);
export const loginUseCase = new LoginUseCase(userRepository, providerRepository, planRepository, subscriptionRepository, signedUrlService, jwtService, passwordHasher);

// google auth controller dependency injection
export const googleAuthOrchestratorUseCase = new GoogleAuthOrchestratorUseCase(userRepository, providerRepository, credentialRepository, aesEncryptionService, subscriptionRepository, planRepository, jwtService);

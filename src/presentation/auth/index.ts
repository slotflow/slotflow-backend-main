import { LoginUseCase } from "../../application/useCases/auth/login.useCase";
import { RegisterUseCase } from "../../application/useCases/auth/register.useCase";
import { ResendOtpUseCase } from "../../application/useCases/auth/resendOtp.useCase";
import { VerifyOTPUseCase } from "../../application/useCases/auth/verifyOtp.useCase";
import { UpdatePasswordUseCase } from "../../application/useCases/auth/updatePassword.useCase";
import { kafkaService, otpService, planRepository, providerRepository, signedUrlService, subscriptionRepository, userRepository } from "../../infrastructure/container";

// auth controller dependency injection
export const updatePasswordUseCase = new UpdatePasswordUseCase(userRepository, providerRepository);
export const registerUseCase = new RegisterUseCase(userRepository, providerRepository, otpService, kafkaService);
export const resendOtpUseCase = new ResendOtpUseCase(userRepository, providerRepository, otpService, kafkaService);
export const verifyOTPUseCase = new VerifyOTPUseCase(userRepository, providerRepository, otpService, kafkaService);
export const loginUseCase = new LoginUseCase(userRepository, providerRepository, planRepository, subscriptionRepository, signedUrlService);
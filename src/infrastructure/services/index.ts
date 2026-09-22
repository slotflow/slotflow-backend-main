import { s3Client } from "../cloud/aws/aws_s3";
import { stripeClient } from "../stripe/clinet";
import { redisClient } from "../cache/redis/redis";
import { OTPServiceImpl } from "./otp.service.impl";
import { CacheServiceImpl } from "./cache.service.impl";
import { StripePlanServiceImpl } from "./stripe.service.impl";
import { SignedUrlServiceImpl } from "./signedUrl.service.impl";
import { GoogleTokenServiceImpl } from "./googleToken.service.impl";
import { AuthResponseBuilderImpl } from "./AuthResponseBuilder.service.impl";
import { AesEncryptionServiceImpl } from "../security/aesEncryptionService.impl";
import { GoogleRefreshTokenServiceImpl } from "./googleRefreshToken.service.impl";
import { IOTPService } from "../../application/interfaces/services/IOtp.service";
import { ICacheService } from "../../application/interfaces/services/ICache.service";
import { credentialRepository, planRepository, subscriptionRepository } from "../repository";
import { ISignedUrlService } from "../../application/interfaces/services/ISignedUrl.service";
import { IStripePlanService } from "../../application/interfaces/services/IStripePlan.service";
import { IGoogleTokenService } from "../../application/interfaces/services/IGoogleToken.service";
import { IAesEncryptionService } from "../../application/interfaces/security/IAesEncryption.service";
import { IAuthResponseBuilder } from "../../application/interfaces/services/IAuthResponseBuilder.service";
import { IGoogleRefreshTokenService } from "../../application/interfaces/services/IGoogleRefreshToken.service";

// signed url service instance
export const signedUrlService: ISignedUrlService = new SignedUrlServiceImpl(redisClient, s3Client);

// otp service instance
export const otpService: IOTPService = new OTPServiceImpl(redisClient);

// aesEncryption service instance
export const aesEncryptionService: IAesEncryptionService = new AesEncryptionServiceImpl();

// google refresh token service instance
export const googleRefreshTokenService: IGoogleRefreshTokenService = new GoogleRefreshTokenServiceImpl();

// google token service instance
export const googleTokenService: IGoogleTokenService = new GoogleTokenServiceImpl(credentialRepository, aesEncryptionService, googleRefreshTokenService);

// cache service instance
export const cacheService: ICacheService = new CacheServiceImpl(redisClient);

// stripe plan product service instance
export const stripePlanService: IStripePlanService = new StripePlanServiceImpl(stripeClient);

// auth response builder instance
export const authResponseBuilder: IAuthResponseBuilder = new AuthResponseBuilderImpl(subscriptionRepository, planRepository);
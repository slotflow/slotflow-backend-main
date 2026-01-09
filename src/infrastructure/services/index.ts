// Services instance

import { s3Client } from "../lib/aws_s3";
import { redisClient } from "../lib/redis";
import { OTPServiceImpl } from "./otpService.impl";
import { credentialRepository } from "../database";
import { SignedUrlServiceImpl } from "./signedUrlService.impl";
import { GoogleTokenServiceImpl } from "./googleTokenService.impl";
import { AesEncryptionServiceImpl } from "./aesEncryptionService.impl";
import { GooglePassportStrategyImpl } from "../passport/google.strategy";
import { GoogleRefreshTokenServiceImpl } from "./googleRefreshTokenService.impl";
import { IOTPService } from "../../domain/interfaces/services/IOtpService.service";
import { GoogleCalendarGatewayServiceImpl } from "./googleCalendarGatewayService.impl";
import { ISignedUrlService } from "../../domain/interfaces/services/ISignedUrl.service";
import { IGoogleTokenService } from "../../domain/interfaces/services/IGoogleToken.service";
import { IAesEncryptionService } from "../../domain/interfaces/services/IAesEncryption.service";
import { IGoogleRefreshTokenService } from "../../domain/interfaces/services/IGoogleRefreshToken.service";
import { IGoogleCalendarGatewayService } from "../../domain/interfaces/services/IGoogleCalendarGateway.service";

// signed url service instance
export const signedUrlService: ISignedUrlService = new SignedUrlServiceImpl(redisClient, s3Client);

// otp service instance
export const otpService: IOTPService = new OTPServiceImpl();

// aesEncryption service instance
export const aesEncryptionService: IAesEncryptionService = new AesEncryptionServiceImpl();

// passport google stratergy instance
export const googlePassportStrategy = new GooglePassportStrategyImpl();

// google calendar service instance
export const googleCalendarGatewayService: IGoogleCalendarGatewayService = new GoogleCalendarGatewayServiceImpl();

// google refresh token service instance
export const googleRefreshTokenService: IGoogleRefreshTokenService = new GoogleRefreshTokenServiceImpl();

// google token service instance
export const googleTokenService: IGoogleTokenService = new GoogleTokenServiceImpl(credentialRepository, aesEncryptionService, googleRefreshTokenService);

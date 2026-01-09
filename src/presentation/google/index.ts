import { credentialRepository } from "../../infrastructure/database";
import { aesEncryptionService, googleCalendarGatewayService } from "../../infrastructure/services";
import { FethGoogleCalendarUseCase } from "../../application/useCases/common/fetchGoogleCalendar.useCase";

// google controller dependency injection
export const fethGoogleCalendarUseCase = new FethGoogleCalendarUseCase(credentialRepository, aesEncryptionService, googleCalendarGatewayService);

import { FethGoogleCalendarUseCase } from "../../application/useCases/common/fetchGoogleCalendar.useCase";
import { aesEncryptionService, credentialRepository, googleCalendarGatewayService } from "../../infrastructure/container";

// google controller dependency injection
export const fethGoogleCalendarUseCase = new FethGoogleCalendarUseCase(credentialRepository, aesEncryptionService, googleCalendarGatewayService);

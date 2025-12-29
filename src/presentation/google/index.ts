import { FethGoogleCalendarUseCase } from "../../application/useCases/common/fetchGoogleCalendar.useCase";
import { aesEncryptionService, credentialRepository, googleCalendarGateway } from "../../infrastructure/container";

// google controller dependency injection
export const fethGoogleCalendarUseCase = new FethGoogleCalendarUseCase(credentialRepository, aesEncryptionService, googleCalendarGateway);

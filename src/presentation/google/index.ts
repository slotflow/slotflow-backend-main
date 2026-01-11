import { credentialRepository } from "../../infrastructure/repositoryImpls";
import { aesEncryptionService, googleCalendarGatewayService } from "../../infrastructure/services";
import { FethGoogleCalendarUseCase } from "../../application/useCases/common/fetchGoogleCalendar.useCase";

// google controller dependency injection
export const fethGoogleCalendarUseCase = new FethGoogleCalendarUseCase(credentialRepository, aesEncryptionService, googleCalendarGatewayService);

import { credentialRepository } from "../../infrastructure/repositoryImpls";
import { aesEncryptionService, googleCalendarGatewayService } from "../../infrastructure/services";
import { GetGoogleCalendarUseCase } from "../../application/useCases/common/getGoogleCalendar.useCase";

// google controller dependency injection
export const getGoogleCalendarUseCase = new GetGoogleCalendarUseCase(credentialRepository, aesEncryptionService, googleCalendarGatewayService);

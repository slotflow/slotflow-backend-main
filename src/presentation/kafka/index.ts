import { kafkaProducer } from "../../infrastructure/messaging";
import { bookingRepository } from "../../infrastructure/repositoryImpls";
import { GoogleCalendarFailedUseCases } from "../../application/useCases/kafkaSubscription/googleCalendarFailed.useCase";
import { GoogleCalendarSuccessUseCases } from "../../application/useCases/kafkaSubscription/googleCalendarSuccess.useCases";

export const googleCalendarHandler = {
    googleCalendarSuccess: new GoogleCalendarSuccessUseCases(bookingRepository),
    googleCalendarFailed: new GoogleCalendarFailedUseCases(bookingRepository, kafkaProducer),
};
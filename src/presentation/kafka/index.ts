import { bookingRepository, planRepository, providerRepository, subscriptionRepository } from "../../infrastructure/repositoryImpls";
import { GoogleCalendarFailedUseCases } from "../../application/useCases/kafkaSubscription/googleCalendarFailed.useCase";
import { GoogleCalendarSuccessUseCases } from "../../application/useCases/kafkaSubscription/googleCalendarSuccess.useCase";
import { UpdateSubscriptionAfterPaymentFailedUseCase } from "../../application/useCases/kafkaSubscription/updateSubscriptionAfterPaymentFailed";
import { UpdateSubscriptionAfterPaymentSuccessUseCase } from "../../application/useCases/kafkaSubscription/updateSubscriptionAfterPaymentSuccess";
import { kafkaProducer } from "../../infrastructure/messaging";

export const handler = {
    googleCalendarSuccess: new GoogleCalendarSuccessUseCases(bookingRepository),
    googleCalendarFailed: new GoogleCalendarFailedUseCases(bookingRepository),
    providerSubscriptionPaymentSuccess: new UpdateSubscriptionAfterPaymentSuccessUseCase(subscriptionRepository, providerRepository, kafkaProducer, planRepository),
    providerSubscriptionPaymentFailed: new UpdateSubscriptionAfterPaymentFailedUseCase(subscriptionRepository),
};
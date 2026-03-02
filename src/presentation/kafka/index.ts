import { bookingRepository, planRepository, providerRepository, subscriptionRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { GoogleCalendarFailedUseCases } from "../../application/useCases/kafkaSubscription/googleCalendarFailed.useCase";
import { GoogleCalendarSuccessUseCases } from "../../application/useCases/kafkaSubscription/googleCalendarSuccess.useCase";
import { UpdateSubscriptionAfterPaymentFailedUseCase } from "../../application/useCases/kafkaSubscription/updateSubscriptionAfterPaymentFailed";
import { UpdateSubscriptionAfterPaymentSuccessUseCase } from "../../application/useCases/kafkaSubscription/updateSubscriptionAfterPaymentSuccess";
import { kafkaProducer } from "../../infrastructure/messaging";
import { UpdateBookingAfterPaymentSuccessUseCase } from "../../application/useCases/kafkaSubscription/updateBookingAfterPaymentSuccess.useCase";
import { UpdateBookingAfterPaymentFailedUseCase } from "../../application/useCases/kafkaSubscription/updateBookingAfterPaymentFailed.useCase";

export const handler = {
    googleCalendarSuccess: new GoogleCalendarSuccessUseCases(bookingRepository),
    googleCalendarFailed: new GoogleCalendarFailedUseCases(bookingRepository),
    providerSubscriptionPaymentSuccess: new UpdateSubscriptionAfterPaymentSuccessUseCase(subscriptionRepository, providerRepository, kafkaProducer, planRepository),
    providerSubscriptionPaymentFailed: new UpdateSubscriptionAfterPaymentFailedUseCase(subscriptionRepository),
    userBookingPaymentSuccess: new UpdateBookingAfterPaymentSuccessUseCase(bookingRepository, kafkaProducer, userRepository),
    userBookingPaymentFailed: new UpdateBookingAfterPaymentFailedUseCase(bookingRepository)
};
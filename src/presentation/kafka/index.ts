import { bookingRepository, planRepository, providerRepository, subscriptionRepository, userRepository } from "../../infrastructure/repositoryImpls";
import { GoogleCalendarFailedUseCases } from "../../application/useCases/kafka/googleCalendarFailed.useCase";
import { GoogleCalendarSuccessUseCases } from "../../application/useCases/kafka/googleCalendarSuccess.useCase";
import { UpdateSubscriptionAfterPaymentFailedUseCase } from "../../application/useCases/kafka/updateSubscriptionAfterPaymentFailed";
import { UpdateSubscriptionAfterPaymentSuccessUseCase } from "../../application/useCases/kafka/updateSubscriptionAfterPaymentSuccess";
import { kafkaProducer } from "../../infrastructure/messaging";
import { UpdateBookingAfterPaymentSuccessUseCase } from "../../application/useCases/kafka/updateBookingAfterPaymentSuccess.useCase";
import { UpdateBookingAfterPaymentFailedUseCase } from "../../application/useCases/kafka/updateBookingAfterPaymentFailed.useCase";

export const handler = {
    googleCalendarSuccess: new GoogleCalendarSuccessUseCases(bookingRepository),
    googleCalendarFailed: new GoogleCalendarFailedUseCases(bookingRepository),
    providerSubscriptionPaymentSuccess: new UpdateSubscriptionAfterPaymentSuccessUseCase(subscriptionRepository, providerRepository, kafkaProducer, planRepository),
    providerSubscriptionPaymentFailed: new UpdateSubscriptionAfterPaymentFailedUseCase(subscriptionRepository),
    userBookingPaymentSuccess: new UpdateBookingAfterPaymentSuccessUseCase(bookingRepository, kafkaProducer, userRepository, providerRepository),
    userBookingPaymentFailed: new UpdateBookingAfterPaymentFailedUseCase(bookingRepository)
};
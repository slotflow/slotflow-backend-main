import { kafkaProducer } from "../../infrastructure/messaging";
import { GoogleCalendarFailedUseCases } from "../../application/useCases/kafka/googleCalendarFailed.useCase";
import { GoogleCalendarSuccessUseCases } from "../../application/useCases/kafka/googleCalendarSuccess.useCase";
import { UpdateStripeAccountDataUseCase } from "../../application/useCases/kafka/updateStripeAccountData.useCase";
import { UpdateStripeCustomerCreatedUseCase } from "../../application/useCases/kafka/updateStripeCustomerCreated.useCase";
import { UpdateBookingAfterPaymentFailedUseCase } from "../../application/useCases/kafka/updateBookingAfterPaymentFailed.useCase";
import { UpdateBookingAfterPaymentSuccessUseCase } from "../../application/useCases/kafka/updateBookingAfterPaymentSuccess.useCase";
import { UpdateSubscriptionAfterPaymentFailedUseCase } from "../../application/useCases/kafka/updateSubscriptionAfterPaymentFailed";
import { UpdateSubscriptionAfterPaymentSuccessUseCase } from "../../application/useCases/kafka/updateSubscriptionAfterPaymentSuccess";
import { bookingRepository, planRepository, providerProfileRepository, subscriptionRepository, userRepository } from "../../infrastructure/repositoryImpls";

export const handler = {
    googleCalendarSuccess: new GoogleCalendarSuccessUseCases(bookingRepository),
    googleCalendarFailed: new GoogleCalendarFailedUseCases(bookingRepository),
    providerSubscriptionPaymentSuccess: new UpdateSubscriptionAfterPaymentSuccessUseCase(subscriptionRepository, userRepository, providerProfileRepository, kafkaProducer, planRepository),
    providerSubscriptionPaymentFailed: new UpdateSubscriptionAfterPaymentFailedUseCase(subscriptionRepository),
    userBookingPaymentSuccess: new UpdateBookingAfterPaymentSuccessUseCase(bookingRepository, kafkaProducer, userRepository),
    userBookingPaymentFailed: new UpdateBookingAfterPaymentFailedUseCase(bookingRepository),
    stripeAccountCreated: new UpdateStripeAccountDataUseCase(userRepository),
    stripeCustomerCreated: new UpdateStripeCustomerCreatedUseCase(userRepository)
};
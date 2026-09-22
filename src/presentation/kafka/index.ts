import { kafkaProducer } from "../../infrastructure/messaging";
import { ProcessEventWrapperUseCase } from "../../application/useCases/kafka/processEventWrapper.useCase";
import { GoogleCalendarCreateEventFailedUseCases } from "../../application/useCases/kafka/googleCalendarFailed.useCase";
import { GoogleCalendarCreateEventSuccessUseCases } from "../../application/useCases/kafka/googleCalendarSuccess.useCase";
import { UpdateBookingAfterPaymentSuccessUseCase } from "../../application/useCases/kafka/updateBookingAfterPaymentSuccess.useCase";
import { UpdateSubscriptionAfterPaymentFailedUseCase } from "../../application/useCases/kafka/updateSubscriptionAfterPaymentFailed";
import { UpdateSubscriptionAfterPaymentSuccessUseCase } from "../../application/useCases/kafka/updateSubscriptionAfterPaymentSuccess";
import { bookingRepository, creditAccountRepository, creditTransactionRepository, planRepository, processedEventRepository, providerProfileRepository, referralRepository, subscriptionRepository, userRepository } from "../../infrastructure/repository";

export const processEventWrapperUseCase = new ProcessEventWrapperUseCase(processedEventRepository, kafkaProducer);

export const handler = {
    googleCalendarCreateEventSuccess: new GoogleCalendarCreateEventSuccessUseCases(bookingRepository),
    googleCalendarCreateEventFailed: new GoogleCalendarCreateEventFailedUseCases(bookingRepository),
    providerSubscriptionPaymentSuccess: new UpdateSubscriptionAfterPaymentSuccessUseCase(subscriptionRepository, userRepository, providerProfileRepository, kafkaProducer, planRepository, referralRepository, creditAccountRepository, creditTransactionRepository),
    providerSubscriptionPaymentFailed: new UpdateSubscriptionAfterPaymentFailedUseCase(subscriptionRepository),
    userBookingPaymentSuccess: new UpdateBookingAfterPaymentSuccessUseCase(bookingRepository, kafkaProducer, userRepository),
};
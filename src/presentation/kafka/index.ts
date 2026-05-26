import { kafkaProducer } from "../../infrastructure/messaging";
import { ProcessEventWrapperUseCase } from "../../application/useCases/kafka/processEventWrapper.useCase";
import { GoogleCalendarFailedUseCases } from "../../application/useCases/kafka/googleCalendarFailed.useCase";
import { GoogleCalendarSuccessUseCases } from "../../application/useCases/kafka/googleCalendarSuccess.useCase";
import { UpdateStripeAccountDataUseCase } from "../../application/useCases/kafka/updateStripeAccountData.useCase";
import { UpdateStripeAccountStatusUseCase } from "../../application/useCases/kafka/updateStripeAccountStatus.useCase";
import { UpdateStripeCustomerCreatedUseCase } from "../../application/useCases/kafka/updateStripeCustomerCreated.useCase";
import { UpdateBookingAfterPaymentSuccessUseCase } from "../../application/useCases/kafka/updateBookingAfterPaymentSuccess.useCase";
import { UpdateSubscriptionAfterPaymentSuccessUseCase } from "../../application/useCases/kafka/updateSubscriptionAfterPaymentSuccess";
import { bookingRepository, creditAccountRepository, creditTransactionRepository, planRepository, processedEventRepository, providerProfileRepository, referralRepository, subscriptionRepository, userRepository } from "../../infrastructure/repositoryImpls";

export const processEventWrapperUseCase = new ProcessEventWrapperUseCase(processedEventRepository, kafkaProducer);

export const handler = {
    googleCalendarSuccess: new GoogleCalendarSuccessUseCases(bookingRepository),
    googleCalendarFailed: new GoogleCalendarFailedUseCases(bookingRepository),
    providerSubscriptionPaymentSuccess: new UpdateSubscriptionAfterPaymentSuccessUseCase(subscriptionRepository, userRepository, providerProfileRepository, kafkaProducer, planRepository, referralRepository, creditAccountRepository, creditTransactionRepository),
    userBookingPaymentSuccess: new UpdateBookingAfterPaymentSuccessUseCase(bookingRepository, kafkaProducer, userRepository),
    stripeAccountCreated: new UpdateStripeAccountDataUseCase(userRepository),
    stripeCustomerCreated: new UpdateStripeCustomerCreatedUseCase(userRepository),
    stripeAccountUpdateStatus: new UpdateStripeAccountStatusUseCase(userRepository)
};
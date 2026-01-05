import { redis } from './lib/redis';
import { s3Client } from './lib/aws_s3';
import { kafkaConfig } from '../config/env';
import { OTPServiceImpl } from './services/otpService.impl';
import { UserQueriesImpl } from './queries/userQueries.impl';
import { ReviewQueriesImpl } from './queries/reviewQueries.impl';
import { BookingQueriesImpl } from './queries/bookingQueries.impl';
import { PaymentQueriesImpl } from './queries/paymentQueries.impl';
import { IUserQueries } from '../application/queries/IUser.queries';
import { ProviderQueriesImpl } from './queries/providerQueries.impl';
import { KafkaClientAdapter } from '../infrastructure/messaging/kafka';
import { SignedUrlServiceImpl } from './services/signedUrlService.impl';
import { GooglePassportStrategyImpl } from './passport/google.strategy';
import { IReviewQueries } from '../application/queries/IReview.queries';
import { PlanRepositoryImpl } from './database/plan/plan.repository.impl';
import { UserRepositoryImpl } from './database/user/user.repository.impl';
import { IBookingQueries } from '../application/queries/IBooking.queries';
import { IPaymentQueries } from '../application/queries/IPayment.queries';
import { GoogleTokenServiceImpl } from './services/googleTokenService.impl';
import { IProviderQueries } from '../application/queries/IProvider.queries';
import { SubscriptionQueriesImpl } from './queries/subscriptionQueries.impl';
import { KafkaServiceImpl } from '../infrastructure/services/kafkaService.impl';
import { AesEncryptionServiceImpl } from './services/aesEncryptionService.impl';
import { IOTPService } from '../domain/interfaces/services/IOtpService.service';
import { ReviewRepositoryImpl } from './database/review/review.repository.impl';
import { BookingRepositoryImpl } from './database/booking/booking.repository.impl';
import { AddressRepositoryImpl } from './database/address/address.repository.impl';
import { PaymentRepositoryImpl } from './database/payment/payment.repository.impl';
import { ServiceRepositoryImpl } from './database/service/service.repository.impl';
import { ProviderServiceQueriesImpl } from './queries/providerServiceQueries.impl';
import { ISubscriptionQueries } from '../application/queries/ISubscription.queries';
import { ISignedUrlService } from '../domain/interfaces/services/ISignedUrl.service';
import { IPlanRepository } from '../domain/interfaces/repositories/IPlan.repository';
import { IUserRepository } from '../domain/interfaces/repositories/IUser.repository';
import { ProviderRepositoryImpl } from './database/provider/provider.repository.impl';
import { GoogleCalendarGatewayServiceImpl } from './services/googleCalendarGatewayService.impl';
import { IReviewRepository } from '../domain/interfaces/repositories/IReview.repository';
import { IGoogleTokenService } from '../domain/interfaces/services/IGoogleToken.service';
import { IProviderServiceQueries } from '../application/queries/IProviderService.queries';
import { GoogleRefreshTokenServiceImpl } from './services/googleRefreshTokenService.impl';
import { IAddressRepository } from '../domain/interfaces/repositories/IAddress.repository';
import { IBookingRepository } from '../domain/interfaces/repositories/IBooking.repository';
import { IServiceRepository } from '../domain/interfaces/repositories/IService.repository';
import { IPaymentRepository } from '../domain/interfaces/repositories/IPayment.repository';
import { ServiceAvailabilityQueriesImpl } from './queries/serviceAvailabilityQueries.impl';
import { CredentialRepositoryImpl } from './database/credential/credential.repository.impl';
import { IAesEncryptionService } from '../domain/interfaces/services/IAesEncryption.service';
import { IProviderRepository } from '../domain/interfaces/repositories/IProvider.repository';
import { ICredentialRepository } from '../domain/interfaces/repositories/ICredentialRepository';
import { SubscriptionRepositoryImpl } from './database/subscription/subscription.repository.impl';
import { IServiceAvailabilityQueries } from '../application/queries/IServiceAvailability.queries';
import { ISubscriptionRepository } from '../domain/interfaces/repositories/ISubscription.repository';
import { IGoogleRefreshTokenService } from '../domain/interfaces/services/IGoogleRefreshToken.service';
import { IProviderServiceRepository } from '../domain/interfaces/repositories/IProviderService.repository';
import { ProviderServiceRepositoryImpl } from './database/providerService/providerService.repository.impl';
import { IGoogleCalendarGatewayService } from '../domain/interfaces/services/IGoogleCalendarGateway.service';
import { IServiceAvailabilityRepository } from '../domain/interfaces/repositories/IServiceAvailability.repository';
import { ServiceAvailabilityRepositoryImpl } from './database/serviceAvailability/serviceAvailability.repository.impl';
import { ISubscriptionMapping } from '../domain/interfaces/helper/ISubscriptionMapping.helper';
import { SubscriptionMappingImpl } from './helpers/subscriptionMapping';


// **** Repository instance **** //

// address repository instance
export const addressRepository: IAddressRepository = new AddressRepositoryImpl();

// booking repository instance
export const bookingRepository: IBookingRepository = new BookingRepositoryImpl();

// credential repository instance
export const credentialRepository: ICredentialRepository = new CredentialRepositoryImpl();

// payment repository instance
export const paymentRepository: IPaymentRepository = new PaymentRepositoryImpl();

// plan repository instance
export const planRepository: IPlanRepository = new PlanRepositoryImpl();

// provider repository instance
export const providerRepository: IProviderRepository = new ProviderRepositoryImpl();

// provider service repository instance
export const providerServiceRepository: IProviderServiceRepository = new ProviderServiceRepositoryImpl();

// review repository instance
export const reviewRepository: IReviewRepository = new ReviewRepositoryImpl();

// service repository instance
export const serviceRepository: IServiceRepository = new ServiceRepositoryImpl();

// service availability repository instance
export const serviceAvailabilityRepository: IServiceAvailabilityRepository = new ServiceAvailabilityRepositoryImpl();

// subscription repository instance
export const subscriptionRepository: ISubscriptionRepository = new SubscriptionRepositoryImpl();

// user repository instance
export const userRepository: IUserRepository = new UserRepositoryImpl();


// **** Queries instance **** //

// booking queries instance
export const bookingQueries: IBookingQueries = new BookingQueriesImpl();

// payment queries instance
export const paymentQueries: IPaymentQueries = new PaymentQueriesImpl();

// provider queries instance
export const providerQueries: IProviderQueries = new ProviderQueriesImpl();

// provider service querues instance
export const providerServiceQueries: IProviderServiceQueries = new ProviderServiceQueriesImpl();

// review queries instance
export const reviewQueries: IReviewQueries = new ReviewQueriesImpl();

// service availability queries instance
export const serviceAvailabilityQueries: IServiceAvailabilityQueries = new ServiceAvailabilityQueriesImpl();

// subscription queries instance
export const subscriptionQueries: ISubscriptionQueries = new SubscriptionQueriesImpl();

// user queries instance
export const userQueries: IUserQueries = new UserQueriesImpl();


// **** Service instance ****//

// Kafka client instance
export const kafkaClient = new KafkaClientAdapter(
  kafkaConfig.clientId!,
  kafkaConfig.brokers
);

export const kafkaService = new KafkaServiceImpl(kafkaClient);

export const initKafka = async () => {
  await kafkaClient.connectAdmin();
  await kafkaClient.createTopics(Object.values(kafkaConfig.topics));
  await kafkaClient.disconnectAdmin();

  await kafkaClient.connectProducer();
  await kafkaClient.connectConsumer(kafkaConfig.groupId);
};

export const getKafkaService = () => kafkaService;

// signed url service instance
export const signedUrlService: ISignedUrlService = new SignedUrlServiceImpl(redis, s3Client);

// otp service instance
export const otpService: IOTPService = new OTPServiceImpl();

// aesEncryption service instance
export const aesEncryptionService: IAesEncryptionService = new AesEncryptionServiceImpl();

// passport google stratergy instance
export const googlePassportStrategy = new GooglePassportStrategyImpl();

// google calendar service instance
export const googleCalendarGatewayService: IGoogleCalendarGatewayService = new GoogleCalendarGatewayServiceImpl();

// google refresh token service instance
export const googleRefreshTokenService: IGoogleRefreshTokenService = new GoogleRefreshTokenServiceImpl();

// google token service instance
export const googleTokenService: IGoogleTokenService = new GoogleTokenServiceImpl(credentialRepository, aesEncryptionService, googleRefreshTokenService);


// subscription mapping helper instance
export const subscriptionMapping: ISubscriptionMapping = new SubscriptionMappingImpl();
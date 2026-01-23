import { KafkaMessage } from "kafkajs";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { AdminVerificationStatus } from "../../domain/enums/adminVerificationStatus.enum";
import { AppConnect, OtpPurpose, Role } from "../../domain/enums/common.enum";
import { PaymentFor, PaymentGateway, PaymentStatus } from "../../domain/enums/payment.enum";

// kafka client adapter props
export interface KafkaClientAdapterProps {
  topic: string;
  partition: number;
  message: KafkaMessage;
}

// kafka client adapter message handler
export type MessageHandler = (payload: KafkaClientAdapterProps) => Promise<void>;


// **** KAFKA EVENTS PAYLOAD TYPES ****//

// send email common
export interface SendEmailCommon {
  email: string;
  name: string;
}

// send otp event for registration and password update
export interface SendOtpEvent extends SendEmailCommon {
  otp: string;
  purpose: OtpPurpose;
}

// send welcome event
export interface SendWelcomeEvent extends SendEmailCommon {
  role: Role;
}

// send reset password ( SendEmailCommon )

// send admin provider review event
export interface SendAdminProviderReviewEvent extends SendEmailCommon {
  status: AdminVerificationStatus;
  reason?: string;
}

// send account block status event
export interface SendAccountBlockStatusEvent extends SendEmailCommon {
  blocked: boolean;
  reason?: string;
  userId: string;
}

// send account trust status event
export interface SendAccountTrustStatusEvent extends SendEmailCommon {
  trusted: boolean;
  reason?: string;
  providerId: string;
}

// send appointment status change event
export interface SendAppointmentStatusChangeEvent extends SendEmailCommon {
  appointmentDate: string;
  appointmentTime: string;
  appointmentMode: string;
  appointmentStatus: AppointmentStatus;
  userId: string;
  providerId: string;
  userAccessToken: string;
  providerAccessToken: string;
}

// send user payment event
export interface SendUserPaymentEvent extends SendEmailCommon {
  amount: number;
  transactionId: string;
  paymentDate: string;
  appointmentDate: string;
  paymentStatus: PaymentStatus;
  paymentFor: PaymentFor;
}

// send provider payment event
export interface SendProviderPaymentEvent extends SendEmailCommon {
  amount: number;
  transactionId: string;
  paymentDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  paymentStatus: PaymentStatus;
  paymentFor: PaymentFor;
}

// send provider payout event
export interface SendProviderPayoutEvent extends SendEmailCommon {
  amount: number;
  transactionId: string;
  payoutDate: string;
}

// send app connect event
export interface SendAppConnectEvent extends SendEmailCommon {
  appConnect: AppConnect;
  userOrProviderId: string;
}

// send provider trial subscription event
export interface SendProviderTrialSubscriptionEvent extends SendEmailCommon {
  startDate: string;
  endDate: string;
}

// Added till this 

// send payment request event
export interface SendPaymentRequestEvent {
  transactionId: string,
  paymentStatus: string,
  paymentMethod: string,
  paymentGateway: PaymentGateway,
  paymentFor: PaymentFor,
  initialAmount: number,
  discountAmount: number,
  totalAmount: number,
  providerId?: string,
  userId?: string,
}

// create google calendar event
export interface CreateGoogleCalendarEvent {
  accessToken: string;
  appointmentDate: string;
  appointmentStatus: AppointmentStatus;
  slotDuration: number;
  bookingId: string;
}

// google calendar event response
export interface GoogleCalendarEventResponse {
  eventId: string;
  bookingId: string;
}

// update google calendar event
export interface UpdateGoogleCalendarEvent {
  accessToken: string;
  eventId: string;
  appointmentDate: string;
  appointmentStatus: AppointmentStatus;
  bookingId: string;
}
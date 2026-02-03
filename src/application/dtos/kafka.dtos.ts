import { ZodUUID } from "zod/v4";
import { KafkaMessage } from "kafkajs";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { AdminVerificationStatus } from "../../domain/enums/adminVerificationStatus.enum";
import { PaymentFor, PaymentGateway, PaymentMethod, PaymentStatus } from "../../domain/enums/payment.enum";
import { AppConnect, NotificationType, OtpPurpose, Role } from "../../domain/enums/common.enum";

// kafka client adapter props
export interface KafkaClientAdapterProps {
  topic: string;
  partition: number;
  message: KafkaMessage;
}

// kafka client adapter message handler
export type MessageHandler = (payload: KafkaClientAdapterProps) => Promise<void>;

// event envelope
export interface EventEnvelope<T> {
  eventId: ZodUUID;
  occurredAt: Date;
  attempt: number;
  maxAttempts: number;
  payload: T;
}


// **** KAFKA EVENTS PAYLOAD TYPES ****//

// send email common
export interface SendEmailCommon {
  email: string;
  name: string;
}

// send notification common
export interface SendNotificationCommon {
  body: string;
  pushNotification: boolean;
  title: string;
  data?: Record<string, string>;
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

// send reset password
export interface SendResetPasswordEvent extends SendEmailCommon { };

// send account block status event
export interface SendAccountBlockStatusEvent extends SendEmailCommon, SendNotificationCommon {
  blocked: boolean;
  userId: string;
  reason?: string;
}

// send admin provider review event
export interface SendAdminProviderReviewEvent extends SendEmailCommon, SendNotificationCommon {
  status: AdminVerificationStatus;
  userId: string;
  reason?: string;
}

// send account trust status event
export interface SendAccountTrustStatusEvent extends SendEmailCommon, SendNotificationCommon {
  trusted: boolean;
  userId: string; // providerId ( admin perspective it is user id )
  reason?: string;
}

// send appointment status change event for user
export interface SendAppointmentStatusChangeForUserEvent extends SendEmailCommon, SendNotificationCommon {
  userId: string;
  data: {
    appointmentDate: string;
    appointmentTime: string;
    appointmentMode: string;
    appointmentStatus: AppointmentStatus;
    notificationType: NotificationType;
  };
}

// send appointment status change event for provider
export interface SendAppointmentStatusChangeForProviderEvent extends SendNotificationCommon {
  userId: string;
  data: {
    appointmentDate: string;
    appointmentTime: string;
    appointmentMode: string;
    appointmentStatus: AppointmentStatus;
    notificationType: NotificationType;
  };
}

// send provider trial subscription event
export interface SendProviderTrialSubscriptionEvent extends SendEmailCommon, SendNotificationCommon {
  startDate: string;
  endDate: string;
  userId: string;
}

// send provider payment request event
export interface SendProviderPaymentRequestEvent {
  transactionId: string,
  paymentStatus: PaymentStatus,
  paymentMethod: PaymentMethod,
  paymentGateway: PaymentGateway,
  paymentFor: PaymentFor,
  initialAmount: number,
  discountAmount: number,
  totalAmount: number,
  providerId: string,
  subscriptionId: string;
  planDuration: number;
}

// send provider create payment failed event
export interface ProviderCreatePaymentFailedEvent {
    subscriptionId: string;
};

// send provider create payment success event
export interface ProviderCreatePaymentSuccessEvent {
    subscriptionId: string;
    paymentId: string;
    planDuration: number;
};

// Added till this 

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
export interface SendAppConnectEvent extends SendEmailCommon, SendNotificationCommon {
  appConnect: AppConnect;
  userId: string;
}


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








// Google Calendar dtos

// create google calendar event
export interface CreateGoogleCalendarEvent {
  bookingId: string;
  role: Role;
  accessToken: string;
  appointmentDate: Date;
  appointmentStatus: AppointmentStatus;
};

// create google calendar event success result
export interface CreateGoogleCalendarEventSuccessResult {
    bookingId: string;
    role: Role;
    eventId: string;
}

// create google calendar event failed result
export interface CreateGoogleCalendarEventFailedResult {
    bookingId: string;
    role: Role;
    error: string;
}

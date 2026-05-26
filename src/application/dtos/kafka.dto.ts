import { KafkaMessage } from "kafkajs";
import { PlanName } from "../../domain/enums/plan.enum";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { AdminVerificationStatus } from "../../domain/enums/adminVerificationStatus.enum";
import { AppConnect, NotificationType, OtpPurpose, Role, StripeAccountStatus } from "../../domain/enums/common.enum";

// **** KAFKA COMMON DTOS

// kafka client adapter props
export interface KafkaClientAdapterProps {
  topic: string;
  partition: number;
  message: KafkaMessage;
}

// backend-main service subscribing kafka event payload
export interface MBSSubKafkaEventPayload {
  mbsData: any;
}

// dlq metadata
export interface DqMetaData {
  service: string;
  originalTopic: string;
  error: string;
  failedAt: Date;
  retryCount?: number;
}

// event envelope
export interface EventEnvelope<MBSSubKafkaEventPayload, M = DqMetaData> {
  eventId: string;
  occurredAt: string;
  attempt: number;
  maxAttempts: number;
  payload: MBSSubKafkaEventPayload;
  metadata?: M;
}

// send email common
export interface SendEmailCommon {
  email: string;
  name: string;
}

// send notification common
export interface SendNotificationCommon {
  userId: string;
  body: string;
  pushNotification: boolean;
  title: string;
}

// kafka client adapter message handler
export type MessageHandler = (payload: KafkaClientAdapterProps) => Promise<void>;

// process event wrapper input
export interface ProcessEventWrapperInput {
  topic: string;
  eventData: EventEnvelope<MBSSubKafkaEventPayload>;
  businessUseCase: { execute: (data: any) => Promise<void> };
  payloadExtractor: (payload: MBSSubKafkaEventPayload) => any;
}





//// **** KAFKA EVENTS PAYLOAD **** ////

// **** publishing events

// send admin provider review event
export interface SendAdminProviderReviewEvent {
  emailData: SendEmailCommon & {
    status: AdminVerificationStatus;
    reason?: string;
  },
  notificationData: SendNotificationCommon;
}

// send account block status event
export interface SendAccountBlockStatusEvent {
  emailData: SendEmailCommon & {
    blocked: boolean;
    reason?: string;
  },
  notificationData: SendNotificationCommon;
}

// send account trust status event
export interface SendAccountTrustStatusEvent {
  emailData: SendEmailCommon & {
    trusted: boolean;
    reason?: string;
  },
  notificationData: SendNotificationCommon;
}

// send appointment status change event for user
export interface SendAppointmentStatusChangeForUserEvent {
  emailData: SendEmailCommon & {
    appointmentDate: string;
    appointmentTime: string;
    appointmentMode: string;
    appointmentStatus: AppointmentStatus;
  },
  notificationData: SendNotificationCommon,
}

// send appointment status change event for provider
export interface SendAppointmentStatusChangeForProviderEvent {
  notificationData: SendNotificationCommon & {
    data: {
      appointmentDate: string;
      appointmentTime: string;
      appointmentMode: string;
      appointmentStatus: AppointmentStatus;
      notificationType: NotificationType;
    };
  }
}

// send provider trial subscription event
export interface SendProviderTrialSubscriptionEvent {
  emailData: SendEmailCommon & {
    startDate: string;
    endDate: string;
  };
  notificationData: SendNotificationCommon;
}

// send provider subscription updated event
export interface ProviderSubscriptionUpdatedEvent {
  socketData: {
    providerId: string;
    subscribedPlan: PlanName;
    startDate: Date;
    endDate: Date;
    subscriptionStatus: SubscriptionStatus;
  },
  emailData: {
    email: string;
    name: string;
    subscribedPlan: PlanName;
    startDate: Date;
    endDate: Date;
  },
  notificationData: SendNotificationCommon;
}

// booking saved event
export interface BookingSavedEvent {
  emailData: {
    email: string;
    name: string;
    appointmentDate: Date;
    appointmentMode: string;
    appointmentStatus: AppointmentStatus
  },
  notificationData: SendNotificationCommon;
}

// got an appointment event
export interface GotAnAppointmentEvent {
  emailData: {
    email: string;
    name: string;
    appointmentDate: Date;
    appointmentMode: string;
    appointmentStatus: AppointmentStatus
  },
  notificationData: SendNotificationCommon
}

// create google calendar event
export interface CreateGoogleCalendarEvent {
  calendarData: {
    bookingId: string;
    role: Role;
    accessToken: string;
    appointmentDate: Date;
    appointmentStatus: AppointmentStatus;
  }
};

// send app connect event
export interface SendAppConnectEvent {
  emailData: SendEmailCommon & {
    appConnect: AppConnect;
  },
  notificationData: SendNotificationCommon
}

// send welcome event
export interface SendWelcomeEvent {
  emailData: SendEmailCommon & {
    role: Role;
  }
}

// send otp event for registration and password update
export interface SendOtpEvent {
  emailData: SendEmailCommon & {
    otp: string;
    purpose: OtpPurpose;
  }
}

// send reset password
export interface SendResetPasswordEvent {
  emailData: SendEmailCommon;
  notificationData: SendNotificationCommon;
};

// send update password
export interface SendUpdatePasswordEvent {
  notificationData: SendNotificationCommon;
}





// **** subscribing events

// create google calendar event success result
export interface CreateGoogleCalendarEventSuccessInput {
  bookingId: string;
  role: Role;
  eventId: string;
}

// create google calendar event failed result
export interface CreateGoogleCalendarEventFailedInput {
  bookingId: string;
  role: Role;
  error: string;
}

// consume stripe account created event
export interface StripeAccountCreatedEventInput {
  userId: string;
  stripeAccountId: string;
}

// consume stripe account update status event
export interface StripeAccountUpdateStatusEventInput {
  userId: string;
  accountStatus: StripeAccountStatus;
}

// used in update booking after payment success event
export interface UpdateBookingAfterPaymentSuccessEventInput {
  bookingId: string;
  paymentId: string;
}

// consume stripe customer created event
export interface UpdateStripeCustomerCreatedConsumeEventInput {
  userId: string;
  stripeCustomerId: string;
}

// send provider create payment success event
export interface ProviderCreatePaymentSuccessEventInput {
  subscriptionId: string;
  paymentId: string;
  planDuration: number;
  providerId: string;
};
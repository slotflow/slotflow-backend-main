import { KafkaMessage } from "kafkajs";
import { PlanName } from "../../domain/enums/plan.enum";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { AdminVerificationStatus } from "../../domain/enums/adminVerificationStatus.enum";
import { AppConnect, OtpPurpose, Role } from "../../domain/enums/common.enum";
import { NotificationType } from "./common.dto";

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

// Notification data common interface
interface CommonNotificationEventInput {
    userId: string;
    notificationType: NotificationType;
}





//// **** KAFKA EVENTS PAYLOAD **** ////

// **** publishing events

// send admin provider review event
export interface SendAdminProviderReviewEvent {
  emailData: SendEmailCommon & {
    status: AdminVerificationStatus;
    reason?: string;
  }
}

// send account block status event
export interface SendAccountBlockStatusEvent {
  emailData: SendEmailCommon & {
    blocked: boolean;
    reason?: string;
  }
}

// send account trust status event
export interface SendAccountTrustStatusEvent {
  emailData: SendEmailCommon & {
    trusted: boolean;
    reason?: string;
  },
  notificationData: CommonNotificationEventInput & {
    isTrusted: string;
  };
}

// send appointment status change event for user
export interface SendAppointmentStatusChangeForUserEvent {
  emailData: SendEmailCommon & {
    appointmentDate: string;
    appointmentTime: string;
    appointmentMode: string;
    appointmentStatus: AppointmentStatus;
  },
  notificationData: CommonNotificationEventInput & {
    appointmentStatus: string;
  },
}

// send appointment status change event for provider
export interface SendAppointmentStatusChangeForProviderEvent {
  notificationData: CommonNotificationEventInput & {
    appointmentDate: string;
    appointmentTime: string;
    appointmentMode: string;
    appointmentStatus: AppointmentStatus;
  }
}

// send provider subscription updated event
export interface ProviderSubscriptionUpdatedEvent {
  socketData: {
    userId: string;
    subscribedPlan: PlanName;
    startDate: Date;
    endDate: Date;
    subscriptionStatus: SubscriptionStatus;
    hasUsedTrial: boolean;
  },
  emailData: {
    email: string;
    name: string;
    subscribedPlan: PlanName;
    startDate: string;
    endDate: string;
    isTrial: string;
  },
  notificationData: CommonNotificationEventInput & {
    planName: string;
    isTrial: string;
    currentPeriodEnd: string;
  };
}

// booking saved event
export interface SlotBookedEvent {
  emailData: {
    email: string;
    name: string;
    appointmentDate: string;
    appointmentMode: string;
    appointmentStatus: AppointmentStatus,
    providerName: string;
  },
  notificationData: CommonNotificationEventInput & {
    appointmentDate: string;
    appointmentTime: string;
    providerName: string;
  };
}

// got an appointment event
export interface GotAnAppointmentEvent {
  emailData: {
    email: string;
    name: string;
    appointmentDate: string;
    appointmentMode: string;
    appointmentStatus: AppointmentStatus
    customerName: string;
  },
  notificationData: CommonNotificationEventInput & {
    appointmentDate: string;
    appointmentTime: string;
    customerName: string;
  }
}

// send app connect event
export interface SendAppConnectEvent {
  emailData: SendEmailCommon & {
    appConnect: AppConnect;
  },
  notificationData: CommonNotificationEventInput & {
    appName: string;
  }
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
};

// send update password
export interface SendUpdatePasswordEvent {
  notificationData: CommonNotificationEventInput & {
  };
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



// **** subscribing events

// create google calendar event success result
export interface GoogleCalendarCreateEventSuccessInput {
  bookingId: string;
  role: Role;
  eventId: string;
}

// create google calendar event failed result
export interface GoogleCalendarCreateEventEventFailedInput {
  bookingId: string;
  role: Role;
  error: string;
}

// used in update booking after payment success event
export interface UpdateBookingAfterPaymentSuccessEventInput {
  bookingId: string;
  paymentId: string;
}

// send provider subscription payment success event
export interface ProviderSubscriptionPaymentSuccessEventInput {
  subscriptionId: string;
  paymentId: string;
  providerId: string;
  isTrial: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
};

// send provider subscription payment failed event
export interface ProviderSubscriptionPaymentFailedEventInput {
  subscriptionId: string;
};
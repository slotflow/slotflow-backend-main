import { KafkaMessage } from "kafkajs";
import { PlanName } from "../../domain/enums/plan.enum";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { AdminVerificationStatus } from "../../domain/enums/adminVerificationStatus.enum";
import { AppConnect, NotificationType, OtpPurpose, Role } from "../../domain/enums/common.enum";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";

// **** COMMON DTOS

// kafka client adapter props
export interface KafkaClientAdapterProps {
    topic: string;
    partition: number;
    message: KafkaMessage;
}

// event envelope
export interface EventEnvelope<T> {
    eventId: string;
    occurredAt: string;
    attempt: number;
    maxAttempts: number;
    payload: T;
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





// **** KAFKA EVENTS PAYLOAD

// send otp event for registration and password update
export interface SendOtpEvent {
  emailData: SendEmailCommon & {
    otp: string;
    purpose: OtpPurpose;
  }
}

// send welcome event
export interface SendWelcomeEvent {
  emailData: SendEmailCommon & {
    role: Role;
  }
}

// send reset password
export interface SendResetPasswordEvent {
  emailData: SendEmailCommon;
  notificationData: SendNotificationCommon;
};

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

// send app connect event
export interface SendAppConnectEvent {
  emailData: SendEmailCommon & {
    appConnect: AppConnect;
  },
  notificationData: SendNotificationCommon
}

// send provider subscription updated event
export interface ProviderSubscriptionUpdatedEvent {
  ssData: {
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

// consume stripe account created event
export interface StripeAccountCreatedEvent {
  userId: string;
  stripeAccountId: string;
}

// Added till this 

// send provider payment request event
export interface SendProviderPaymentRequestEvent {
  transactionId: string;
  paymentStatus: String;
  paymentMethod: string;
  paymentGateway: string;
  paymentFor: string;
  initialAmount: number;
  discountAmount: number;
  totalAmount: number;
  providerId: string;
  subscriptionId: string;
  planDuration: number;
}

// send user payment event
export interface SendUserPaymentEvent extends SendEmailCommon {
  amount: number;
  transactionId: string;
  paymentDate: string;
  appointmentDate: string;
  paymentStatus: string;
  paymentFor: string;
}

// send provider payment event
export interface SendProviderPaymentEvent extends SendEmailCommon {
  amount: number;
  transactionId: string;
  paymentDate: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  paymentStatus: string;
  paymentFor: string;
}

// send provider payout event
export interface SendProviderPayoutEvent extends SendEmailCommon {
  amount: number;
  transactionId: string;
  payoutDate: string;
}

// send payment request event
export interface SendPaymentRequestEvent {
  transactionId: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentGateway: string;
  paymentFor: string;
  initialAmount: number;
  discountAmount: number;
  totalAmount: number;
  providerId?: string;
  userId?: string;
}

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

export interface GotAnAppointment {
  emailData: {
    email: string;
    name: string;
    appointmentDate: Date;
    appointmentMode: string;
    appointmentStatus: AppointmentStatus
  },
  notificationData: SendNotificationCommon
}






// Google Calendar dtos

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

// create google calendar event success result
export interface CreateGoogleCalendarEventSuccessResult {
  mbsData: {
    bookingId: string;
    role: Role;
    eventId: string;
  }
}

// create google calendar event failed result
export interface CreateGoogleCalendarEventFailedResult {
  mbsData: {
    bookingId: string;
    role: Role;
    error: string;
  }
}



// Consumer Events
export interface UpdateStripeCustomerCreatedConsumeEvent {
  userId: string;
  stripeCustomerId: string;
}
import { KafkaMessage } from "kafkajs";
import { PlanName } from "../../domain/enums/plan.enum";
import { AddressProps } from "../../domain/contracts/address.contract";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { NotificationType, OtpPurpose, Role } from "../../domain/enums/common.enum";
import { AdminVerificationStatus } from "../../domain/enums/adminVerificationStatus.enum";

/**
 * Kafka common dtos
 */

// kafka client adapter props
export interface KafkaClientAdapterProps {
  topic: string;
  partition: number;
  message: KafkaMessage;
}

// backend-main service subscribing kafka event payload
export interface MBSSubKafkaEventPayload<T extends MBSEventPayload = MBSEventPayload> {
  mbsData: T;
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
  occurredAt: Date;
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
export interface ProcessEventWrapperInput<T extends MBSEventPayload = MBSEventPayload> {
  topic: string;
  eventData: EventEnvelope<MBSSubKafkaEventPayload<T>>;
  businessUseCase: { execute: (input: T) => Promise<void> };
}

// Notification data common interface
interface CommonNotificationEventInput {
  userId: string;
  notificationType: NotificationType;
}

/**
 * Kafka events payload
 */

// publishing events

// send admin provider review event
export interface SendAdminProviderReviewEvent {
  emailData: SendEmailCommon & {
    status: AdminVerificationStatus;
    reason?: string;
  };
}

// send account block status event
export interface SendAccountBlockStatusEvent {
  emailData: SendEmailCommon & {
    blocked: boolean;
    reason?: string;
  };
}

// send account trust status event
export interface SendAccountTrustStatusEvent {
  emailData: SendEmailCommon & {
    trusted: boolean;
    reason?: string;
  };
  notificationData: CommonNotificationEventInput & {
    isTrusted: string;
  };
}

// send appointment status change event for user
export type ProviderAddressForUser =
  | (Omit<
      AddressProps,
      "_id" | "updatedAt" | "createdAt" | "userId" | "phone" | "place" | "district" | "country"
    > & {
      googleMapsUrl?: string;
    })
  | null;
export interface SendAppointmentStatusChangeForUserEvent {
  emailData: SendEmailCommon & {
    appointmentDate: string;
    appointmentTime: string;
    appointmentMode: string;
    appointmentStatus: AppointmentStatus;
    address?: ProviderAddressForUser;
  };
  notificationData: CommonNotificationEventInput & {
    appointmentStatus: string;
    address?: ProviderAddressForUser;
  };
}

// send appointment status change event for provider
export interface SendAppointmentStatusChangeForProviderEvent {
  notificationData: CommonNotificationEventInput & {
    appointmentDate: string;
    appointmentTime: string;
    appointmentMode: string;
    appointmentStatus: AppointmentStatus;
  };
}

// send provider subscription updated event
export interface ProviderSubscriptionUpdatedEvent {
  socketData: {
    userId: string;
    subscribedPlan: PlanName;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    subscriptionStatus: SubscriptionStatus;
    hasUsedTrial: boolean;
  };
  emailData: {
    email: string;
    name: string;
    subscribedPlan: PlanName;
    startDate: string;
    endDate: string;
    isTrial: string;
  };
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
    appointmentStatus: AppointmentStatus;
    providerName: string;
  };
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
    appointmentStatus: AppointmentStatus;
    customerName: string;
  };
  notificationData: CommonNotificationEventInput & {
    appointmentDate: string;
    appointmentTime: string;
    customerName: string;
  };
}

// send welcome event
export interface SendWelcomeEvent {
  emailData: {
    email: string;
    name?: string;
  };
}

// send otp event for registration and password update
export interface SendOtpEvent {
  emailData: {
    email: string;
    otp: string;
    purpose: OtpPurpose;
  };
}

// send reset password
export interface SendResetPasswordEvent {
  emailData: SendEmailCommon;
}

// send update password
export interface SendUpdatePasswordEvent {
  notificationData: CommonNotificationEventInput & {};
}

// create google calendar event
export interface CreateGoogleCalendarEvent {
  calendarData: {
    bookingId: string;
    role: Role;
    userId: string;
    appointmentDate: Date;
    appointmentStatus: AppointmentStatus;
    slotDuration: number;
  };
}

// subscribing events

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

// used in update booking after payment failed
export interface UpdateBookingPaymentFailedEventInput {
  bookingId: string;
}

// send provider subscription payment success event
export interface ProviderSubscriptionPaymentSuccessEventInput {
  subscriptionId: string;
  paymentId: string;
  providerId: string;
  isTrial: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelAt: Date;
  lastEventAt: Date;
}

// send provider subscription payment failed event
export interface ProviderSubscriptionPaymentFailedEventInput {
  subscriptionId: string;
}

export type MBSEventPayload =
  | ProviderSubscriptionPaymentFailedEventInput
  | ProviderSubscriptionPaymentSuccessEventInput
  | UpdateBookingPaymentFailedEventInput
  | UpdateBookingAfterPaymentSuccessEventInput
  | GoogleCalendarCreateEventEventFailedInput
  | GoogleCalendarCreateEventSuccessInput;

export type PayloadMap = {
  googleCalendarCreateEventSuccess: GoogleCalendarCreateEventSuccessInput;
  googleCalendarCreateEventFailed: GoogleCalendarCreateEventEventFailedInput;
  providerSubscriptionPaymentSuccess: ProviderSubscriptionPaymentSuccessEventInput;
  providerSubscriptionPaymentFailed: ProviderSubscriptionPaymentFailedEventInput;
  userBookingPaymentSuccess: UpdateBookingAfterPaymentSuccessEventInput;
  userBookingPaymentFailed: UpdateBookingPaymentFailedEventInput;
};

export type HandlerMap = {
  [K in keyof PayloadMap]: { execute: (input: PayloadMap[K]) => Promise<void> };
};

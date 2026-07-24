import { AdminVerificationStatus } from "../../domain/enums/adminVerificationStatus.enum";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { AppConnect, StripeAccountStatus } from "../../domain/enums/common.enum";
import { IdType } from "./types";

// used as the Event data
export enum EventData {
  eventTitle = "Slotflow Appointment",
  eventAddBorderColor = "#635bff",
  eventAddTextColor = "#ffffff",
  eventCancelBorderColor = "#ff0000",
  eventCancelTextColor = "#ffffff",
  eventTimeZone = "Asia/Kolkata",
};

export const notificationContentMap: Record<string, {
  title: string;
  body: (...args: any[]) => string;
}> = {
  passwordReset: {
    title: "Password Reset",
    body: () =>
      `password has been reset successfully.`
  },
  passwordUpdate: {
    title: "Password Updated",
    body: () =>
      `password has been updated successfully.`
  },
  appConnect: {
    title: "App Connect",
    body: (appConnect: AppConnect) =>
      `Your account has been connected with ${appConnect}.`
  },
  accountBlockStatus: {
    title: "Account Blocked",
    body: (isBlocked: boolean) =>
      `Your account has been ${isBlocked ? "blocked" : "unblocked"}.`
  },
  adminProviderReview: {
    title: "Provider Review",
    body: (status: AdminVerificationStatus) =>
      `Your account has been ${status === AdminVerificationStatus.APPROVED ? "approved" : "rejected"}.`
  },
  accountTrustStatus: {
    title: "Account Trust Status",
    body: (isTrusted: boolean) =>
      `Your account has been ${isTrusted ? "trusted" : "untrusted"}.`
  },
  appointmentStatusChangeForUser: {
    title: "Booking Status Updated",
    body: (appointmentStatus: AppointmentStatus) =>
      `Your booking has been ${appointmentStatus.toLowerCase()}.`
  },
  appointmentStatusChangeForProvider: {
    title: "Appointment Status Updated",
    body: (appointmentStatus: AppointmentStatus) =>
      `Your appointment has been ${appointmentStatus.toLowerCase()}.`
  },
  providerTrialSubscription: {
    title: "Trial Subscription",
    body: () =>
      `Your trial subscription has been activated.`
  },
  resetPassword: {
    title: "Password Reset",
    body: () =>
      `Your password has been reset successfully.`
  },
  slotBooked: {
    title: "Slot Booked",
    body: (appointmentDate: string) =>
      `Your slot has been booked for ${appointmentDate}.`
  },
  planSubscribed: {
    title: "Plan Subscribed",
    body: () =>
      `Your subscription has been Confirmed.`
  },
  gotAnAppointment: {
    title: "Got an Appointment",
    body: (appointmentDate: string) =>
      `You have got an appointment for ${appointmentDate}.`
  },
  stripeAccountStatusUpdated: {
    title: "Stripe Account Status",
    body: (accountStatus: StripeAccountStatus) => {
      switch (accountStatus) {
        case StripeAccountStatus.PENDING:
          return `Your stripe account activation is pending.`;
        case StripeAccountStatus.RESTRICTED:
          return `Your stripe account is restricted.`;
        case StripeAccountStatus.ACTIVE:
          return `Your stripe account is now active. You can now receive payments`;
        case StripeAccountStatus.REVOKED:
          return `Your stripe application has been revoked.`;
        default:
          return "Your stripe account status has been updated.";
      }
    }
  },
  stripeAccountCreated: {
    title: "Stripeonboarding completed",
    body: () =>
      `Your stripe account has been created successfully. You can receive payments once your account status will be activated`
  }
};

export const daysOfWeek: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const PREFIX_MAP: Record<IdType, string> = {
  [IdType.EVENT]: "sf_evt_",
  [IdType.TRANSACTION]: "sf_trx_",
  [IdType.ROOM]: "sf_room_",
  [IdType.IDEMPOTENCY]: "sf_idem_",
  [IdType.FILE]: "sf_file_",
  [IdType.REFERRAL]: "sf_ref_",
  [IdType.CREDIT_TRANSACTION]: "sf_crtsn"
};

export const BASE36 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
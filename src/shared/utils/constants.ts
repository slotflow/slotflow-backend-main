import { AdminVerificationStatus } from "../../domain/enums/adminVerificationStatus.enum";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { AppConnect } from "../../domain/enums/common.enum";

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
      `assword has been reset successfully.`
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
      `Your booking has been ${appointmentStatus}.`
  },
  appointmentStatusChangeForProvider: {
    title: "Appointment Status Updated",
    body: (appointmentStatus: AppointmentStatus) =>
      `Your appointment has been ${appointmentStatus}.`
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
  }
};
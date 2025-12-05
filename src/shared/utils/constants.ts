// Used as the role values
export const roleArray = ["ADMIN","USER","PROVIDER"] as const;

// Used as the day array
export const daysArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

// Used as the subscription valididty values
export const subscriptionMonthArray = ["1 Month", "3 Months", "6 Months", "12 Months"] as const;

// Used as the service mode
export const serviceModeArray = ["online", "offline","both"] as const;

// Used as the service type
export const serviceTypeArray = ["one-time", "recurring"] as const;

// Used as the appointment status
export const appointmentStatusArray = ["Booked", "Completed", "Cancelled", "RejectedByProvider", "NotAttended", "Confirmed"] as const;

// Used as the paymentFor
export const paymentForArray = ["ProviderSubscription", "AppointmentBooking", "ProviderPayout", "CancelBooking"] as const;

// Used as the payment gateway
export const paymentGatewayArray = ["Stripe", "Razorpay", "Paypal"] as const;

// Used as the subscipriotn status
export const subscriptionStatusArray = ["Active", "Expired", "Cancelled"] as const;

// used as the Event data
export enum EventData {
    eventTitle = "Slotflow Appointment",
    eventAddBorderColor = "#635bff",
    eventAddTextColor = "#ffffff",
    eventCancelBorderColor = "#ff0000",
    eventCancelTextColor = "#ffffff",
    eventTimeZone = "Asia/Kolkata",
}
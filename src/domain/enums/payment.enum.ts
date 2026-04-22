export enum PaymentFor {
    PROVIDER_SUBSCRIPTION = "PROVIDER_SUBSCRIPTION",
    APPOINTMENT_BOOKING = "APPOINTMENT_BOOKING",
    PROVIDER_PAYOUT = "PROVIDER_PAYOUT",
    CANCEL_BOOKING = "CANCEL_BOOKING",
    CANCEL_SUBSCRIPTION = "CANCEL_SUBSCRIPTION",
};

export enum PaymentGateway {
    STRIPE = "STRIPE",
    RAZORPAY = "RAZORPAY",
    PAYPAL = "PAYPAL"
};

export enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED",
};

export enum RefundReason {
    DUPLICATE= "duplicate",
    FRAUDUKENT= "fraudulent",
    REQUESTED_BY_CUSTOMER= "requested_by_customer"
}

export enum RefundFor {
    CANCEL_BOOKING = "CANCEL_BOOKING",
    CANCEL_SUBSCRIPTION = "CANCEL_SUBSCRIPTION",
}
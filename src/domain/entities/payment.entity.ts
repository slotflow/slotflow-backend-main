import { PaymentProps } from "../contracts/payment.contract";
import { CreateForBookingProps, CreateForSubscriptionProps, UpdatePaymentProps } from "../commands/payment.commands";

export class Payment {

    private props: PaymentProps;

    constructor(props: PaymentProps) {
        this.props = props;
    }

    private touch() {
        this.props.updatedAt = new Date();
    }

    static createforSubscription(props: CreateForSubscriptionProps) {
        return new Payment({
            _id: "",
            transactionId: props.transactionId,
            paymentStatus: props.paymentStatus,
            paymentMethod: props.paymentMethod,
            paymentGateway: props.paymentGateway,
            paymentFor: props.paymentFor,
            initialAmount: props.initialAmount,
            discountAmount: props.discountAmount,
            providerId: props.providerId,
            totalAmount: props.totalAmount,
            chargeId: null,
            refundAmount: null,
            refundAt: null,
            refundId: null,
            refundReason: null,
            refundStatus: null,
            userId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }

    static createForBooking(props: CreateForBookingProps) {
        return new Payment({
            _id: "",
            transactionId: props.transactionId,
            paymentStatus: props.paymentStatus,
            paymentMethod: props.paymentMethod,
            paymentGateway: props.paymentGateway,
            paymentFor: props.paymentFor,
            initialAmount: props.initialAmount,
            discountAmount: props.discountAmount,
            providerId: props.providerId,
            totalAmount: props.totalAmount,
            chargeId: null,
            refundAmount: null,
            refundAt: null,
            refundId: null,
            refundReason: null,
            refundStatus: null,
            userId: props.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }

    // Getters

    get _id(): string {
        return this.props._id
    }

    // Business Methods

    getProps(): Readonly<PaymentProps> {
        return {...this.props}
    }

    updatePayment(props: UpdatePaymentProps) {
        this.props = {
            ...this.props,
            ...props,
        };

        this.touch();
    }
}
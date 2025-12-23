import { PaymentFor } from "../enums/paymentFor.enum";
import { PaymentProps } from "../contracts/payment.contract";
import { PaymentMethod } from "../enums/paymentMethod.enum";
import { PaymentStatus } from "../enums/paymentStatus.enum";
import { PaymentGateway } from "../enums/paymentGateway.enum";
import { CreateForBookingProps, CreateForSubscriptionProps, UpdatePaymentProps } from "../commands/payment.commands";

export class Payment {

    private props: PaymentProps;

    constructor(props: PaymentProps) {
        this.props = props;
    };

    private touch() {
        this.props.updatedAt = new Date();
    };

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
    };

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
    };

    // Getters

    get _id(): string {
        return this.props._id
    };

    get createdAt(): Date {
        return this.props.createdAt;
    };

    get discountAmount(): number {
        return this.props.discountAmount;
    };

    get paymentFor(): PaymentFor {
        return this.props.paymentFor;
    };

    get paymentGateway(): PaymentGateway {
        return this.props.paymentGateway;
    };

    get paymentMethod(): PaymentMethod {
        return this.props.paymentMethod;
    };

    get paymentStatus(): PaymentStatus {
        return this.props.paymentStatus;
    };

    get totalAmount(): number {
        return this.props.totalAmount;
    };

    // Business Methods

    getProps(): Readonly<PaymentProps> {
        return { ...this.props }
    };

    update(props: UpdatePaymentProps) {
        this.props = {
            ...this.props,
            ...props,
        };

        this.touch();
    };
}
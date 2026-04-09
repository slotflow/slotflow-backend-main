import { SubscriptionStatus } from "../enums/subscription.enum";
import { SubscriptionProps } from "../contracts/subscription.contract";
import { CreateSubscriptionInitialProps, CreateSubscriptionProps, SubscriptionPaymentSuccessProps } from "../commands/subscription.commands";

export class Subscription {
    private props: SubscriptionProps;

    constructor(props: SubscriptionProps) {
        this.props = props;
    };

    private touch() {
        this.props.updatedAt = new Date();
    };

    static createInitialData(props: CreateSubscriptionInitialProps): Subscription {
        return new Subscription({
            _id: "",
            ...props,
            startDate: null,
            endDate: null,
            subscriptionStatus: SubscriptionStatus.PENDING,
            paymentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }

    static create(props: CreateSubscriptionProps) {
        return new Subscription({
            _id: "",
            ...props,
            startDate: props.startDate,
            endDate: props.endDate,
            subscriptionStatus: props.subscriptionStatus,
            paymentId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    };

    // Getters
    get _id(): string {
        return this.props._id;
    };

    get subscriptionStatus(): SubscriptionStatus {
        return this.props.subscriptionStatus;
    };

    get endDate(): Date {
        if (!this.props.endDate) {
            throw new Error("No endDate found");
        }
        return this.props.endDate;
    };

    get startDate(): Date {
        if (!this.props.startDate) {
            throw new Error("No startDate found");
        }
        return this.props.startDate;
    };

    get subscriptionPlanId(): string {
        return this.props.subscriptionPlanId;
    }

    // Business Methods

    getProps(): Readonly<SubscriptionProps> {
        return { ...this.props };
    };

    subscriptionPaymentFailed() {
        this.props.subscriptionStatus = SubscriptionStatus.FAILED;
        this.touch();
    };

    subscriptionPaymentSuccess(props: SubscriptionPaymentSuccessProps) {
        this.props.subscriptionStatus = SubscriptionStatus.ACTIVE;
        this.props.startDate = props.startDate;
        this.props.endDate = props.endDate;
        this.props.paymentId = props.paymentId;
        this.touch();
    };
}
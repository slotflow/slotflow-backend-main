import { SubscriptionStatus } from "../enums/subscription.enum";
import { SubscriptionProps } from "../contracts/subscription.contract";
import { CreateSubscriptionInitialProps, SubscriptionPaymentSuccessProps } from "../commands/subscription.commands";

export class Subscription {
    private props: SubscriptionProps;

    constructor(props: SubscriptionProps) {
        this.props = props;
    };

    private touch() {
        this.props.updatedAt = new Date();
    };

    static createInitialData(props: CreateSubscriptionInitialProps): Subscription {
        const now = new Date();
        return new Subscription({
            _id: "",
            providerId: props.providerId,
            subscribedPlanId: props.subscribedPlanId,
            subscriptionStatus: SubscriptionStatus.INCOMPLETE,
            currentPeriodStart: null,
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            cancelAt: null,
            lastEventAt: now,
            paymentId: null,
            createdAt: now,
            updatedAt: now,
        })
    }

    // Getters
    get _id(): string {
        return this.props._id;
    }

    get providerId(): string {
        return this.props.providerId;
    }

    get subscribedPlanId(): string {
        return this.props.subscribedPlanId;
    }

    get currentPeriodStart(): Date | null {
        return this.props.currentPeriodStart;
    }

    get currentPeriodEnd(): Date | null {
        return this.props.currentPeriodEnd;
    }

    get subscriptionStatus(): SubscriptionStatus {
        return this.props.subscriptionStatus;
    }

    get cancelAtPeriodEnd(): boolean | null {
        return this.props.cancelAtPeriodEnd;
    }

    get cancelAt(): Date | null {
        return this.props.cancelAt;
    }

    get lastEventAt(): Date | null {
        return this.props.lastEventAt;
    }

    get paymentId(): string | null {
        return this.props.paymentId;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    // Business Methods

    getProps(): Readonly<SubscriptionProps> {
        return { ...this.props };
    };

    subscriptionPaymentFailed() {
        this.props.subscriptionStatus = SubscriptionStatus.PAYMENT_FAILED;
        this.touch();
    };

    subscriptionPaymentSuccess(props: SubscriptionPaymentSuccessProps) {
        this.props.subscriptionStatus = SubscriptionStatus.ACTIVE;
        this.props.currentPeriodStart = props.currentPeriodStart;
        this.props.currentPeriodEnd = props.currentPeriodEnd;
        this.props.paymentId = props.paymentId;
        this.props.cancelAtPeriodEnd = props.cancelAtPeriodEnd;
        this.props.cancelAt = props.cancelAt;
        this.props.lastEventAt = props.lastEventAt;
        this.touch();
    };
}
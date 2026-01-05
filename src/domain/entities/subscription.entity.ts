import { SubscriptionProps } from "../contracts/subscription.contract";
import { CreateSubscriptionProps, UpdateSubscriptionProps } from "../commands/subscription.commands";
import { SubscriptionStatus } from "../enums/subscriptionStatus.enum";

export class Subscription {
    private props: SubscriptionProps;

    constructor(props: SubscriptionProps) {
        this.props = props;
    };

    private touch() {
        this.props.updatedAt = new Date();
    };

    static create(props: CreateSubscriptionProps) {
        return new Subscription({
            _id: "",
            ...props,
            paymentId: props.paymentId ?? null,
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
        return this.props.endDate;
    };

    get subscriptionPlanId(): string {
        return this.props.subscriptionPlanId;
    }

    // Business Methods

    getProps(): Readonly<SubscriptionProps> {
        return { ...this.props };
    };

    updateSubscription(props: UpdateSubscriptionProps) {
        this.props = {
            ...this.props,
            ...props,
        };
        this.touch();
    }
}
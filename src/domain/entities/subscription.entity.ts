import { SubscriptionProps } from "../contracts/subscription.contract";
import { CreateSubscriptionProps, UpdateSubscriptionProps } from "../commands/subscription.commands";

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
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    };

    // Getters
    get _id(): string {
        return this.props._id;
    };

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
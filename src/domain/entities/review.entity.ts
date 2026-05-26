import { ReviewProps } from "../contracts/review.contract";
import { CreateReviewDProps, UpdateReviewProps } from "../commands/review.commands";

export class Review {
    private props: ReviewProps;

    constructor(props: ReviewProps) {
        this.props = props;
    };

    private touch() {
        this.props.updatedAt = new Date();
    };

    static create(props: CreateReviewDProps): Review {
        return new Review({
            _id: "",
            ...props,
            isBlocked: false,
            reported: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    };

    // Getters

    get _id(): string {
        return this.props._id;
    };

    get isBlocked(): boolean {
        return this.props.isBlocked;
    };

    get providerId(): string {
        return this.props.providerId;
    };

    get reported(): boolean {
        return this.props.reported;
    };

    get userId(): string {
        return this.props.userId;
    };

    // Business Methods

    getProps(): Readonly<ReviewProps> {
        return { ...this.props };
    };

    update(props: UpdateReviewProps) {
        this.props = {
            ...this.props,
            ...props,
        };
        this.touch();
    };

    block() {
        this.props.isBlocked = true;
        this.touch();
    };

    unblock() {
        this.props.isBlocked = false,
            this.touch();
    };

    report() {
        this.props.reported = true;
        this.touch();
    };

    unreport() {
        this.props.reported = false;
        this.touch();
    };

}
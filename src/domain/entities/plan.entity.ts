import { PlanProps } from "../contracts/plan.contract";
import { CreatePlanProps, UpdatePlanProps } from "../commands/plan.commands";

export class Plan {
    private props: PlanProps;

    constructor(props: PlanProps) {
        this.props = props;
    }

    private touch() {
        this.props.updatedAt = new Date();
    }

    static create(props: CreatePlanProps) {
        return new Plan({
            _id: "",
            adVisibility: props.adVisibility,
            description: props.description,
            features: props.features,
            isBlocked: props.isBlocked,
            maxBookingPerMonth: props.maxBookingPerMonth,
            planName: props.planName,
            price: props.price,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }

    // Getters

    get _id(): string {
        return this.props._id;
    };

    get planName(): string {
        return this.props.planName;
    };

    // Business Method
    getProps(): Readonly<PlanProps> {
        return { ...this.props };
    };

    block() {
        this.props.isBlocked = true;
        this.touch();
    };

    unblock() {
        this.props.isBlocked = false;
        this.touch();
    };

    update(props: UpdatePlanProps) {
        this.props = {
            ...this.props,
            ...props
        };
        this.touch();
    };

}
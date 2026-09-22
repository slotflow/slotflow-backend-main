import { PlanProps } from "../contracts/plan.contract";
import { PlanName, StripeSyncStatus } from "../enums/plan.enum";
import { CreatePlanProps, StripePlanDetails, UpdatePlanProps } from "../commands/plan.commands";

export class Plan {
    private props: PlanProps;

    constructor(props: PlanProps) {
        this.props = props;
    }

    private touch() {
        this.props.updatedAt = new Date();
    }

    static create(props: CreatePlanProps): Plan {
        return new Plan({
            _id: "",
            adVisibility: props.adVisibility,
            description: props.description,
            features: props.features,
            maxBookingPerMonth: props.maxBookingPerMonth,
            planName: props.planName,
            monthlyPrice: props.monthlyPrice,
            yearlyPrice: props.yearlyPrice,
            stripePlanDetails: null,
            stripeSync: StripeSyncStatus.PENDING,
            isBlocked: false,
            hasTrial: props.hasTrial,
            trialDays: props.trialDays,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }

    // Getters

    get _id(): string {
        return this.props._id;
    };

    get planName(): PlanName {
        return this.props.planName;
    };

    get adVisibility(): boolean {
        return this.props.adVisibility;
    };

    get isBlocked(): boolean {
        return this.props.isBlocked;
    };

    get maxBookingPerMonth(): number {
        return this.props.maxBookingPerMonth;
    };

    get monthlyPrice(): number {
        return this.props.monthlyPrice;
    };

    get yearlyPrice(): number {
        return this.props.yearlyPrice;
    };

    get description(): string {
        return this.props.description;
    };

    get features(): string[] {
        return this.props.features;
    };

    get stripeSync(): StripeSyncStatus {
        return this.props.stripeSync;
    }

    get stripePlanDetails(): StripePlanDetails | null {
        return this.props.stripePlanDetails;
    }

    get hasTrial(): boolean {
        return this.props.hasTrial;
    }

    get trialDays(): number {
        return this.props.trialDays;
    }

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

    stripeSynced() {
        this.props.stripeSync = StripeSyncStatus.SYNCED;
        this.touch();
    }

    isStripeSyncPending() {
        return this.props.stripeSync === StripeSyncStatus.PENDING;
    }


}
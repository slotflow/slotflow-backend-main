import { ReferralStatus } from "../enums/common.enum";
import { ReferralProps } from "../contracts/referral.contract";
import { CreateReferralProps, UpdateReferralStatusProps } from "../commands/referral.commands";

export class Referral {
    constructor(private props: ReferralProps) {}

    static create(input: CreateReferralProps): Referral {
        const referral = new Referral({
            _id: "",
            referrerUserId: input.referrerUserId,
            refereeUserId: input.refereeUserId,
            referralCode: input.referralCode,
            status: ReferralStatus.PENDING,
            rewardGiven: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return referral;
    }

    static fromPersistence(props: ReferralProps): Referral {
        return new Referral(props);
    }

    // Getters
    get _id(): string {
        return this.props._id;
    }

    get referrerUserId(): string {
        return this.props.referrerUserId;
    }

    get refereeUserId(): string {
        return this.props.refereeUserId;
    }

    get referralCode(): string {
        return this.props.referralCode;
    }

    get status(): ReferralStatus {
        return this.props.status;
    }

    get rewardGiven(): boolean {
        return this.props.rewardGiven;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get completedAt(): Date | undefined {
        return this.props.completedAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    // Methods
    completeReferral(): void {
        this.props.status = ReferralStatus.COMPLETED;
        this.props.completedAt = new Date();
        this.touch();
    }

    rewardReferral(): void {
        this.props.status = ReferralStatus.REWARDED;
        this.props.rewardGiven = true;
        this.touch();
    }

    updateStatus(props: UpdateReferralStatusProps): void {
        this.props.status = props.status;
        this.touch();
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }

    // Get persistence props
    getPersistenceProps(): ReferralProps {
        return { ...this.props };
    }
}

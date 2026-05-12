import { CreditTransactionProps } from "../contracts/creditTransation.contract";
import { CreditTransactionType, CreditTransactionSource, CreditTransactionStatus } from "../enums/creditTransaction.enum";
import { CreateCreditTransactionProps, UpdateCreditTransactionStatusProps } from "../commands/creditTransaction.commands";

export class CreditTransaction {
    constructor(private props: CreditTransactionProps) {}

    static create(props: CreateCreditTransactionProps): CreditTransaction {
        return new CreditTransaction({
            _id: "",
            accountId: props.accountId,
            userId: props.userId,
            type: props.type,
            credits: props.credits,
            balanceAfter: props.balanceAfter,
            source: props.source,
            status: CreditTransactionStatus.SUCCESS,
            referenceId: props.referenceId,
            idempotencyKey: props.idempotencyKey,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    static fromPersistence(props: CreditTransactionProps): CreditTransaction {
        return new CreditTransaction(props);
    }

    // Getters
    get _id(): string {
        return this.props._id;
    }

    get accountId(): string {
        return this.props.accountId;
    }

    get userId(): string {
        return this.props.userId;
    }

    get type(): CreditTransactionType {
        return this.props.type;
    }

    get credits(): number {
        return this.props.credits;
    }

    get balanceAfter(): number {
        return this.props.balanceAfter;
    }

    get source(): CreditTransactionSource {
        return this.props.source;
    }

    get status(): CreditTransactionStatus {
        return this.props.status;
    }

    get referenceId(): string | undefined {
        return this.props.referenceId;
    }

    get idempotencyKey(): string | undefined {
        return this.props.idempotencyKey;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    // Methods
    updateStatus(props: UpdateCreditTransactionStatusProps): void {
        this.props.status = props.status;
        this.touch();
    }

    markAsFailed(): void {
        this.props.status = CreditTransactionStatus.FAILED;
        this.touch();
    }

    markAsSuccess(): void {
        this.props.status = CreditTransactionStatus.SUCCESS;
        this.touch();
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }

    // Get persistence props
    getPersistenceProps(): CreditTransactionProps {
        return { ...this.props };
    }
}

import { CreditAccountProps } from "../contracts/creditAccount.contract";
import { CreateCreditAccountProps, UpdateCreditAccountBalanceProps, DeactivateCreditAccountProps } from "../commands/creditAccount.commands";

export class CreditAccount {
    constructor(private props: CreditAccountProps) {}

    static create(props: CreateCreditAccountProps): CreditAccount {
        return new CreditAccount({
            _id: "",
            userId: props.userId,
            balance: 0,
            isActive: true,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    static fromPersistence(props: CreditAccountProps): CreditAccount {
        return new CreditAccount(props);
    }

    // Getters
    get _id(): string {
        return this.props._id;
    }

    get userId(): string {
        return this.props.userId;
    }

    get balance(): number {
        return this.props.balance;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    get version(): number {
        return this.props.version;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    // Methods
    updateBalance(props: UpdateCreditAccountBalanceProps): void {
        if (props.version !== this.props.version) {
            throw new Error("Concurrent modification detected");
        }
        this.props.balance = props.balance;
        this.props.version += 1;
        this.touch();
    }

    deactivate(props: DeactivateCreditAccountProps): void {
        if (props.version !== this.props.version) {
            throw new Error("Concurrent modification detected");
        }
        this.props.isActive = false;
        this.props.version += 1;
        this.touch();
    }

    activate(): void {
        this.props.isActive = true;
        this.props.version += 1;
        this.touch();
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }

    // Get persistence props
    getPersistenceProps(): CreditAccountProps {
        return { ...this.props };
    }
}

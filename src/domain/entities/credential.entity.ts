import { CredentialProps } from "../contracts/credential.contract";
import { CreateCredentialProps, UpdateCredentialProps } from "../commands/credential.commands";

export class Credential {
    private props: CredentialProps;

    constructor(props: CredentialProps) {
        this.props = props;
    }

    private touch() {
        this.props.updatedAt = new Date();
    }

    static create(props: CreateCredentialProps) {
        return new Credential({
            _id: "",
            accessToken: props.accessToken,
            expiryDate: props.expiryDate,
            refreshToken: props.refreshToken,
            userId: props.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    }

    // Getters
    get _id(): string {
        return this.props._id;
    };

    get accessToken(): string {
        return this.props.accessToken;
    };

    get refreshToken(): string {
        return this.props.refreshToken;
    };

    get expiryDate(): Date {
        return this.props.expiryDate;
    };

    get userId(): string {
        return this.props.userId;
    };

    get createdAt(): Date {
        return this.props.createdAt;
    };

    get updatedAt(): Date {
        return this.props.updatedAt;
    };

    // Business Methods

    getProps(): Readonly<CredentialProps> {
        return { ...this.props }
    };

    updateCredential(props: UpdateCredentialProps) {
        this.props = {
            ...this.props,
            ...props,
        };

        this.touch();
    };

}
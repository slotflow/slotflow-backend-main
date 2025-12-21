import { ServiceProps } from "../contracts/service.contract";
import { CreateServiceProps, UpdateServiceProps } from "../commands/service.commands";

export class Service {
    private props: ServiceProps;

    constructor(props: ServiceProps) {
        this.props = props;
    };

    private touch() {
        this.props.updatedAt = new Date();
    }

    static create(props: CreateServiceProps) {
        return new Service({
            _id: "",
            ...props,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }

    // Getters

    get _id(): string {
        return this.props._id;
    }

    // Business Methods

    getProps(): Readonly<ServiceProps> {
        return { ...this.props };
    };

    block() {
        this.props.isBlocked = true;
        this.touch();
    };

    unblock() {
        this.props.isBlocked = false;
        this.touch();
    }

    updateService(props: UpdateServiceProps) {
        this.props = {
            ...this.props,
            ...props,
        }
        this.touch();
    };
}
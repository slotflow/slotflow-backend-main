import { ServiceProps } from "../contracts/service.contract";
import { ServiceCategory } from "../enums/service.enum";
import { CreateServiceProps, UpdateServiceProps } from "../commands/service.commands";

export class Service {
    private props: ServiceProps;

    constructor(props: ServiceProps) {
        this.props = props;
    };

    private touch() {
        this.props.updatedAt = new Date();
    }

    static create(props: CreateServiceProps): Service {
        return new Service({
            _id: "",
            ...props,
            isBlocked: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }

    // Getters

    get _id(): string {
        return this.props._id;
    };

    get isBlocked(): boolean {
        return this.props.isBlocked;
    };

    get serviceName(): string {
        return this.props.serviceName;
    };

    get serviceCategory(): ServiceCategory {
        return this.props.serviceCategory;
    };

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
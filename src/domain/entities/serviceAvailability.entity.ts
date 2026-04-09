import { ServiceAvailabilityProps } from "../contracts/serviceAvailability.contract";
import { CreateServiceAvailabilityProps, UpdateServiceAvailabilityProps } from "../commands/serviceAvailability.commands";

export class ServiceAvailability {
    private props: ServiceAvailabilityProps;

    constructor(props: ServiceAvailabilityProps) {
        this.props = props;
    };

    private touch() {
        this.props.updatedAt = new Date();
    };

    static create(props: CreateServiceAvailabilityProps): ServiceAvailability {
        return new ServiceAvailability({
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

    getProps(): Readonly<ServiceAvailabilityProps> {
        return { ...this.props };
    };

    update(props: UpdateServiceAvailabilityProps) {
        this.props = {
            ...this.props,
            ...props,
        };
        this.touch();
    };

}
import { Availability, ServiceAvailabilityProps } from "../contracts/serviceAvailability.contract";
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
            providerId: props.providerId,
            availabilities: props.availabilities.map((availability) => ({
                day: availability.day,
                isAvailable: availability.isAvailable,
                duration: availability.isAvailable ? availability.duration : undefined,
                startTime: availability.isAvailable ? availability.startTime : undefined,
                endTime: availability.isAvailable ? availability.endTime : undefined,
                modes: availability.isAvailable ? availability.modes : undefined,
                slots: availability.isAvailable ? availability.slots : undefined,
            })),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    };

    // Getters

    get _id(): string {
        return this.props._id;
    };

    get availabilities(): Availability[] {
        return this.props.availabilities;
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
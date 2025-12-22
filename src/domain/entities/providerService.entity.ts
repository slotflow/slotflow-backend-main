import { ProviderServiceProps } from '../contracts/providerService.contract';
import { CreateProviderServiceProps, UpdateProviderServiceProps } from '../commands/providerService.commands';

export class ProviderService {
    private props: ProviderServiceProps;

    constructor(props: ProviderServiceProps) {
        this.props = props;
    };

    private touch() {
        this.props.updatedAt = new Date();
    };

    static create(props: CreateProviderServiceProps) {
        return new ProviderService({
            _id: "",
            ...props,
            requirements: props.requirements ?? null,
            videoUrl: props.videoUrl ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    };

    // Getters

    get _id(): string {
        return this.props._id
    }

    // Business Methods

    getProps(): Readonly<ProviderServiceProps> {
        return { ...this.props };
    };

    update(props: UpdateProviderServiceProps) {
        if (props.servicePrice <= 0) {
            throw new Error("Service price must be greater than zero");
        }

        this.props = {
            ...this.props,
            ...props
        };
        this.touch();
    };
}
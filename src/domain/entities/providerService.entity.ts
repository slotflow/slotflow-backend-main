import { ProviderServiceProps } from '../contracts/providerService.contract';
import { CreateProviderServiceProps, UpdateProviderServiceProps } from '../commands/providerService.commands';
import { ServiceMode, ServiceType } from '../enums/service.enum';

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
        return this.props._id;
    };

    get providerId(): string {
        return this.props.providerId;
    };

    get service(): string {
        return this.props.service;
    };

    get serviceName(): string {
        return this.props.serviceName;
    };

    get serviceDescription(): string {
        return this.props.serviceDescription;
    };

    get servicePrice(): number {
        return this.props.servicePrice;
    };

    get serviceExperience(): string {
        return this.props.serviceExperience;
    };

    get serviceType(): ServiceType {
        return this.props.serviceType;
    };

    get serviceMode(): ServiceMode {
        return this.props.serviceMode;
    };

    get tags(): string[] | [] {
        return this.props.tags;
    };

    get requirements(): string | null {
        return this.props.requirements;
    };

    get videoUrl(): string | null {
        return this.props.videoUrl;
    };

    get maxParticipants(): number {
        return this.props.maxParticipants;
    };

    get isGroupService(): boolean {
        return this.props.isGroupService;
    };

    get createdAt(): Date {
        return this.props.createdAt;
    };

    get updatedAt(): Date {
        return this.props.updatedAt;
    };

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
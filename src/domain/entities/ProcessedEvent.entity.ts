import { EventStatus } from "../enums/common.enum";
import { ProcessedEventProps } from "../contracts/processedEvent.contract";
import { CreateProcessedEventProps } from "../commands/processedEvent.commands";

export class ProcessedEvent {
    private props: ProcessedEventProps;

    constructor(props: ProcessedEventProps) {
        this.props = props;
    };

    private touch() {
        this.props.updatedAt = new Date();
    };

    static create(props: CreateProcessedEventProps): ProcessedEvent {
        return new ProcessedEvent({
            eventId: props.eventId,
            topic: props.topic,
            status: props.status,
            processedAt: props.processedAt,
            retryCount: props.retryCount,
            maxRetry: props.maxRetry,
            payload: props.payload,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    // Business Methods

     getProps(): ProcessedEventProps {
        return this.props;
    };

    markAsSuccess() {
        this.props.status = EventStatus.SUCCESS;
        this.touch();
    }

    markAsFailed() {
        this.props.status = EventStatus.FAILED;
        this.touch();
    }
}
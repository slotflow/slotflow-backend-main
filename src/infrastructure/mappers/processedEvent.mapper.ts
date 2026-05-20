import { ProcessedEvent } from "../../domain/entities/processedEvent.entity";
import { IProcessedEvent } from "../models/processedEvent.model";

export class ProcessedEventMapper {
    static toDomain(raw: any): ProcessedEvent {
        return new ProcessedEvent({
            eventId: raw.eventId,
            topic: raw.topic,
            status: raw.status,
            processedAt: raw.processedAt,
            retryCount: raw.retryCount,
            maxRetry: raw.maxRetry,
            payload: raw.payload,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    static toPersistence(entity: ProcessedEvent): Partial<IProcessedEvent> {
        const props = entity.getProps();
        return {
            eventId: props.eventId,
            topic: props.topic,
            status: props.status,
            processedAt: props.processedAt,
            retryCount: props.retryCount,
            maxRetry: props.maxRetry,
            payload: props.payload,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}

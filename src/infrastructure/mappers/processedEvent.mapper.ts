import { ProcessedEvent } from "../../domain/entities/processedEvent.entity";
import { IProcessedEvent } from "../models/processedEvent.model";

export class ProcessedEventMapper {
  static toDomain(doc: IProcessedEvent): ProcessedEvent {
    return new ProcessedEvent({
      _id: doc._id.toString(),
      eventId: doc.eventId,
      topic: doc.topic,
      status: doc.status,
      processedAt: doc.processedAt,
      retryCount: doc.retryCount,
      maxRetry: doc.maxRetry,
      payload: doc.payload,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
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

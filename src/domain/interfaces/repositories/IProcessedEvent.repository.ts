import { ClientSession } from "mongoose";
import { ProcessedEvent } from "../../entities/processedEvent.entity";

export interface IProcessedEventRepository {
    create(event: ProcessedEvent, session?: ClientSession): Promise<ProcessedEvent | null>;

    findByEventId(eventId: string): Promise<ProcessedEvent | null>;
    
    update(event: ProcessedEvent, session?: ClientSession): Promise<ProcessedEvent | null>;
}

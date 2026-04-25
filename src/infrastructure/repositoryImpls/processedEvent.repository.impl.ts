import { ClientSession } from "mongoose";
import { ProcessedEventModel } from "../models/processedEvent.model";
import { ProcessedEventMapper } from "../mappers/processedEvent.mapper";
import { ProcessedEvent } from "../../domain/entities/ProcessedEvent.entity";
import { IProcessedEventRepository } from "../../domain/interfaces/repositories/IProcessedEvent.repository";

export class ProcessedEventRepositoryImpl implements IProcessedEventRepository {
    async create(event: ProcessedEvent, session?: ClientSession): Promise<ProcessedEvent | null> {
        const doc = await ProcessedEventModel.create(
            [ProcessedEventMapper.toPersistence(event)],
            { session }
        );
        return doc && doc.length > 0 ? ProcessedEventMapper.toDomain(doc[0]) : null;
    }

    async findByEventId(eventId: string): Promise<ProcessedEvent | null> {
        const doc = await ProcessedEventModel.findOne({ eventId }).lean();
        return doc ? ProcessedEventMapper.toDomain(doc) : null;
    }

    async update(event: ProcessedEvent, session?: ClientSession): Promise<ProcessedEvent | null> {
        const persistence = ProcessedEventMapper.toPersistence(event);

        const doc = await ProcessedEventModel.findOneAndUpdate(
            { eventId: persistence.eventId },
            { $set: persistence },
            { new: true, session }
        ).lean();
        return doc ? ProcessedEventMapper.toDomain(doc) : null;
    }
}

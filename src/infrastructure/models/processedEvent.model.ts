import mongoose, { Document, Schema } from "mongoose";
import { EventStatus } from "../../domain/enums/common.enum";

export interface IProcessedEvent extends Document {
    eventId: string;
    topic: string;
    status: EventStatus;
    processedAt: Date;
    retryCount: number;
    maxRetry: number;
    payload: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProcessedEventSchema = new Schema<IProcessedEvent>({
    eventId: {
        type: String,
        required: true,
        unique: true
    },
    topic: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(EventStatus),
    },
    processedAt: {
        type: Date,
        default: Date.now,
        expires: '7d'
    },
    retryCount: {
        type: Number,
        required: true,
    },
    maxRetry: {
        type: Number,
        required: true,
    },
    payload: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true
    },
    updatedAt: {
        type: Date,
        required: true
    }
});

export const ProcessedEventModel = mongoose.model<IProcessedEvent>('ProcessedEvent', ProcessedEventSchema);

import { EventStatus } from "../enums/common.enum";

export interface ProcessedEventProps {
  _id: string;
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

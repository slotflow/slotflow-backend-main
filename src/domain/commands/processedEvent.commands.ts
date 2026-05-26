import { ProcessedEventProps } from "../contracts/processedEvent.contract";

export type CreateProcessedEventProps = Pick<ProcessedEventProps, "eventId" | "topic" | "status" | "retryCount" | "maxRetry" | "payload" | "processedAt">;
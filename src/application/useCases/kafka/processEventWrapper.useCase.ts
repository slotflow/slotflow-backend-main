import { kafkaConfig } from "../../../config/env";
import { log } from "../../../shared/logger/logger";
import { EventStatus } from "../../../domain/enums/common.enum";
import { ProcessedEvent } from "../../../domain/entities/ProcessedEvent.entity";
import { DqMetaData, EventEnvelope, ProcessEventWrapperInput } from "../../dtos/kafka.dto";
import { IKafkaProducerAdapter } from "../../../domain/interfaces/messaging/IKafkaProducerAdapter";
import { IProcessedEventRepository } from "../../../domain/interfaces/repositories/IProcessedEvent.repository";

export class ProcessEventWrapperUseCase {
    constructor(
        private processedEventRepository: IProcessedEventRepository,
        private kafkaProducer: IKafkaProducerAdapter
    ) {}

    async execute<T>(input: ProcessEventWrapperInput<T>): Promise<void> {
        const { businessUseCase, eventData, topic } = input;
        const { eventId, attempt, maxAttempts, payload: { mbsData} } = eventData;

        let processedEvent = await this.processedEventRepository.findByEventId(eventId);

        if (processedEvent) {
            const props = processedEvent.getProps();
            
            if (props.status === EventStatus.SUCCESS) {
                log.info(`Idempotency Event ${eventId} already processed successfully. Skipping.`);
                return;
            }
            
            if (props.status === EventStatus.PENDING) {
                log.info(`Idempotency Event ${eventId} is currently PENDING. Proceeding with retry attempt ${attempt}.`);
            }
        } else {
            const newProcessedEvent = ProcessedEvent.create({
                eventId,
                topic,
                status: EventStatus.PENDING,
                retryCount: attempt - 1,
                maxRetry: maxAttempts,
                payload: JSON.stringify(eventData),
                processedAt: new Date()
            });
            processedEvent = await this.processedEventRepository.create(newProcessedEvent);
        }

        if (!mbsData) {
            log.error(`Kafka Invalid payload for event ${eventId}`);
            if (processedEvent) {
                processedEvent.markAsFailed();
                await this.processedEventRepository.update(processedEvent);
            }
            return;
        }

        try {
            await businessUseCase.execute(mbsData);
            if (processedEvent) {
                processedEvent.markAsSuccess();
                await this.processedEventRepository.update(processedEvent);
            }

        } catch (error) {
            log.error(`Kafka Event ${eventId} failed on attempt ${attempt}.`, error as Error);
            if (processedEvent) {
                processedEvent.markAsFailed();
                await this.processedEventRepository.update(processedEvent);
            }

            if (attempt < maxAttempts) {
                log.info(`Kafka Retrying event ${eventId}. Publishing attempt ${attempt + 1}/${maxAttempts}`);
                await this.kafkaProducer.publish(topic, {
                    ...eventData,
                    attempt: attempt + 1,
                    occurredAt: new Date(),
                });
            } else {
                log.error(`Kafka Event ${eventId} exhausted all ${maxAttempts} attempts. Moving to DLQ (or dropping).`);
                
                await this.kafkaProducer.publish<EventEnvelope<{ mbsData: T }, DqMetaData>>(kafkaConfig.topics.dlqTopic, {
                    ...eventData,
                    metadata: {
                        originalTopic: topic,
                        error: (error as Error).message,
                        failedAt: new Date()
                    }
                });
            }
        }
    }
}

import { Kafka, Producer } from "kafkajs";
import { log } from "../../shared/logger/logger";
import { AppError } from "../../shared/error/appError";
import { ERROR_CODES } from "../../shared/utils/types";
import { IKafkaProducerAdapter } from "../../domain/interfaces/messaging/IKafkaProducerAdapter";

export class KafkaProducerAdapter implements IKafkaProducerAdapter {
    private producer!: Producer;

    constructor(
        private readonly kafka: Kafka
    ) { };

    async connectProducer(): Promise<void> {
        try {
            this.producer = this.kafka.producer();
            await this.producer.connect();

            log.info("Kafka producer connected");
        } catch (error) {
            log.error("Kafka producer connect failed:", error as Error);

            throw new AppError(
                "Kafka producer connection failed",
                500,
                false,
                ERROR_CODES.KAFKA_PRODUCER_CONNECT_FAILED
            );
        }
    }

    async publish<T>(topic: string, input: T): Promise<void> {
        try {
            const payload = JSON.stringify(input); // may throw

            await this.producer.send({
                topic,
                messages: [{ value: payload }],
            });

        } catch (error) {
            log.error(`Kafka publish failed [topic=${topic}]`, error as Error);

            throw new AppError(
                "Kafka publish failed",
                500,
                false,
                ERROR_CODES.KAFKA_PUBLISH_FAILED
            );
        }
    }

    async disconnectProducer(): Promise<void> {
        try {
            await this.producer.disconnect();
            log.info("Kafka producer disconnected");
        } catch (error) {
            log.error("Kafka producer disconnect failed:", error as Error);

            throw new AppError(
                "Kafka producer disconnect failed",
                500,
                false,
                ERROR_CODES.KAFKA_PRODUCER_DISCONNECT_FAILED
            );
        }
    }

};
import { Kafka, Producer } from "kafkajs";
import { log } from "../../shared/logger/logger";
import { IKafkaProducerAdapter } from "../../domain/interfaces/message/IKafkaProducerAdapter";

export class KafkaProducerAdapter implements IKafkaProducerAdapter {
    private producer!: Producer;

    constructor(
        private readonly kafka: Kafka
    ) { };

    async connectProducer(): Promise<void> {
        this.producer = this.kafka.producer();
        await this.producer.connect();
        log.info("Kafka producer connected");
    }

    async publish<T>(topic: string, payload: T): Promise<void> {
        await this.producer.send({
            topic,
            messages: [{ value: JSON.stringify(payload) }],
        });
    }

};
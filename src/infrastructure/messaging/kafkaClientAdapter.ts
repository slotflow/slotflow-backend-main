import { log } from "../../shared/logger/logger";
import { Kafka, Consumer, Producer, logLevel } from "kafkajs";
import { MessageHandler } from "../../application/dtos/common.dto";
import { IKafkaClientAdapter } from "../../domain/interfaces/message/IKafkaClientAdapter";

export class KafkaClientAdapter implements IKafkaClientAdapter {
  private kafka: Kafka;
  private consumer!: Consumer;
  private producer!: Producer;
  private handlers = new Map<string, MessageHandler>();

  constructor(
    clientId: string,
    private groupId: string,
    brokers: string[]
  ) {
    this.kafka = new Kafka({
      clientId,
      brokers,
      logLevel: logLevel.ERROR,
    });
  }

  async connectConsumer(): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId: this.groupId });
    await this.consumer.connect();
    log.info(`Kafka consumer connected [group=${this.groupId}]`);
  }

  async subscribe(topic: string, handler: MessageHandler): Promise<void> {
    await this.consumer.subscribe({ topic, fromBeginning: true });
    this.handlers.set(topic, handler);
    log.info(`Subscribed to topic: ${topic}`);
  }

  async startConsumer(): Promise<void> {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const handler = this.handlers.get(topic);
        if (!handler) return;
        await handler({ topic, partition, message });
      },
    });

    log.info("Kafka consumer running");
  }


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
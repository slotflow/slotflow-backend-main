import { log } from "../../shared/logger/logger";
import { Kafka, logLevel, Admin, Producer, Consumer } from "kafkajs";

export class KafkaClientAdapter {

  private kafka: Kafka;
  private admin!: Admin;
  private producer!: Producer;
  private consumer!: Consumer;

  constructor(private clientId: string, private brokers: string[]) {
    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.brokers,
      logLevel: logLevel.ERROR,
    });
  };

  async connectAdmin(): Promise<void> {
    this.admin = this.kafka.admin();
    await this.admin.connect();
    log.info("Kafka Admin connected");
  };

  async createTopics(topics: string[]): Promise<void> {
    if (!this.admin) throw new Error("Admin not connected");

    await this.admin.createTopics({
      topics: topics.map((t) => ({
        topic: t,
        numPartitions: 1,
        replicationFactor: 1,
      })),
    });
    console.log("topics : ", topics)
    log.info("Kafka Topics created:");
  };

  async disconnectAdmin(): Promise<void> {
    if (this.admin) {
      await this.admin.disconnect();
      log.info("Kafka Admin disconnected");
    };
  };

  async connectProducer(): Promise<void> {
    this.producer = this.kafka.producer();
    await this.producer.connect();
    log.info("Kafka Producer connected");
  };

  getProducer(): Producer {
    if (!this.producer) throw new Error("Producer not connected");
    return this.producer;
  };

  async connectConsumer(groupId: string): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId });
    await this.consumer.connect();
    log.info(`Kafka Consumer connected (group: ${groupId})`);
  };

  getConsumer(): Consumer {
    if (!this.consumer) throw new Error("Consumer not connected");
    return this.consumer;
  };

  async subscribe(topic: string): Promise<void> {
    if (!this.consumer) throw new Error("Consumer not connected");

    await this.consumer.subscribe({ topic, fromBeginning: false });
    log.info(`Subscribed to topic: ${topic}`);
  };

  async runConsumer(
    callback: (payload: { topic: string; partition: number; message: any }) => Promise<void>
  ): Promise<void> {
    if (!this.consumer) throw new Error("Consumer not connected");

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await callback({ topic, partition, message });
      },
    });

    log.info("Kafka Consumer running…");
  };
};

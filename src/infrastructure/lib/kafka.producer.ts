import { Kafka, logLevel, Producer } from "kafkajs";

export class KafkaProducerService {
  private producer!: Producer;

  constructor(private clientId: string, private brokers: string[]) {}

  async connect(): Promise<void> {
    const kafka = new Kafka({ 
      clientId: this.clientId, 
      brokers: this.brokers,
      logLevel: logLevel.ERROR, 
    });
    this.producer = kafka.producer();
    await this.producer.connect();
    console.log("✅ Kafka producer connected");
  }

  getProducer(): Producer {
    if (!this.producer) throw new Error("Kafka producer not connected");
    return this.producer;
  }
}


export const kafkaProducerService = new KafkaProducerService(
  "slotflow-mainBackend-service",
  ["localhost:9092"]
);

export const connectKafkaProducer = async () => {
  await kafkaProducerService.connect();
};

import { KafkaController } from "../../presentation/kafka/kafka.controller";
import { kafkaConsumer, kafkaProducer } from "../../infrastructure/messaging";

export const kafkaController = new KafkaController(kafkaConsumer);

export const initKafka = async () => {
    await kafkaConsumer.connectConsumer();
    await kafkaProducer.connectProducer();
    await kafkaController.startListening();
};

export const stopKafka = async () => {
    await kafkaConsumer.disconnectConsumer();
    await kafkaProducer.disconnectProducer();
};
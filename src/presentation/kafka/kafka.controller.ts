import { kafkaConfig } from "../../config/env";
import { log } from "../../shared/logger/logger";
import { handler, processEventWrapperUseCase } from ".";
import { HandlerMap } from "../../application/dtos/kafka.dto";
import { kafkaConsumer } from "../../infrastructure/messaging";
import { IKafkaConsumerAdapter } from "../../application/interfaces/messaging/IKafkaConsumer.adapter";
import { ProcessEventWrapperUseCase } from "../../application/useCases/kafka/processEventWrapper.useCase";

class KafkaController {
  constructor(
    private readonly kafkaConsumer: IKafkaConsumerAdapter,
    private readonly processEventWrapperUseCase: ProcessEventWrapperUseCase,
  ) {
    this.startListening = this.startListening.bind(this);
  }

  private async register<K extends keyof HandlerMap>(topic: string, useCase: HandlerMap[K]) {
    await this.kafkaConsumer.subscribe(topic, async ({ message }) => {
      if (!message.value) return;
      const eventData = JSON.parse(message.value.toString());
      await this.processEventWrapperUseCase.execute({
        businessUseCase: useCase,
        eventData,
        topic,
      });
    });
  }

  async startListening(): Promise<void> {
    try {
      log.info("start listening kafka controller");

      for (const [key, topic] of Object.entries(kafkaConfig.topics.sub)) {
        const useCase = handler[key as keyof HandlerMap];
        if (!useCase) continue;
        await this.register(topic, useCase);
      }

      await this.kafkaConsumer.startConsumer();
    } catch (error) {
      log.error("KafkaController startListening failed : ", { error });
    }
  }
}

export const kafkaController = new KafkaController(kafkaConsumer, processEventWrapperUseCase);

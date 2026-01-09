// message instance

import { kafkaConfig } from "../../config/env";
import { KafkaClientAdapter } from "./kafkaClientAdapter";
import { IKafkaClientAdapter } from "../../domain/interfaces/message/IKafkaClientAdapter";

export const kafkaClientAdapter: IKafkaClientAdapter = new KafkaClientAdapter(
  kafkaConfig.clientId,
  kafkaConfig.groupId,
  [kafkaConfig.broker1, kafkaConfig.broker2, kafkaConfig.broker3]
);

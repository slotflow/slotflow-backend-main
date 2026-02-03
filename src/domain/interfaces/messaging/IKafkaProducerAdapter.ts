export interface IKafkaProducerAdapter {

  connectProducer(): Promise<void>;

  publish<T>(topic: string, payload: T): Promise<void>;

};

import { otelSDK } from '../../infrastructure/observability/otel';

export const initOtel = async () => {
  await otelSDK.start();
};

export const stopOtel = async () => {
  await otelSDK.shutdown();
};
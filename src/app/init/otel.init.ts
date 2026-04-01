import { otelSDK } from '../../infrastructure/observability/otel';

export const initOtel = () => {
  otelSDK.start();
};

export const stopOtel = () => {
  otelSDK.shutdown();
};
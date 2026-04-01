import { NodeSDK } from '@opentelemetry/sdk-node';
import { appConfig, otelConfig } from '../../config/env';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const traceExporter = new OTLPTraceExporter({
  url: otelConfig.otelExporterOtlpEndpoint,
});

const metricExporter = new OTLPMetricExporter({
  url: otelConfig.otelExporterOtlpEndpoint,
});

const logExporter = new OTLPLogExporter({
  url: otelConfig.otelExporterOtlpEndpoint,
})

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 10000,
});

export const otelSDK = new NodeSDK({
  serviceName: appConfig.serviceName,
  traceExporter,
  metricReader,
  instrumentations: [getNodeAutoInstrumentations()],
});


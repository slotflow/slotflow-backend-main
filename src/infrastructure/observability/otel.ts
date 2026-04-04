import { NodeSDK } from '@opentelemetry/sdk-node';
import { appConfig, otelConfig } from '../../config/env';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

const traceExporter = new OTLPTraceExporter({
  url: otelConfig.otelExporterOtlpTracesEndpoint,
});

const metricExporter = new OTLPMetricExporter({
  url: otelConfig.otelExporterOtlpMetricsEndpoint,
});

const logExporter = new OTLPLogExporter({
  url: otelConfig.otelExporterOtlpLogsEndpoint,
})

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 10000,
});

const logRecordProcessor = new BatchLogRecordProcessor(logExporter);

export const otelSDK = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: appConfig.serviceName,
    [ATTR_SERVICE_VERSION]: '1.0.0',
    environment: appConfig.isDev ? 'development' : 'production',
  }),
  traceExporter,
  metricReader,
  logRecordProcessor,
  instrumentations: [
    new WinstonInstrumentation({
      disableLogSending: false,
      logSeverity: 0,
    }),
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-winston': { enabled: false },
    }),
  ],
});


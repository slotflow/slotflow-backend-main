import path from "path";
import winston from "winston";
import { existsSync, mkdirSync } from "fs";
import { appConfig } from "../../config/env";
import { OpenTelemetryTransportV3 } from "@opentelemetry/winston-transport";

const logsDir = path.resolve("logs");

if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
});

type LogMeta = Record<string, unknown>;

const consoleFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  ...(appConfig.isDev ? [winston.format.colorize({ all: true })] : []),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const details = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";

    return `[${timestamp}] [${level}]: ${stack ?? message}${details}`;
  }),
);

const jsonFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp(),
  winston.format.json(),
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

if (appConfig.isDev) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: jsonFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: jsonFormat,
    }),
  );
}

transports.push(new OpenTelemetryTransportV3());

const logger = winston.createLogger({
  levels: logLevels,
  level: appConfig.isDev ? "debug" : "info",
  transports,
});

/**
 * Converts any thrown value into structured, serializable log data.
 */
function normalizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: typeof error === "string" ? error : "Non-Error value thrown",
    value: error,
  };
}

/**
 * Normalizes messages and metadata for Winston.
 */
function normalizeLogInput(message: unknown, meta?: LogMeta): LogMeta {
  if (message instanceof Error) {
    return {
      message: message.message,
      ...meta,
      error: normalizeError(message),
    };
  }

  if (typeof message === "string") {
    return {
      message,
      ...meta,
    };
  }

  return {
    message: "An unexpected value was logged",
    ...meta,
    error: normalizeError(message),
  };
}

export const log = {
  error: (message: unknown, meta?: LogMeta): void => {
    logger.error(normalizeLogInput(message, meta));
  },

  warn: (message: unknown, meta?: LogMeta): void => {
    logger.warn(normalizeLogInput(message, meta));
  },

  info: (message: unknown, meta?: LogMeta): void => {
    logger.info(normalizeLogInput(message, meta));
  },

  debug: (message: unknown, meta?: LogMeta): void => {
    logger.debug(normalizeLogInput(message, meta));
  },
};

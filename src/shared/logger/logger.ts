import path from "path";
import winston from "winston";
import { existsSync, mkdirSync } from "fs";
import { appConfig } from "../../config/env";
import { OpenTelemetryTransportV3 } from "@opentelemetry/winston-transport";

const logsDir = path.resolve("logs");
if (!existsSync(logsDir)) {
  mkdirSync(logsDir);
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

const prettyFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `[${timestamp}] [${level}]: ${message}\n${stack}`;
    }
    return `[${timestamp}] [${level}]: ${message}`;
  })
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports: winston.transport[] = [];

transports.push(
  new winston.transports.Console({
    format: prettyFormat,
  })
);

transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, "error.log"),
    level: "error",
    format: jsonFormat,
  }),
  new winston.transports.File({
    filename: path.join(logsDir, "combined.log"),
    format: jsonFormat,
  })
);

transports.push(new OpenTelemetryTransportV3());

const logger = winston.createLogger({
  levels: logLevels,
  level: appConfig.isDev ? "debug" : "info",
  transports,
});

type LogMessage = string | Error;

export const log = {
  error: (msg: string, err?: Error) => {
    if (err) {
      logger.error(msg, { stack: err.stack, error: err.message });
    } else {
      logger.error(msg);
    }
  },
  warn: (msg: LogMessage) => logger.warn(msg),
  info: (msg: LogMessage) => logger.info(msg),
  debug: (msg: LogMessage) => logger.debug(msg),
};
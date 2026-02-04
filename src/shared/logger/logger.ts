import path from "path";
import winston from "winston";
import { existsSync, mkdirSync } from "fs";

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

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message }) => {
    if (message instanceof Error) {
      return `[${timestamp}] [${level}]: ${message.message}\n${message.stack}`;
    }
    return `[${timestamp}] [${level}]: ${message}`;
  })
);

const logger = winston.createLogger({
  levels: logLevels,
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(logsDir, "error.log"), level: "error" }),
    new winston.transports.File({ filename: path.join(logsDir, "combined.log") }),
  ],
});

type LogMessage = string | Error;

export const log = {
  error: (msg: string, err?: Error) => {
    if (err) {
      logger.error(`${msg}\n${err.message}\n${err.stack}`);
    } else {
      logger.error(msg);
    }
  },
  warn: (msg: LogMessage) => logger.warn(msg),
  info: (msg: LogMessage) => logger.info(msg),
  debug: (msg: LogMessage) => logger.debug(msg),
};

export default logger;

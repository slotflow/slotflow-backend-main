import { stopDB } from "./db.init";
import { stopOtel } from "./otel.init";
import { stopKafka } from "./kafka.init";
import { stopCronJobs } from "./cron.init";
import { log } from "../../shared/logger/logger";
import { IncomingMessage, Server, ServerResponse } from "http";

export const setupGracefulShutdown = async (server: Server<typeof IncomingMessage, typeof ServerResponse>) => {
  const shutdown = async () => {
    log.info("Shutting down...");

    try {
        stopCronJobs();
        await stopKafka();
        await stopDB();
        await stopOtel();

      server.close(() => {
        log.info("Server closed");
        process.exit(0);
      });

    } catch (err) {
      log.error("Shutdown error", err as Error);
      process.exit(1);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};
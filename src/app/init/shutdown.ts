import { stopDB } from "./db.init";
import { stopOtel } from "./otel.init";
import { stopKafka } from "./kafka.init";
import { stopCronJobs } from "./cron.init";

export const setupGracefulShutdown = async (server: any) => {
  const shutdown = async () => {
    console.log("Shutting down...");

    try {
        stopCronJobs();
        await stopKafka();
        await stopDB();
        stopOtel();

      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });

    } catch (err) {
      console.error("Shutdown error", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};
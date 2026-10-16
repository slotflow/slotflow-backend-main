import helmet from "helmet";
import express from "express";
import { readFileSync } from "node:fs";
import cookieParser from "cookie-parser";
import v1router from "../presentation/routes/router.v1";
import { errorHandler } from "../presentation/middleware/error.middleware";

const app = express();

const packageJson = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf-8"),
);
const appVersion: string = packageJson.version;

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", v1router);

app.get("/status", (_req, res) => {
  res.status(200).json({
    service: "slotflow-main-backend",
    status: "operational",
    version: appVersion,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use(errorHandler);

export default app;

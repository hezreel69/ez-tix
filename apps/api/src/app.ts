import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { config } from "./lib/config.js";
import { logger } from "./lib/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { requestIdMiddleware } from "./middleware/request-id.js";
import { SERVER_EPOCH } from "./realtime/index.js";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestIdMiddleware);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as express.Request).requestId,
    }),
  );
  app.use(helmet());
  app.use(
    cors({
      origin: config.WEB_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  /**
   * Liveness endpoint (`GET /health` and `GET /api/v1/health`).
   * MUST NOT touch PostgreSQL or Redis so pings do not wake Neon or consume Upstash commands.
   * Source: TRD Section 5.3 & 17, BSD Section 10.10
   */
  const healthHandler: express.RequestHandler = (_req, res) => {
    res.status(200).json({
      status: "ok",
      epoch: SERVER_EPOCH,
      timestamp: new Date().toISOString(),
    });
  };

  app.get("/health", healthHandler);
  app.get("/api/v1/health", healthHandler);

  /**
   * Manual readiness endpoint (`GET /ready` and `GET /api/v1/ready`).
   * Source: TRD Section 17, BSD Section 10.10
   */
  const readyHandler: express.RequestHandler = (_req, res) => {
    res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
    });
  };

  app.get("/ready", readyHandler);
  app.get("/api/v1/ready", readyHandler);

  // API v1 router mount point (modules added in subsequent IPD phases)
  const v1Router = express.Router();
  app.use("/api/v1", v1Router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

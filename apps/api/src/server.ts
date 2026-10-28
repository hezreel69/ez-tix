import { createServer } from "node:http";
import { createApp } from "./app.js";
import { config } from "./lib/config.js";
import { logger } from "./lib/logger.js";
import { createRealtimeServer, SERVER_EPOCH } from "./realtime/index.js";

const app = createApp();
const httpServer = createServer(app);
createRealtimeServer(httpServer);

httpServer.listen(config.PORT, () => {
  logger.info(
    {
      port: config.PORT,
      env: config.NODE_ENV,
      webOrigin: config.WEB_ORIGIN,
      epoch: SERVER_EPOCH,
    },
    "EzTix API and Socket.IO server listening",
  );
});

function shutdown(signal: string): void {
  logger.info({ signal }, "Shutting down EzTix API server");
  httpServer.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

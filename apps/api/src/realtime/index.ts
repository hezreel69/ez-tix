import { randomUUID } from "node:crypto";
import type { Server as HttpServer } from "node:http";
import type {
  HoldExpired,
  QueueAdmitted,
  QueueClosed,
  QueuePaused,
  QueueProgress,
  QueueSubscribePayload,
  QueueUnsubscribePayload,
  SeatsChanged,
  SeatsSubscribeAck,
  SeatsSubscribePayload,
  SeatsUnsubscribePayload,
} from "@eztix/shared";
import { Server as SocketIOServer } from "socket.io";
import { config } from "../lib/config.js";
import { logger } from "../lib/logger.js";

export interface ClientToServerEvents {
  "queue:subscribe": (
    payload: QueueSubscribePayload,
    ack?: (progress?: QueueProgress) => void,
  ) => void;
  "queue:unsubscribe": (payload: QueueUnsubscribePayload) => void;
  "seats:subscribe": (
    payload: SeatsSubscribePayload,
    ack?: (state: SeatsSubscribeAck) => void,
  ) => void;
  "seats:unsubscribe": (payload: SeatsUnsubscribePayload) => void;
}

export interface ServerToClientEvents {
  "queue:progress": (payload: QueueProgress) => void;
  "queue:admitted": (payload: QueueAdmitted) => void;
  "queue:closed": (payload: QueueClosed) => void;
  "queue:paused": (payload: QueuePaused) => void;
  "seats:changed": (payload: SeatsChanged) => void;
  "hold:expired": (payload: HoldExpired) => void;
}

/**
 * Process-level random epoch ID generated at startup.
 * Source: BSD Section 12.1
 */
export const SERVER_EPOCH = randomUUID().slice(0, 12);

let ioInstance: SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents
> | null = null;

export function createRealtimeServer(
  httpServer: HttpServer,
): SocketIOServer<ClientToServerEvents, ServerToClientEvents> {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      cors: {
        origin: config.WEB_ORIGIN,
        credentials: true,
      },
    },
  );

  io.on("connection", (socket) => {
    logger.debug({ socketId: socket.id }, "Socket connected");

    socket.on("queue:subscribe", ({ eventId }) => {
      if (eventId) {
        void socket.join(`queue:${eventId}`);
      }
    });

    socket.on("queue:unsubscribe", ({ eventId }) => {
      if (eventId) {
        void socket.leave(`queue:${eventId}`);
      }
    });

    socket.on("seats:subscribe", ({ eventId }, ack) => {
      if (eventId) {
        void socket.join(`event:${eventId}:seats`);
        ack?.({ epoch: SERVER_EPOCH, version: 0 });
      }
    });

    socket.on("seats:unsubscribe", ({ eventId }) => {
      if (eventId) {
        void socket.leave(`event:${eventId}:seats`);
      }
    });
  });

  ioInstance = io;
  return io;
}

export function getRealtimeServer(): SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents
> | null {
  return ioInstance;
}

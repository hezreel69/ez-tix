import { io, type Socket } from "socket.io-client";

/**
 * Direct Socket.IO client connecting to the Render / Express API host (`NEXT_PUBLIC_WS_URL`).
 * WebSockets connect directly (not through Vercel rewrites) using a short-lived socket token.
 * Source: TRD Section 5.5, 7.3, 11.3 & BSD Section 12.1
 */
const wsUrl =
  process.env.NEXT_PUBLIC_WS_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

let socketInstance: Socket | null = null;

export function getSocketClient(token?: string): Socket {
  if (!socketInstance) {
    socketInstance = io(wsUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: token ? { token } : undefined,
    });
  } else if (token) {
    socketInstance.auth = { token };
  }
  return socketInstance;
}

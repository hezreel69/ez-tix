import pino from "pino";
import { config } from "./config.js";

/**
 * Structured JSON logger with sensitive field redaction (PDPA / TRD Section 14.2 & 17).
 */
export const logger = pino({
  level: config.NODE_ENV === "test" ? "silent" : "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "passwordHash",
      "newPassword",
      "currentPassword",
      "token",
      "accessToken",
      "refreshToken",
      "passToken",
    ],
    censor: "[REDACTED]",
  },
});

import type { ErrorCode } from "@eztix/shared";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger.js";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * 404 Not Found handler for unmatched API routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: "NOT_FOUND" satisfies ErrorCode,
      message: `Route ${req.method} ${req.originalUrl} not found.`,
      requestId: req.requestId ?? "req_unknown",
    },
  });
}

/**
 * Centralised error handler returning the standard TRD Section 12 error envelope:
 * `{ error: { code, message, details?, requestId } }`
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.requestId ?? "req_unknown";

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
        requestId,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_FAILED" satisfies ErrorCode,
        message: "Request validation failed.",
        details: {
          fieldErrors: err.flatten().fieldErrors,
        },
        requestId,
      },
    });
    return;
  }

  logger.error({ err, requestId, path: req.originalUrl }, "Unhandled API error");

  res.status(500).json({
    error: {
      code: "INTERNAL" satisfies ErrorCode,
      message: "An unexpected internal error occurred.",
      requestId,
    },
  });
}

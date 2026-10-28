import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Assigns a unique `requestId` to every incoming HTTP request.
 * Source: TRD Section 12 & 17
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const headerId = req.header("x-request-id");
  const requestId =
    headerId && headerId.trim().length > 0
      ? headerId.trim()
      : `req_${randomUUID().replace(/-/g, "").slice(0, 16)}`;

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}

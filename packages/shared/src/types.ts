import type { z } from "zod";
import type {
  CompactSeatStatus,
  PaymentMethod,
  QueueStatus,
} from "./enums.js";
import type {
  apiErrorResponseSchema,
  gaSectionConfigSchema,
  layoutConfigSchema,
  layoutDecorSchema,
  layoutSectionConfigSchema,
  paginationQuerySchema,
  reservedSectionConfigSchema,
} from "./schemas.js";

/**
 * Shared TypeScript types for API envelopes, Venue Layout, Payments, and Socket.IO contracts.
 * Source of truth: EzTix BSD (Sections 4.3, 11, 12) and TRD (Section 10.1, 12).
 */

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export type ReservedSectionConfig = z.infer<typeof reservedSectionConfigSchema>;
export type GaSectionConfig = z.infer<typeof gaSectionConfigSchema>;
export type LayoutSectionConfig = z.infer<typeof layoutSectionConfigSchema>;
export type LayoutDecor = z.infer<typeof layoutDecorSchema>;
export type LayoutConfig = z.infer<typeof layoutConfigSchema>;

/**
 * Venue Layout Generator output types.
 * Source: BSD Section 4.3
 */
export type GeneratedSeat = {
  sectionKey: string;
  rowLabel: string;
  seatNumber: number;
  x: number;
  y: number;
};

export type GeneratedShape =
  | {
      kind: "STAGE";
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
    }
  | {
      kind: "GA_AREA";
      sectionKey: string;
      name: string;
      x: number;
      y: number;
      width: number;
      height: number;
      capacity: number;
    }
  | {
      kind: "DECOR_LABEL";
      text: string;
      x: number;
      y: number;
    };

export type GeneratedLayout = {
  canvas: { width: number; height: number };
  shapes: GeneratedShape[];
  seats: GeneratedSeat[];
  gaZones: { key: string; name: string; capacity: number }[];
};

/**
 * Socket.IO Server-to-Client & Client-to-Server Payloads.
 * Source: BSD Section 12.2 & 12.3
 */
export type QueueSubscribePayload = { eventId: string };
export type QueueUnsubscribePayload = { eventId: string };
export type SeatsSubscribePayload = { eventId: string };
export type SeatsUnsubscribePayload = { eventId: string };
export type SeatsSubscribeAck = { epoch: string; version: number };

export type QueueProgress = {
  eventId: string;
  lastAdmittedSeq: number;
  waitingTotal: number;
  status: QueueStatus;
};

export type QueueAdmitted = {
  eventId: string;
  passToken: string;
  expiresAt: string;
};

export type QueueClosed = {
  eventId: string;
  reason: "SOLD_OUT" | "CLOSED" | "CANCELLED" | "ENDED";
};

export type QueuePaused = {
  eventId: string;
  paused: boolean;
};

export type SeatsChanged = {
  eventId: string;
  epoch: string;
  version: number;
  changes: { idx: number; status: CompactSeatStatus }[];
  ga?: { sectionKey: string; remaining: number }[];
};

export type HoldExpired = {
  eventId: string;
  holdId: string;
};

/**
 * Payment Provider Interface.
 * Source: TRD Section 10.1
 */
export interface PaymentProvider {
  createPayment(input: {
    orderId: string;
    amount: number;
    currency: "MYR";
    method: PaymentMethod;
    returnUrl: string;
  }): Promise<{ paymentId: string; redirectUrl: string }>;
  verifyWebhook(rawBody: string, signature: string): boolean;
  parseWebhook(rawBody: string): {
    paymentId: string;
    status: "SUCCEEDED" | "FAILED" | "CANCELLED" | "TIMEOUT";
  };
}

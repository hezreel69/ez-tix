import {
  BPS_DENOMINATOR,
  BPS_HALF_UP_OFFSET,
  PLATFORM_DEFAULTS,
} from "./constants.js";
import type { EventPhase, EventStatus, QueueStatus } from "./enums.js";

/**
 * Shared pure utility functions for money rounding and derived event/queue state.
 * Source of truth: EzTix BSD (Sections 3.4, 8.1, 8.2).
 */

export type OrderTotals = {
  subtotalSen: number;
  serviceFeeSen: number;
  taxSen: number;
  totalSen: number;
};

/**
 * Computes integer sen fees, taxes, and totals using half-up integer rounding.
 * Rule from BSD Section 3.4:
 *   fee = floor((subtotal * feeBps + 5000) / 10000)
 *   tax = floor(((subtotal + fee) * taxBps + 5000) / 10000)
 *   total = subtotal + fee + tax
 */
export function calculateOrderTotals(
  subtotalSen: number,
  serviceFeeBps: number,
  taxBps: number,
): OrderTotals {
  const serviceFeeSen = Math.floor(
    (subtotalSen * serviceFeeBps + BPS_HALF_UP_OFFSET) / BPS_DENOMINATOR,
  );
  const taxSen = Math.floor(
    ((subtotalSen + serviceFeeSen) * taxBps + BPS_HALF_UP_OFFSET) /
      BPS_DENOMINATOR,
  );
  const totalSen = subtotalSen + serviceFeeSen + taxSen;

  return {
    subtotalSen,
    serviceFeeSen,
    taxSen,
    totalSen,
  };
}

export type EventPhaseInput = {
  status: EventStatus;
  deletedAt?: Date | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  onSaleAt?: Date | null;
  saleEndsAt?: Date | null;
  queueEnabled: boolean;
  queueOpensAt?: Date | null;
  queueClosedAt?: Date | null;
};

/**
 * Computes the public EventPhase from timestamps and status (first match wins).
 * Returns `null` when the event is hidden from the public (`deletedAt` set or `DRAFT`).
 * Source: BSD Section 8.1
 */
export function computeEventPhase(
  event: EventPhaseInput,
  now: Date = new Date(),
): EventPhase | null {
  if (event.deletedAt != null || event.status === "DRAFT") {
    return null;
  }

  if (event.status === "CANCELLED") {
    return "CANCELLED";
  }

  const nowMs = now.getTime();

  if (event.startsAt != null) {
    const endMs =
      event.endsAt != null
        ? event.endsAt.getTime()
        : event.startsAt.getTime() +
          PLATFORM_DEFAULTS.DEFAULT_EVENT_DURATION_HOURS * 60 * 60 * 1000;
    if (nowMs >= endMs) {
      return "ENDED";
    }
  }

  if (event.saleEndsAt != null && nowMs >= event.saleEndsAt.getTime()) {
    return "SALES_CLOSED";
  }

  if (event.onSaleAt != null && nowMs >= event.onSaleAt.getTime()) {
    return "ON_SALE";
  }

  if (
    event.queueEnabled &&
    event.queueOpensAt != null &&
    nowMs >= event.queueOpensAt.getTime() &&
    event.queueClosedAt == null
  ) {
    return "WAITING_ROOM_OPEN";
  }

  return "COMING_SOON";
}

export type QueueStatusInput = EventPhaseInput & {
  queuePaused: boolean;
  soldOut?: boolean;
};

/**
 * Computes the QueueStatus on read.
 * Source: BSD Section 8.2
 */
export function computeQueueStatus(
  event: QueueStatusInput,
  now: Date = new Date(),
): QueueStatus {
  if (!event.queueEnabled) {
    return "DISABLED";
  }

  const phase = computeEventPhase(event, now);
  if (
    event.queueClosedAt != null ||
    phase === null ||
    phase === "CANCELLED" ||
    phase === "ENDED" ||
    phase === "SALES_CLOSED" ||
    event.soldOut === true
  ) {
    return "CLOSED";
  }

  if (event.queuePaused) {
    return "PAUSED";
  }

  const nowMs = now.getTime();
  if (event.onSaleAt != null && nowMs >= event.onSaleAt.getTime()) {
    return "OPEN";
  }

  if (event.queueOpensAt != null && nowMs >= event.queueOpensAt.getTime()) {
    return "PRE_QUEUE";
  }

  return "NOT_OPEN";
}

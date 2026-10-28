import { describe, expect, it } from "vitest";
import {
  calculateOrderTotals,
  computeEventPhase,
  computeQueueStatus,
} from "./utils.js";

describe("@eztix/shared utils", () => {
  it("calculates order totals using half-up integer sen rounding (BSD 3.4 example)", () => {
    // BSD 3.4: subtotal 57,600 sen, 6% (600 bps) fee gives 3,456, 8% (800 bps) tax on 61,056 gives 4,884, total 65,940 sen.
    const totals = calculateOrderTotals(57_600, 600, 800);
    expect(totals).toEqual({
      subtotalSen: 57_600,
      serviceFeeSen: 3_456,
      taxSen: 4_884,
      totalSen: 65_940,
    });
  });

  it("derives event phase and queue status according to BSD 8.1 and 8.2", () => {
    const baseEvent = {
      status: "PUBLISHED" as const,
      deletedAt: null,
      startsAt: new Date("2026-12-01T12:00:00Z"),
      endsAt: new Date("2026-12-01T16:00:00Z"),
      onSaleAt: new Date("2026-11-01T04:00:00Z"),
      saleEndsAt: new Date("2026-12-01T10:00:00Z"),
      queueEnabled: true,
      queueOpensAt: new Date("2026-11-01T03:30:00Z"),
      queueClosedAt: null,
      queuePaused: false,
    };

    expect(
      computeEventPhase(baseEvent, new Date("2026-11-01T03:00:00Z")),
    ).toBe("COMING_SOON");
    expect(
      computeQueueStatus(baseEvent, new Date("2026-11-01T03:00:00Z")),
    ).toBe("NOT_OPEN");

    expect(
      computeEventPhase(baseEvent, new Date("2026-11-01T03:45:00Z")),
    ).toBe("WAITING_ROOM_OPEN");
    expect(
      computeQueueStatus(baseEvent, new Date("2026-11-01T03:45:00Z")),
    ).toBe("PRE_QUEUE");

    expect(
      computeEventPhase(baseEvent, new Date("2026-11-01T04:05:00Z")),
    ).toBe("ON_SALE");
    expect(
      computeQueueStatus(baseEvent, new Date("2026-11-01T04:05:00Z")),
    ).toBe("OPEN");
  });
});

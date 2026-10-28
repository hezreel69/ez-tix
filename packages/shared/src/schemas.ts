import { z } from "zod";
import { VALIDATION_LIMITS } from "./constants.js";
import { errorCodeSchema } from "./enums.js";

/**
 * Shared Zod schemas for primitive fields, API envelopes, and Venue Layout config.
 * Source of truth: EzTix BSD (Sections 4.3, 11, 13) and TRD (Section 12).
 */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address")
  .max(VALIDATION_LIMITS.EMAIL_MAX_LENGTH);

export const passwordSchema = z
  .string()
  .min(
    VALIDATION_LIMITS.PASSWORD_MIN_LENGTH,
    `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN_LENGTH} characters`,
  )
  .max(VALIDATION_LIMITS.PASSWORD_MAX_LENGTH);

export const nameSchema = z
  .string()
  .trim()
  .min(VALIDATION_LIMITS.NAME_MIN_LENGTH)
  .max(VALIDATION_LIMITS.NAME_MAX_LENGTH);

/**
 * Malaysian phone number format (+60 or 01x, 9 to 12 digits after normalising).
 * Source: BSD Section 13
 */
export const malaysianPhoneSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/[\s\-()]/g, ""))
  .refine(
    (val) => /^(?:\+?60|0)[1-9]\d{7,10}$/.test(val),
    "Invalid Malaysian phone number",
  );

/**
 * Standard API Error envelope.
 * Source: TRD Section 12 & BSD Section 11
 */
export const apiErrorResponseSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
    requestId: z.string(),
  }),
});

/**
 * Standard cursor/page pagination query parameters.
 * Source: TRD Section 12 & BSD Section 13
 */
export const paginationQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .min(VALIDATION_LIMITS.PAGINATION_LIMIT_MIN)
    .max(VALIDATION_LIMITS.PAGINATION_LIMIT_MAX)
    .default(VALIDATION_LIMITS.PAGINATION_LIMIT_DEFAULT),
});

/**
 * Venue Layout Template (`venues.layout_config`) schema.
 * Source: BSD Section 4.3
 */
export const layoutAisleSchema = z.object({
  afterSeat: z.number().int().min(1),
  gap: z.number().min(0),
});

export const layoutRowOverrideSchema = z.object({
  label: z.string().min(1),
  seatsPerRow: z.number().int().min(1).optional(),
  offsetX: z.number().optional(),
});

export const reservedSectionConfigSchema = z.object({
  key: z.string().min(1).max(64),
  name: z.string().trim().min(1).max(100),
  type: z.literal("RESERVED"),
  origin: z.object({
    x: z.number(),
    y: z.number(),
  }),
  rows: z.object({
    count: z.number().int().min(1).max(200),
    firstLabel: z.string().min(1).max(10),
    labelStyle: z.enum(["ALPHA", "NUMERIC"]),
    seatsPerRow: z.number().int().min(1).max(200),
    seatNumberStart: z.number().int().min(1).default(1),
    numbering: z.enum(["LEFT_TO_RIGHT", "RIGHT_TO_LEFT"]),
  }),
  spacing: z.object({
    seat: z.number().positive(),
    row: z.number().positive(),
  }),
  curvature: z
    .number()
    .min(VALIDATION_LIMITS.VENUE_CURVATURE_MIN)
    .max(VALIDATION_LIMITS.VENUE_CURVATURE_MAX)
    .default(0),
  aisles: z.array(layoutAisleSchema).default([]),
  rowOverrides: z.array(layoutRowOverrideSchema).default([]),
});

export const gaSectionConfigSchema = z.object({
  key: z.string().min(1).max(64),
  name: z.string().trim().min(1).max(100),
  type: z.literal("GA"),
  area: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  capacity: z
    .number()
    .int()
    .min(1)
    .max(VALIDATION_LIMITS.VENUE_MAX_GA_CAPACITY),
});

export const layoutSectionConfigSchema = z.discriminatedUnion("type", [
  reservedSectionConfigSchema,
  gaSectionConfigSchema,
]);

export const layoutDecorSchema = z.object({
  type: z.literal("LABEL"),
  text: z.string().min(1).max(100),
  x: z.number(),
  y: z.number(),
});

export const layoutConfigSchema = z
  .object({
    schemaVersion: z.literal(1),
    canvas: z.object({
      width: z.number().positive(),
      height: z.number().positive(),
    }),
    stage: z
      .object({
        x: z.number(),
        y: z.number(),
        width: z.number().positive(),
        height: z.number().positive(),
        label: z.string().min(1).max(100).default("STAGE"),
      })
      .optional(),
    sections: z
      .array(layoutSectionConfigSchema)
      .min(1)
      .max(VALIDATION_LIMITS.VENUE_MAX_SECTIONS),
    decor: z.array(layoutDecorSchema).default([]),
  })
  .superRefine((config, ctx) => {
    const seenKeys = new Set<string>();
    let totalReservedSeats = 0;
    let totalGaCapacity = 0;

    for (const section of config.sections) {
      if (seenKeys.has(section.key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate section key: "${section.key}"`,
          path: ["sections"],
        });
      }
      seenKeys.add(section.key);

      if (section.type === "RESERVED") {
        totalReservedSeats += section.rows.count * section.rows.seatsPerRow;
      } else {
        totalGaCapacity += section.capacity;
      }
    }

    if (totalReservedSeats > VALIDATION_LIMITS.VENUE_MAX_RESERVED_SEATS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Total reserved seats cannot exceed ${VALIDATION_LIMITS.VENUE_MAX_RESERVED_SEATS}`,
        path: ["sections"],
      });
    }

    if (totalGaCapacity > VALIDATION_LIMITS.VENUE_MAX_GA_CAPACITY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Total GA capacity cannot exceed ${VALIDATION_LIMITS.VENUE_MAX_GA_CAPACITY}`,
        path: ["sections"],
      });
    }
  });

import { z } from "zod";

/**
 * Shared Enums (Zod schemas, values, and TypeScript types).
 * Source of truth: EzTix BSD (Sections 5.1, 8, 11, 12).
 */

export const USER_ROLES = ["EVENT_GOER", "ORGANISER", "ADMIN"] as const;
export const userRoleSchema = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof userRoleSchema>;

export const USER_STATUSES = ["UNVERIFIED", "ACTIVE", "INVITED", "SUSPENDED"] as const;
export const userStatusSchema = z.enum(USER_STATUSES);
export type UserStatus = z.infer<typeof userStatusSchema>;

export const ONE_TIME_TOKEN_TYPES = ["EMAIL_VERIFY", "PASSWORD_RESET", "INVITE"] as const;
export const oneTimeTokenTypeSchema = z.enum(ONE_TIME_TOKEN_TYPES);
export type OneTimeTokenType = z.infer<typeof oneTimeTokenTypeSchema>;

export const MALAYSIAN_STATES = [
  "JOHOR",
  "KEDAH",
  "KELANTAN",
  "MELAKA",
  "NEGERI_SEMBILAN",
  "PAHANG",
  "PERAK",
  "PERLIS",
  "PULAU_PINANG",
  "SABAH",
  "SARAWAK",
  "SELANGOR",
  "TERENGGANU",
  "KUALA_LUMPUR",
  "LABUAN",
  "PUTRAJAYA",
] as const;
export const malaysianStateSchema = z.enum(MALAYSIAN_STATES);
export type MalaysianState = z.infer<typeof malaysianStateSchema>;

export const VENUE_STATUSES = ["ACTIVE", "ARCHIVED"] as const;
export const venueStatusSchema = z.enum(VENUE_STATUSES);
export type VenueStatus = z.infer<typeof venueStatusSchema>;

export const EVENT_STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED"] as const;
export const eventStatusSchema = z.enum(EVENT_STATUSES);
export type EventStatus = z.infer<typeof eventStatusSchema>;

/**
 * Public event phase (derived on read from timestamps and status).
 * Source: BSD Section 8.1
 */
export const EVENT_PHASES = [
  "COMING_SOON",
  "WAITING_ROOM_OPEN",
  "ON_SALE",
  "SALES_CLOSED",
  "ENDED",
  "CANCELLED",
] as const;
export const eventPhaseSchema = z.enum(EVENT_PHASES);
export type EventPhase = z.infer<typeof eventPhaseSchema>;

/**
 * Queue status (derived on read).
 * Source: BSD Section 8.2
 */
export const QUEUE_STATUSES = [
  "DISABLED",
  "NOT_OPEN",
  "PRE_QUEUE",
  "OPEN",
  "PAUSED",
  "CLOSED",
] as const;
export const queueStatusSchema = z.enum(QUEUE_STATUSES);
export type QueueStatus = z.infer<typeof queueStatusSchema>;

export const SECTION_TYPES = ["RESERVED", "GA"] as const;
export const sectionTypeSchema = z.enum(SECTION_TYPES);
export type SectionType = z.infer<typeof sectionTypeSchema>;

export const SEAT_STATUSES = ["AVAILABLE", "HELD", "SOLD", "BLOCKED"] as const;
export const seatStatusSchema = z.enum(SEAT_STATUSES);
export type SeatStatus = z.infer<typeof seatStatusSchema>;

/**
 * Single-character seat status used in compact snapshots and Socket.IO delta updates.
 * Source: BSD Section 10.4 & 12.3
 */
export const COMPACT_SEAT_STATUSES = ["A", "H", "S", "B"] as const;
export const compactSeatStatusSchema = z.enum(COMPACT_SEAT_STATUSES);
export type CompactSeatStatus = z.infer<typeof compactSeatStatusSchema>;

export const HOLD_STATUSES = ["ACTIVE", "CONVERTED", "RELEASED", "EXPIRED"] as const;
export const holdStatusSchema = z.enum(HOLD_STATUSES);
export type HoldStatus = z.infer<typeof holdStatusSchema>;

export const QUEUE_ENTRY_STATUSES = [
  "WAITING",
  "ADMITTED",
  "COMPLETED",
  "EXPIRED",
  "REMOVED",
  "LEFT",
  "CLOSED",
] as const;
export const queueEntryStatusSchema = z.enum(QUEUE_ENTRY_STATUSES);
export type QueueEntryStatus = z.infer<typeof queueEntryStatusSchema>;

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "CANCELLED",
  "EXPIRED",
  "FAILED_SEATS_LOST",
  "REFUNDED",
] as const;
export const orderStatusSchema = z.enum(ORDER_STATUSES);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const ORDER_ITEM_KINDS = ["SEAT", "GA"] as const;
export const orderItemKindSchema = z.enum(ORDER_ITEM_KINDS);
export type OrderItemKind = z.infer<typeof orderItemKindSchema>;

export const PAYMENT_METHODS = [
  "FPX",
  "CARD",
  "TNG_EWALLET",
  "GRABPAY",
  "BOOST",
  "SHOPEEPAY",
] as const;
export const paymentMethodSchema = z.enum(PAYMENT_METHODS);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const PAYMENT_STATUSES = [
  "CREATED",
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
  "TIMEOUT",
] as const;
export const paymentStatusSchema = z.enum(PAYMENT_STATUSES);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const TICKET_STATUSES = ["VALID", "USED", "CANCELLED"] as const;
export const ticketStatusSchema = z.enum(TICKET_STATUSES);
export type TicketStatus = z.infer<typeof ticketStatusSchema>;

/**
 * Standard API Error Codes.
 * Source: BSD Section 11
 */
export const ERROR_CODES = [
  "VALIDATION_FAILED",
  "UNAUTHENTICATED",
  "INVALID_CREDENTIALS",
  "FORBIDDEN",
  "ACCOUNT_SUSPENDED",
  "EMAIL_NOT_VERIFIED",
  "ROLE_CANNOT_BUY",
  "NOT_FOUND",
  "EMAIL_TAKEN",
  "TOKEN_INVALID",
  "QUEUE_NOT_OPEN",
  "QUEUE_CLOSED",
  "ALREADY_ADMITTED",
  "PASS_REQUIRED",
  "PASS_EXPIRED",
  "EVENT_NOT_ON_SALE",
  "SEAT_UNAVAILABLE",
  "GA_INSUFFICIENT",
  "LIMIT_EXCEEDED",
  "HOLD_NOT_FOUND",
  "HOLD_EXPIRED",
  "ORDER_STATE_INVALID",
  "PAYMENT_METHOD_INVALID",
  "PUBLISH_INVALID",
  "FIELD_LOCKED",
  "VENUE_INVALID",
  "DELETE_BLOCKED",
  "RATE_LIMITED",
  "CAPTCHA_FAILED",
  "INTERNAL",
] as const;
export const errorCodeSchema = z.enum(ERROR_CODES);
export type ErrorCode = z.infer<typeof errorCodeSchema>;

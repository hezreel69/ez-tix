/**
 * Express API module boundaries (TRD Section 4.2):
 * - auth
 * - users
 * - events
 * - venues
 * - queue
 * - seats
 * - orders
 * - payments
 * - tickets
 * - admin
 *
 * Rule: modules call each other through exported service functions only,
 * never by reaching into each other's Prisma queries.
 */
export {};

# EzTix Implementation Plan Document (IPD)

| | |
|---|---|
| **Document code** | IPD |
| **Version** | 1.0 (Draft) |
| **Date** | 28 October 2026 |
| **Based on** | PRD v1.0, TRD v1.0, AFD v1.0, BSD v1.0 |

This document provides a sequential, phase-by-phase implementation roadmap for building the EzTix platform. It sequences the development process to ensure foundational infrastructure and schemas are established before complex workflows (like the queue and real-time seat holds) are introduced.

## Phase 1: Project Initialization and Monorepo Setup (Completed)
*   [x] **Monorepo Scaffolding:** Initialize a monorepo using pnpm workspaces (or npm) to house all project code.
*   [x] **Package Structure:**
    *   [x] Create `apps/web` for the Next.js (App Router) frontend using TypeScript.
    *   [x] Create `apps/api` for the Express.js backend using TypeScript, which will host both the REST API and Socket.IO server.
    *   [x] Create `packages/shared` for Zod schemas, TypeScript types, and constants to ensure a single source of truth across the stack.
*   [x] **Infrastructure Configuration:**
    *   [x] Configure Vercel (Hobby plan) deployment settings for the frontend.
    *   [x] Configure Render deployment settings for the backend API to support long-lived WebSocket connections.
    *   [x] Set up a `docker-compose.yml` file for local development to run PostgreSQL, Redis, and Mailpit.
*   [x] **Next.js Proxy:** Configure Next.js rewrites to proxy `/api/*` to the Express backend to avoid third-party cookie issues during authentication.

## Phase 2: Database Schema and Migration (PostgreSQL & Prisma)
*   **Prisma Initialization:** Setup Prisma 7 in `apps/api` with the driver adapter configuration (`@prisma/adapter-pg`) and point migrations to the direct database URL in `prisma.config.ts`.
*   **Schema Definition:** Translate the entity relationship diagrams into `schema.prisma` using `uuid(7)` for primary keys and `timestamptz(3)` for timestamps. Implement tables for:
    *   Users, Organiser Profiles, and Tokens (`refresh_tokens`, `one_time_tokens`).
    *   Platform Settings, Categories, and Venues.
    *   Events, Ticket Tiers, Event Sections, and Event Seats.
    *   Holds, Hold GA Items, and Queue Entries.
    *   Orders, Order Items, Payments, and Tickets.
*   **Raw SQL Constraints:** Create an empty Prisma migration (`npx prisma migrate dev --create-only --name constraints`) and add the necessary raw PostgreSQL constraints and partial indexes. This includes:
    *   Unique index for one active hold per user per event.
    *   Unique index for one live queue entry per user per event.
    *   CHECK constraints for ticket tier price limits, integer sen boundaries, and GA capacity limits.
*   **Seed Data:** Create a `prisma/seed.ts` script to populate the single platform settings row, categories, default admin/organiser users, and sample venues (e.g., Dewan Seri Pelangi, Stadium Mini Bayu).

## Phase 3: Core API, Authentication & Shared Logic
*   **Shared Validation:** Define Zod schemas in `packages/shared` for user registration, login, and profile updates.
*   **Express Middleware:** Implement base Express middleware including `helmet`, `cors`, `pino-http` for structured logging, and basic rate-limiting.
*   **Authentication Service (`apps/api/src/modules/auth`):**
    *   Implement `POST /auth/register` to create `UNVERIFIED` users and dispatch verification emails.
    *   Implement `POST /auth/login` returning a short-lived access token (JWT) and a HTTP-only `SameSite=Lax` refresh token cookie.
    *   Implement password hashing using `argon2id`.
    *   Build the `requireRole` middleware to enforce `EVENT_GOER`, `ORGANISER`, and `ADMIN` access.

## Phase 4: Venue & Admin Management Workflows
*   **Layout Generator:** Implement the pure deterministic function `generateLayout(config: LayoutConfig)` in `packages/shared` to calculate coordinates for reserved seats from JSON venue templates.
*   **Admin API (`apps/api/src/modules/admin`):**
    *   Build `POST /admin/venues` and `PATCH /admin/venues/:id` endpoints. Ensure edits override existing details and apply only to future events.
    *   Build `POST /admin/organisers` to generate an invite token and send a set-password email.
    *   Implement `POST /admin/users/:id/suspend` and the user deletion (anonymisation) logic in `DELETE /admin/users/:id`.

## Phase 5: Event Creation & Organiser Dashboard
*   **Image Uploads:** Implement `POST /organiser/uploads/poster-signature` for signed Cloudinary uploads.
*   **Event Wizard API (`apps/api/src/modules/events`):**
    *   Implement CRUD for event drafts, ticket tiers, and section mappings.
    *   Build the `POST /organiser/events/:id/publish` endpoint.
*   **Publish Transaction:** Implement the database transaction to snapshot the venue config, bulk insert all `event_seats` rows using `jsonb_to_recordset`, apply blocked seats, and set the event phase.

## Phase 6: The Virtual Waiting Room (Redis + WebSockets)
*   **Real-Time Foundation (`apps/api/src/realtime`):**
    *   Set up Socket.IO and implement `POST /auth/socket-token` to issue 60-second JWTs for handshake authentication.
    *   Configure rooms: `queue:{eventId}`, `event:{eventId}:seats`, and `user:{userId}`.
*   **Redis Queue Data Structures:** Implement interactions for `q:{eventId}:seq` (FIFO sequence counter), `q:{eventId}:waiting` (Sorted Set for queue position), and `q:{eventId}:active` (Sorted Set for passes).
*   **Join Logic:** Implement `POST /queue/:eventId/join` to assign a sequence number, enqueue a write-behind flush to PostgreSQL `queue_entries`, and return the position.
*   **Admission Loop:** Implement the `admit.lua` Redis script to atomically clear expired passes, check available capacity against `maxActive`, pop users from the waiting set, and move them to the active set. Execute this loop in Express via `node-cron`.
*   **Notifications:** Broadcast `queue:progress` to the event room and `queue:admitted` (with a signed purchase pass) to individual user rooms.

## Phase 7: Seat Selection & Mock Checkout
*   **Atomic Seat Holding (`apps/api/src/modules/seats`):**
    *   Implement `POST /events/:id/hold/seats` using a raw SQL transaction with `FOR UPDATE` to lock rows in a fixed order and prevent deadlocks and double-selling.
    *   Implement the hold sweeper job (every 30 seconds) to release expired holds and free inventory.
*   **Real-Time Seat Map Updates:** Implement logic to broadcast `seats:changed` payloads (batched every 250ms) with a version integer and epoch string to the `event:{eventId}:seats` room.
*   **Order Creation (`apps/api/src/modules/orders`):**
    *   Implement `POST /orders` using idempotency keys. Calculate the `subtotal_sen`, `service_fee_sen`, and `tax_sen` entirely server-side based on the active hold.
*   **Mock Payments (`apps/api/src/modules/payments`):**
    *   Implement `POST /orders/:id/pay` to extend the hold (maximum 20 minutes from inception) and redirect to the mock gateway.
    *   Build the `POST /webhooks/mock-payments` endpoint that verifies HMAC signatures, marks seats as `SOLD`, issues `tickets` (with 12-char codes), and removes the user from the Redis `active` set.

## Phase 8: Frontend Implementation (Next.js)
*   **Public Views:** Develop server-rendered pages for Home (`/`), Event List (`/events`), and Event Detail (`/events/[slug]`). Calculate the public phase (e.g., `COMING_SOON`, `WAITING_ROOM_OPEN`) derived from server timestamps.
*   **Waiting Room (`B01`):** Build a client component to display queue position and estimated wait time, utilizing Socket.IO for live progression.
*   **Seat Map (`B02`):** Implement the interactive map using SVG and `react-zoom-pan-pinch`. Connect it to Zustand to manage selection state and to Socket.IO for delta updates. Include a polling fallback (`GET /events/:id/seats`) to run every 5 seconds if WebSockets fail.
*   **Checkout & Mock Gateway (`B03`, `B04`):** Create the order summary page and a mock bank/eWallet interface with a test panel to force success, failure, or timeout outcomes.
*   **Dashboards:**
    *   Implement the 5-step event creation wizard (`O03`) with React Hook Form and Zod resolvers.
    *   Implement the Admin venue builder (`A06`) with a live SVG preview matching the public seat map logic.
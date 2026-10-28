# EzTix Technical Requirements Document (TRD)

_How EzTix will be built: architecture, stack, hosting and the design of the hard parts._

| | |
|---|---|
| **Document code** | TRD |
| **Version** | 1.0 (Draft) |
| **Date** | 28 October 2026 |
| **Depends on** | PRD v1.0 |
| **Feeds into** | AFD, DBD, BSD, IPD |
| **Developer context** | Solo developer, side project, portfolio piece, free-tier hosting |

## Table of Contents

- 1. Technical Summary
- 2. Guiding Principles
- 3. Technology Stack
- 4. System Architecture
- 5. Hosting and Deployment (Free Tier)
- 6. Repository and Code Structure
- 7. Authentication and Authorisation
- 8. FIFO Queue Design
- 9. Seat Selection and Real-Time Design
- 10. Checkout and Mock Payment Design
- 11. Frontend Architecture
- 12. API Conventions
- 13. Background Jobs
- 14. Security and PDPA
- 15. Testing Strategy
- 16. CI/CD and Environments
- 17. Observability
- 18. Performance Targets and Capacity Reality Check
- 19. Key Decisions and Trade-offs
- 20. Risks
- 21. PRD Traceability
- 22. Open Items

---

## 1. Technical Summary

EzTix is a **monorepo** with two deployable apps and one shared package:

- **`apps/web`**: Next.js (TypeScript) frontend, deployed to Vercel.
- **`apps/api`**: Express.js (TypeScript) backend with Socket.IO, deployed to a host that supports long-lived connections (Render free web service).
- **`packages/shared`**: Zod schemas, TypeScript types and constants used by both apps, so the API contract is defined once.

Data lives in **PostgreSQL** (source of truth, accessed through **Prisma**) and **Redis** (queue ordering, admission control, short-lived state).

The architecture is a **modular monolith**: one Express process with clear internal modules (auth, events, queue, seats, orders, payments, admin). This is the right size for a solo developer. It avoids the operational overhead of microservices while keeping module boundaries clean enough to split later.

Three design decisions matter most:

1. **PostgreSQL is the single authority for seat and ticket inventory.** Redis is never trusted to decide whether a seat is sold. This is how "no double-selling" (PRD SEAT-05) is guaranteed.
2. **Redis owns queue ordering and admission**, with a write-behind copy in PostgreSQL so the queue can be rebuilt if Redis is lost (PRD QUE-12).
3. **Real-time is an enhancement, not a dependency.** Every screen works with plain REST plus polling. Socket.IO makes it live (PRD SEAT-07, SEAT-08).

## 2. Guiding Principles

- **Correctness over cleverness.** Queue order and seat inventory must be provably right. UI polish comes second.
- **Server is the authority.** The client never decides availability, queue position, price or payment outcome.
- **Free-tier friendly.** Every design choice avoids burning limited free-tier quotas (see section 5.3 and 8.6).
- **Swap-ready boundaries.** Payments, email and storage sit behind interfaces so mock or free services can be replaced later.
- **Portfolio-readable.** Code, docs and tests should show good engineering judgement to a reviewer.

## 3. Technology Stack

### 3.1 Core (your choices)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router), TypeScript | SSR for event pages (SEO and fast first load), client components for queue and seat map |
| Backend | Express.js, TypeScript | REST API plus Socket.IO server on the same HTTP server |
| Database | PostgreSQL | Source of truth |
| ORM | Prisma | Raw SQL (`$queryRaw`) used for the seat-hold query, see 9.2 |
| Real-time | Socket.IO | Queue progress and seat map updates |
| Cache and queue state | Redis | Queue ordering, admission, rate counters |

### 3.2 Recommended Additions

| Need | Recommendation | Why | Alternative |
|---|---|---|---|
| Monorepo tooling | **pnpm workspaces** (add Turborepo only if builds get slow) | Shared package without publishing | npm workspaces |
| Validation | **Zod** | One schema validates API input, infers types and is shared with the frontend | Valibot |
| Styling | **Tailwind CSS** + **shadcn/ui** | Fast, consistent UI for a solo developer | Mantine, MUI |
| Server state (frontend) | **TanStack Query** | Caching, retries, polling fallback | SWR |
| Client state | **Zustand** | Small store for the seat selection and queue state | React Context |
| Forms | **React Hook Form** + Zod resolver | Event creation forms are large | Formik |
| Seat map | **SVG rendered by React** + **react-zoom-pan-pinch** | Simple, accessible, fine up to a few thousand seats. Move to canvas (Konva) only if needed | Canvas, d3-zoom |
| Password hashing | **argon2** | Modern default | bcrypt |
| Tokens | **jsonwebtoken** or **jose** | Access token, socket token, purchase pass, ticket QR signature | |
| HTTP hardening | **helmet**, **cors**, **express-rate-limit** | Standard Express baseline | |
| Bot protection | **Cloudflare Turnstile** | Free CAPTCHA, privacy-friendly | hCaptcha |
| Logging | **pino** + **pino-http** | Fast structured logs | winston |
| Error tracking | **Sentry** (free tier) | Frontend and backend errors | |
| Email | **Resend** (free tier) in production, **Mailpit** locally | Simple API. Check the current free limits and domain verification requirements at setup | Nodemailer + any SMTP |
| Image storage | **Cloudinary** (free tier) for posters | Render's free filesystem is ephemeral, so never store uploads on the API server | Cloudflare R2, Supabase Storage |
| QR codes | **qrcode** (npm) | Client or server generation | |
| PDF tickets (P1) | **pdfkit** or **@react-pdf/renderer** | | |
| Scheduling | **node-cron** (in-process) | Enough for MVP, see section 13 | BullMQ (later) |
| Unit and integration tests | **Vitest** + **Supertest** | Same tooling for both apps | Jest |
| End-to-end tests | **Playwright** | Multi-user queue and seat tests | Cypress |
| Load testing | **k6** | Queue and hold concurrency tests | Artillery |
| Local infra | **Docker Compose** (Postgres, Redis, Mailpit) | One command to run everything locally | |
| Lint and format | **ESLint** + **Prettier** + **Husky/lint-staged** | | Biome |
| CI | **GitHub Actions** | Free for public repositories | |
| API docs | **OpenAPI** generated from Zod (`zod-to-openapi`) | Gives you a browsable API doc for the portfolio | Hand-written |

## 4. System Architecture

### 4.1 Context Diagram

```text
                   ┌──────────────────────────────┐
   Browser  ─────► │  Vercel: Next.js (apps/web)  │
   (event-goer,    └──────────────┬───────────────┘
    organiser,                    │ REST (via Next rewrite: same-origin cookies)
    admin)                        ▼
        │            ┌──────────────────────────────────────┐
        └──────────► │ Render: Express + Socket.IO (apps/api)│
        WebSocket    │  modules: auth, events, queue, seats, │
        (direct)     │  orders, payments, admin, notifications│
                     └───────┬───────────────────┬──────────┘
                             │                   │
                  ┌──────────▼───────┐   ┌───────▼────────┐
                  │ Neon PostgreSQL  │   │ Upstash Redis  │
                  │ (source of truth)│   │ (queue state)  │
                  └──────────────────┘   └────────────────┘
                             │
                  Resend (email) · Cloudinary (images) · Sentry (errors)
```

### 4.2 Internal Module Boundaries (apps/api)

| Module | Responsibility | Talks to |
|---|---|---|
| `auth` | Register, login, refresh, password reset, RBAC middleware | Postgres, email |
| `users` | Profile, admin user management | Postgres |
| `events` | Event and tier CRUD (organiser), public discovery queries | Postgres, Cloudinary |
| `venues` | Venue templates and seat layout generation (admin only), read access for organisers | Postgres |
| `queue` | Join, leave, admission loop, purchase passes | Redis, Postgres (write-behind), Socket.IO |
| `seats` | Seat snapshot, hold, release, expiry sweep | Postgres, Socket.IO |
| `orders` | Create order from hold, finalise, history | Postgres |
| `payments` | Provider interface, mock gateway, webhooks | Postgres |
| `tickets` | Issue, QR signing, check-in | Postgres |
| `admin` | Platform stats, audit log | Postgres |
| `realtime` | Socket.IO setup, authentication, rooms, emit helpers | Redis (presence), other modules |

**Rule:** modules call each other through exported service functions only, never by reaching into each other's Prisma queries. This keeps the later option of extracting the queue into its own service realistic.

### 4.3 Request Layering

```text
Route  →  Validate (Zod)  →  Auth/RBAC middleware  →  Controller  →  Service  →  Repository (Prisma)
```

- Controllers are thin (parse, call, respond).
- Services hold business rules and transactions.
- Repositories wrap Prisma so that raw SQL is isolated in one place.

## 5. Hosting and Deployment (Free Tier)

### 5.1 Recommended Setup

| Component | Platform | Why |
|---|---|---|
| Frontend (`apps/web`) | **Vercel** (Hobby) | Native Next.js host, automatic deploys, preview URLs. The Hobby plan is meant for personal, non-commercial use, which fits a portfolio project |
| API and Socket.IO (`apps/api`) | **Render** free web service | Needs a host that accepts persistent WebSocket connections. Vercel Functions are serverless and are not designed to hold long-lived WebSocket connections, so the API cannot live there |
| PostgreSQL | **Neon** free plan | Permanent free Postgres, standard Postgres, scales to zero when idle |
| Redis | **Upstash** free database | Supports the standard Redis protocol, so `ioredis` works unchanged. TLS is on by default |

**Region:** choose Singapore (or the nearest Southeast Asia region) on every platform that offers it, to keep latency low for Malaysian users. Confirm region availability when creating each service.

### 5.2 Free-Tier Facts Checked on 28 October 2026

These limits change often, so re-check them before you deploy.

| Platform | What I found | Impact on EzTix |
|---|---|---|
| Render (free web service) | Spins down after 15 minutes with no inbound HTTP request or WebSocket message from an existing connection. Wakes on the next HTTP request or new WebSocket connection. Free instances have an ephemeral filesystem, can be restarted at any time, and cannot receive private network traffic | First request after idle is slow (cold start of roughly 30 to 60 seconds according to community reports). Process memory is lost on spin-down or restart, which is why queue state must live in Redis and Postgres, not in memory |
| Neon (free plan) | 100 compute-hours per project per month, compute suspends after 5 minutes idle, and a 6-hour restore window. Storage is listed as 0.5 GB per project on the pricing page, while a newer announcement says 1 GB, so verify at signup | Fine for a portfolio. Keep health checks off the database so the compute can sleep. First query after idle adds a short wake-up delay |
| Upstash Redis (free) | 256 MB data, 500K commands per month, up to 10,000 commands per second, one free database per account | The 500K monthly command cap is the tightest constraint in the whole stack, see 5.3 and 8.6 |
| Vercel (Hobby) | Free for personal use | No concern for the frontend |

### 5.3 Handling the Free-Tier Constraints

1. **Cold starts.** Show a friendly "Waking up the server…" state in the frontend when the first API call is slow. Before a demo or interview, hit `/health` yourself to warm it up. Optionally use a free uptime monitor (for example UptimeRobot) pinging `/health` every 10 minutes to keep the service awake. One always-on service uses about 720 of the free monthly instance hours, so this fits, but only one service can do it.
2. **Health endpoint must not touch the database or Redis**, so pings do not wake Neon or consume Upstash commands.
3. **Redis command budget.** Never run a loop against Redis when nothing is happening. See 8.6.
4. **No local file storage.** Poster images go to Cloudinary.
5. **Migrations.** Run `prisma migrate deploy` as part of the Render start command or build step. In Prisma 7 the CLI reads its database URL from `prisma.config.ts`, so point that at Neon's **direct** connection string (`DIRECT_URL`) for migrations, and give the running app's driver adapter the **pooled** connection string (`DATABASE_URL`). See the BSD, section 5.2.
6. **Real load tests are run locally** against Docker Postgres and Redis, never against the free cloud services.

### 5.4 If You Outgrow Free Tier

Upgrading Render to a paid instance removes spin-down. Neon and Upstash have pay-as-you-go plans that keep the same connection strings. An always-free VM from a cloud provider is another option, but it means you manage the server yourself, so I would only consider it if you want the DevOps experience for your portfolio.

### 5.5 Cross-Origin Setup

The web app (Vercel domain) and API (Render domain) are different sites. Browsers increasingly block third-party cookies, which would break login. To avoid this:

- **REST calls** go through **Next.js rewrites** (`/api/*` proxied to the Render API), so the browser sees one origin and the refresh-token cookie is first-party.
- **Socket.IO connects directly** to the Render URL, because proxying WebSockets through Vercel is not appropriate. It authenticates using a short-lived **socket token** obtained through the proxied REST API (see 7.3), so it does not need cookies.
- If you later buy a domain, hosting both under subdomains of the same domain (for example `www.` and `api.`) is the cleaner long-term option.

## 6. Repository and Code Structure

```text
eztix/
├─ apps/
│  ├─ web/                    # Next.js
│  │  ├─ app/                 # routes: (public), (auth), organiser/, admin/, queue/, checkout/
│  │  ├─ components/          # ui/ (shadcn), seat-map/, queue/, forms/
│  │  ├─ lib/                 # api client, socket client, auth helpers
│  │  └─ stores/              # zustand stores
│  └─ api/                    # Express
│     ├─ prisma/              # schema.prisma, migrations, seed.ts
│     └─ src/
│        ├─ modules/          # auth, events, queue, seats, orders, payments, tickets, admin
│        ├─ realtime/         # socket.io server, rooms, emitters
│        ├─ jobs/             # cron jobs
│        ├─ middleware/       # auth, rbac, error, rate-limit, request-id
│        ├─ lib/              # prisma, redis, logger, config, jwt
│        └─ server.ts
├─ packages/
│  └─ shared/                 # zod schemas, types, enums, constants
├─ docker-compose.yml         # postgres, redis, mailpit
├─ .github/workflows/         # ci.yml
└─ docs/                      # PRD, TRD, AFD, DBD, BSD, IPD
```

**Naming and style:** `camelCase` in TypeScript, `snake_case` in database columns (Prisma `@map`), `kebab-case` for file names. Strict TypeScript (`strict: true`), no `any` in the shared package.

## 7. Authentication and Authorisation

### 7.1 Approach

Custom email and password authentication in Express. A library such as Auth.js is designed around Next.js and fits a separate Express API poorly, and building this yourself is good portfolio evidence.

### 7.2 Tokens

| Token | Lifetime | Storage | Purpose |
|---|---|---|---|
| Access token (JWT) | 15 minutes | In memory on the client | Authorises API calls |
| Refresh token | 7 to 30 days | `httpOnly`, `Secure`, `SameSite=Lax` cookie, hash stored in Postgres | Silent re-login, rotated on each use, revoked on logout and password change |
| Socket token (JWT) | 60 seconds | Fetched just before connecting | Authenticates the Socket.IO handshake |
| Purchase pass (JWT) | 10 minutes (configurable) | Held in memory on the client | Proves queue admission, see section 8 |
| Email verify and reset tokens | 1 hour (verify 24 hours) | Random token, hash stored in Postgres | Single use |

### 7.3 Socket Authentication

1. Client calls `POST /api/v1/auth/socket-token` (authenticated by access token).
2. Client opens Socket.IO with `auth: { token }`.
3. Server verifies the token in a Socket.IO middleware and attaches `userId` and `role` to the socket.
4. The socket joins a private room `user:{userId}` for direct messages (for example "you are admitted").

### 7.4 Authorisation

- Three roles: `EVENT_GOER`, `ORGANISER`, `ADMIN`.
- `requireRole(...)` middleware on every protected route.
- **Ownership checks** in services: an organiser can only read or write events where `organiserId` equals their own ID (PRD ORG-09).
- Suspended users are rejected at login, on refresh and in the auth middleware (a cached `status` check is acceptable).
- Organiser creation: admin submits name, email and company, the system creates the account with a random single-use **invite token** and emails a set-password link, so no plain passwords are ever sent.

## 8. FIFO Queue Design

This is the signature feature, so it gets the most detail.

### 8.1 Requirements Recap

Strict arrival order, one position per user per event, fair pre-queue, live position, controlled admission, time-limited passes, reconnect grace, survive restart (PRD QUE-01 to QUE-12).

### 8.2 Data Structures

**Redis (fast, ordered):**

| Key | Type | Purpose |
|---|---|---|
| `q:{eventId}:seq` | String (counter) | `INCR` gives every join a unique, strictly increasing sequence number. This is the FIFO order. The server assigns it, never the client |
| `q:{eventId}:waiting` | Sorted set (member `userId`, score `seq`) | The line. `ZADD NX` means a second join by the same user changes nothing, which enforces one position per user (QUE-03) and keeps the original place on re-join |
| `q:{eventId}:active` | Sorted set (member `userId`, score pass-expiry timestamp) | Users currently holding a purchase pass. `ZCARD` gives the current purchase-stage load |
| `q:{eventId}:admitted_seq` | String | Highest sequence number admitted so far, used for cheap position estimates |
| `q:{eventId}:lastseen` | Sorted set (member `userId`, score disconnect timestamp) | For the reconnect grace period |
| `q:{eventId}:config` | Hash | Cached admission rate, max active, pass duration, status |

**PostgreSQL (durable record, write-behind):** a `queue_entries` table with `event_id`, `user_id`, `seq`, `joined_at`, `status` (`WAITING`, `ADMITTED`, `COMPLETED`, `EXPIRED`, `LEFT`), `admitted_at`. It is written asynchronously after each Redis change. If Redis is wiped, the waiting set is rebuilt from this table ordered by `seq` (QUE-12), and the counter is restored to `MAX(seq)`.

### 8.3 Flow

```text
JOIN
  client → POST /queue/:eventId/join (access token + Turnstile token)
  server: verify event queue is open, user is not suspended
          seq = INCR q:{e}:seq
          ZADD NX q:{e}:waiting seq userId
          mySeq = ZSCORE q:{e}:waiting userId     (original seq if already joined)
          enqueue write-behind to Postgres
  reply : { mySeq, position (ZRANK+1), total (ZCARD), estWait }
  client: connects socket, joins room queue:{eventId}

WAIT
  server (admission loop, see below) broadcasts to room queue:{eventId}
          { lastAdmittedSeq } whenever the line advances
  client: position ≈ mySeq − lastAdmittedSeq   (no Redis call needed)
          every ~15 s or after reconnect: GET /queue/:eventId/me for the exact rank

ADMIT
  admission loop pops the next users and issues passes (8.4)
  server → socket room user:{userId}: "queue:admitted" { passToken, expiresAt }
  client redirects to seat selection

PURCHASE
  every seat/hold/order endpoint requires: valid pass JWT AND userId present in q:{e}:active
  order completed, abandoned, or pass expired  →  ZREM from active (frees capacity)
```

### 8.4 Admission Loop

A single loop per open queue runs on the API server, roughly once per second.

1. Remove expired passes: `ZREMRANGEBYSCORE active -inf now`.
2. Remove users who have been disconnected longer than the grace period (default 2 minutes) from `waiting` (QUE-08).
3. Compute `slots = min(batchSize, maxActive − ZCARD(active))`.
4. Atomically pop up to `slots` users from `waiting` (`ZPOPMIN`) and add them to `active` with an expiry score. This runs in **one Lua script** so that two loop runs can never admit the same user or exceed `maxActive`.
5. Update `admitted_seq` to the highest admitted sequence number.
6. Sign a purchase pass for each admitted user, emit `queue:admitted` to each `user:{id}` room, and emit `queue:progress { lastAdmittedSeq }` to the event room.

**Why strict FIFO holds:** the order is the Redis sequence number assigned at join. `ZPOPMIN` always returns the lowest score first. Nothing about the client, network speed or retry behaviour can change a user's score.

**Admission rate and capacity** are per-event settings (QUE-06, QUE-10): `batchSize`, `intervalSeconds`, `maxActive`, `passDurationSeconds`.

### 8.5 Edge Cases

| Case | Behaviour |
|---|---|
| User opens two tabs or two devices | Same `userId`, `ZADD NX` keeps one position. Both sockets join the same user room, so both receive updates |
| User refreshes or loses connection | Server records disconnect time in `lastseen`. Reconnect within grace keeps the place. After grace the user is removed (re-joining puts them at the back) |
| API server restarts or Render spins down | Queue is in Redis, so order is preserved. On boot, the server rebuilds the in-memory presence map and treats all waiting users as "just disconnected" to give them a fresh grace period |
| Redis data lost | Rebuild from `queue_entries` in Postgres |
| Pass expires while the user is on the seat map | Server rejects further calls, releases that user's seat holds, and tells the client to return to the queue page |
| Admission pool full and nobody finishes | Passes expire after their duration, which frees slots automatically |
| Event sells out while people wait | Close the queue, broadcast `queue:closed { reason: "SOLD_OUT" }`, move waiting entries to `EXPIRED` |
| Pre-queue (before on-sale) | Queue room opens at a configurable time before on-sale. Users join and receive a real `seq`. Admission starts at the on-sale time, so people who joined earlier are strictly ahead |
| Bot floods the join endpoint | Turnstile on join, per-IP and per-user rate limits, verified email required, suspended users blocked |

### 8.6 Redis Command Budget (Upstash Free: 500K per Month)

The free tier is generous for a demo but fatal for naive polling. Rules:

- **The admission loop only runs while a queue is open and has waiting users or active passes.** Track this in memory. An idle loop at one run per second would consume 86,400 commands per day and exhaust the monthly allowance in about six days.
- **Use the `lastAdmittedSeq` trick** (8.3) so that updating hundreds of waiting clients costs zero extra Redis commands. Socket.IO fans out from the API server's memory.
- **No per-heartbeat Redis writes.** Presence is tracked in memory. Redis is written only on disconnect and reconnect.
- **Use in-memory rate limiting** for MVP (`express-rate-limit` default store) rather than a Redis store. This is acceptable on one instance.
- **Do not use the Socket.IO Redis adapter** while running a single instance, because it adds pub/sub commands. Add it only if you scale to multiple instances.
- **Develop and load-test against local Redis** in Docker.
- A rough budget for a demo is a few hundred test users joining and being admitted per month, which is well under the cap. Add a simple counter metric in logs to track usage.

## 9. Seat Selection and Real-Time Design

### 9.1 Seat Model (Summary)

A venue has sections, rows and seats (geometry). For each event, an `event_seats` row exists per seat, carrying its status, tier and price. Full tables are in the Database Design and Backend Schema documents. Statuses: `AVAILABLE`, `HELD`, `SOLD`, `BLOCKED`.

General admission is modelled as inventory per **GA section** (`ga_capacity`, `ga_sold`, `ga_held` on `event_sections`) rather than one row per person.

**Static vs dynamic data (performance):**

- **Geometry** (seat coordinates, section shapes) never changes for a venue, so it is fetched once and cached heavily.
- **Status** (the dynamic part) is a compact payload of `{ seatId: status }` or per-section arrays, which keeps a snapshot small even for thousands of seats.

### 9.2 Atomic Hold (No Double-Selling)

The hold is one conditional `UPDATE` inside a transaction. PostgreSQL row locks serialise concurrent attempts, so only one buyer can win a given seat.

```sql
-- Rows are locked in a fixed order (ORDER BY id FOR UPDATE), so two buyers selecting
-- overlapping seats cannot deadlock each other. Verified in the BSD (section 9.1).
WITH target AS (
  SELECT id FROM event_seats
  WHERE event_id = $eventId AND idx = ANY($seatIdx::int[])
  ORDER BY id
  FOR UPDATE
)
UPDATE event_seats s
SET status = 'HELD', hold_id = $holdId, hold_expires_at = $holdExpiresAt
FROM target t
WHERE s.id = t.id
  AND (s.status = 'AVAILABLE' OR (s.status = 'HELD' AND s.hold_expires_at <= now()))
RETURNING s.idx;
```

- If the number of returned rows is **less than** the number requested, the whole transaction is rolled back (all-or-nothing) and the API replies `409 SEAT_UNAVAILABLE` with the list of conflicting seats.
- A unique constraint and `CHECK` constraints on `event_seats` act as a second line of defence.
- This is written as raw SQL through Prisma (`$queryRaw` inside an interactive transaction), because Prisma's query builder cannot express this conditional lock cleanly.
- **Lazy expiry:** expired holds are treated as available by the query itself, so correctness never depends on the sweeper job running.

For general admission: `UPDATE event_sections SET ga_held = ga_held + $qty WHERE event_id = $eventId AND section_key = $key AND ga_sold + ga_held + $qty <= ga_capacity RETURNING ga_held`, which is atomic for the same reason.

### 9.3 Hold Lifecycle

```text
AVAILABLE ──hold──► HELD ──payment success──► SOLD
                     │  ▲
                     │  └── user changes selection (release some, hold others)
                     ├── user cancels            ──► AVAILABLE
                     ├── hold expires (8 min)    ──► AVAILABLE   (sweeper + lazy)
                     └── pass expires / payment failed and window over ──► AVAILABLE
```

- Per-order seat limit (default 6) enforced in the service, and also as a per-user total of active holds per event.
- The hold countdown in the UI is driven by the server's `hold_expires_at`, never by the client's clock alone.

### 9.4 Real-Time Updates (Socket.IO)

**Rooms:** `event:{eventId}:seats` (everyone viewing that map), `queue:{eventId}`, `user:{userId}`.

**Events (server → client):**

| Event | Payload | When |
|---|---|---|
| `seats:changed` | `{ version, changes: [{ seatId, status }] }` | After a hold, release, sale or expiry commits |
| `hold:expired` | `{ holdId }` | Sent to the owner via `user:{id}` |
| `queue:progress` | `{ lastAdmittedSeq, total }` | Queue advances |
| `queue:admitted` | `{ passToken, expiresAt }` | User admitted |
| `queue:closed` | `{ reason }` | Sold out or ended |

**Rules that keep the map correct:**

1. **Emit after commit, never before.** A rollback must not produce a phantom update.
2. **Batch and throttle.** Collect changes and flush at most every 250 ms, so one busy moment does not flood clients.
3. **Version numbers.** Each event keeps a monotonically increasing version counter **in API process memory** (not a database column, to avoid every hold updating one hot row), sent together with an `epoch` that changes whenever the process restarts. The client applies deltas in order. If it sees a gap, or after any reconnect, it refetches the full snapshot (`GET /events/:id/seats`).
4. **Snapshot first, then subscribe.** The client joins the room, then fetches the snapshot, then applies any deltas with a higher version, so nothing is missed between the two steps.
5. **The server is still the authority.** A seat that looks available can still be refused at hold time. The UI handles `409` gracefully ("That seat was just taken").

### 9.5 Polling Fallback (PRD SEAT-08)

If the socket fails to connect or drops repeatedly, the seat map falls back to polling `GET /events/:id/seats` every 5 seconds using `ETag` or `If-None-Match`, so unchanged maps return `304`. This fallback is built **first**, because it makes the product correct on its own. Socket.IO is then layered on top. That order also gives you a safe downgrade path if real-time proves too complex.

### 9.6 Seat Map Rendering

- SVG with one `<rect>` or `<circle>` per seat, wrapped in memoised React components, so that a single status change re-renders only that seat.
- Pan and zoom through `react-zoom-pan-pinch`, plus tap targets large enough on mobile.
- Colour by tier, with a legend. Do not rely on colour alone: also use shape or pattern for held and sold seats (accessibility).
- If a venue grows beyond roughly several thousand seats and SVG becomes slow, switch the render layer to canvas (Konva) without changing the data flow.

## 10. Checkout and Mock Payment Design

### 10.1 Provider Interface

```ts
interface PaymentProvider {
  createPayment(input: { orderId: string; amount: number; currency: 'MYR';
                         method: PaymentMethod; returnUrl: string }): Promise<{ paymentId: string; redirectUrl: string }>;
  verifyWebhook(rawBody: string, signature: string): boolean;
  parseWebhook(rawBody: string): { paymentId: string; status: 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'TIMEOUT' };
}
```

`MockPaymentProvider` implements this now. A real provider (for example Billplz, iPay88, Curlec or Stripe) can be added later without touching the order logic (PRD PAY-04).

`PaymentMethod` enum: `FPX`, `CARD`, `TNG_EWALLET`, `GRABPAY`, `BOOST`, `SHOPEEPAY`.

### 10.2 Flow

```text
1. POST /orders                 { holdId, idempotencyKey }
      → order PENDING, price snapshot taken, fees/tax computed on the server
2. POST /orders/:id/pay         { method }
      → payment record CREATED, returns redirectUrl → /mock-gateway/[paymentId]
3. Mock gateway page (Next.js)  looks like a bank / eWallet screen.
      Test panel lets you choose: Success, Fail, Cancel, Timeout, Delayed success.
4. Mock gateway → API           POST /webhooks/mock-payments  (HMAC-signed, like a real gateway)
5. API finalises in one DB transaction:
      SUCCEEDED → order PAID, seats HELD→SOLD, tickets issued, pass released (ZREM active),
                  confirmation email queued, seats:changed emitted
      FAILED / CANCELLED / TIMEOUT → payment FAILED, order stays PENDING until the hold
                  expires, user may retry within the hold window
6. Client returns to /orders/:id which polls (or listens on the socket) for the final status
```

### 10.3 Correctness Rules

- **Idempotency:** `idempotencyKey` is unique per order creation. The webhook handler is idempotent by `paymentId`, so a duplicate webhook or a double-click never creates two orders or tickets (PAY-06).
- **Price integrity:** price, fees and tax are computed server-side from the tier and settings at order creation and stored as a snapshot. The client never sends a price.
- **Hold must still be valid** when payment succeeds. If the hold expired and the seat was taken by someone else, the order becomes `FAILED_SEATS_LOST` and is marked for simulated refund. The success webhook handler checks this inside the transaction.
- **Webhook authenticity:** verify the HMAC signature even for the mock, so that swapping in a real gateway needs no redesign.
- **State machine** (enforced in code): `PENDING → PAID | CANCELLED | EXPIRED | FAILED_SEATS_LOST`, and `PAID → REFUNDED`. Illegal transitions throw.

### 10.4 Tickets and QR

- One `tickets` row per seat or GA unit, with a unique `ticket_code`.
- QR payload is a signed token (`ticketId` plus HMAC signature), so it cannot be forged or guessed.
- QR images are rendered on the client from the payload.
- Check-in (P2): an organiser endpoint verifies the signature and sets `used_at` atomically (`UPDATE ... WHERE used_at IS NULL`), so a ticket cannot be scanned twice.

## 11. Frontend Architecture

### 11.1 Rendering Strategy

| Area | Strategy | Reason |
|---|---|---|
| Home, event list, event detail | Server components with revalidation | SEO, fast first paint |
| Queue room, seat map, checkout | Client components | Real-time and interactive |
| Organiser and admin dashboards | Client components behind auth | Authenticated, no SEO need |
| Mock gateway | Client page | Simulates a third-party site |

All business logic stays in Express. Next.js route handlers are used only for the API rewrite and small UI concerns, to avoid having two backends.

### 11.2 Route Map (summary)

| Route | Access |
|---|---|
| `/`, `/events`, `/events/[slug]` | Public |
| `/login`, `/register`, `/forgot-password`, `/set-password` | Public |
| `/queue/[eventId]` | Event-goer |
| `/events/[slug]/seats` | Event-goer with a valid pass |
| `/checkout/[orderId]`, `/mock-gateway/[paymentId]` | Event-goer |
| `/account`, `/account/tickets`, `/account/orders` | Event-goer |
| `/organiser/**` | Organiser |
| `/admin/**` | Admin |

Route protection happens in Next.js middleware (fast redirect) **and** in the API (real enforcement).

### 11.3 State and Data

- TanStack Query for server data (events, orders, snapshots).
- Zustand store for the in-progress seat selection, queue state, pass token and hold countdown.
- A single typed `apiClient` wraps `fetch`, attaches the access token, refreshes it once on `401`, and parses errors into the standard format (section 12).
- A single `socketClient` manages connection, token refresh before reconnect, and room joins.

### 11.4 Quality

- Mobile-first layouts, large tap targets on the seat map.
- Time shown in MYT (`Asia/Kuala_Lumpur`) through `Intl.DateTimeFormat`. Prices through `Intl.NumberFormat('ms-MY', { currency: 'MYR' })`.
- Loading, empty and error states for every data screen.
- Accessible forms and focus handling, keyboard-operable seat selection as a goal.

## 12. API Conventions

- **Base path:** `/api/v1`. JSON only.
- **Auth header:** `Authorization: Bearer <accessToken>`.
- **Purchase pass header:** `X-Purchase-Pass: <passToken>` on seat, hold and order endpoints when the event has a queue.
- **Timestamps:** ISO 8601 in UTC (`timestamptz` in the database). Convert to MYT only for display.
- **Money:** integer **sen** (1 MYR = 100 sen) in the database and API, to avoid floating-point errors. Format only in the UI.
- **IDs:** UUID (v7 if available, for index-friendly ordering) or cuid. Public event URLs use a human-readable `slug`.
- **Pagination:** cursor-based for large lists, `page` and `limit` is acceptable for admin tables.
- **Error format:**

```json
{
  "error": {
    "code": "SEAT_UNAVAILABLE",
    "message": "Some seats are no longer available.",
    "details": { "seatIds": ["..."] },
    "requestId": "req_abc123"
  }
}
```

- **Status codes:** `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict (seats, idempotency), `429` rate limited, `5xx` server.
- **Validation:** every endpoint validates `params`, `query` and `body` with a Zod schema from `packages/shared`.
- **Documentation:** OpenAPI generated from those schemas. Detailed endpoint contracts belong in the Backend Schema Documentation.

## 13. Background Jobs

Running inside the API process with `node-cron` for the MVP:

| Job | Frequency | Action |
|---|---|---|
| Admission loop | About 1 s per open queue (only while active) | Section 8.4 |
| Hold sweeper | Every 30 s | Release expired holds, emit `seats:changed`, notify owners |
| Order expiry | Every 60 s | Mark `PENDING` orders whose hold expired as `EXPIRED` |
| Queue write-behind flush | Every few seconds, batched | Persist queue entries to Postgres |
| Event lifecycle | Every 60 s | Move events to ON_SALE or ENDED and open or close queues at scheduled times |
| Cleanup | Daily | Delete expired tokens and old sessions |

**Free-tier note:** if Render spins the service down, these jobs stop with it. That is acceptable because correctness does not depend on them: expired holds are treated as available by the query itself (9.2), and the lifecycle job catches up on wake-up. If you later need guaranteed scheduling, move to BullMQ (note that it uses Redis continuously, so it conflicts with the Upstash free command cap) or a separate scheduler.

## 14. Security and PDPA

### 14.1 Application Security

| Area | Measure |
|---|---|
| Passwords | argon2 hashing, minimum length, breach-list check is optional (P2) |
| Sessions | Short access token, rotating refresh token, revoke on logout and password change |
| Transport | HTTPS only, `Secure` cookies, HSTS |
| Input | Zod validation everywhere, Prisma parameterised queries, raw SQL only with bound parameters |
| Output | React escapes by default. Sanitise any organiser-supplied rich text or restrict it to plain text or a safe Markdown subset |
| CSRF | Refresh-token cookie is `SameSite=Lax` and only used on the refresh endpoint. Access tokens are sent in a header, not a cookie |
| CORS | Allow only the known web origin(s) for REST and Socket.IO |
| Headers | `helmet` defaults plus a Content Security Policy on the web app |
| Rate limits | Stricter on login, register, password reset, queue join, hold and pay |
| Bot protection | Turnstile on register, login after repeated failures, and queue join |
| Secrets | Environment variables only, never committed. Separate secrets per environment. `.env.example` is committed |
| Uploads | Validate type and size, upload directly to Cloudinary using signed parameters |
| Authorisation | Role and ownership enforced on the server for every protected route |
| Audit | Admin actions are written to the application log for now. A database audit log (PRD ADM-06) is deferred |
| Dependencies | Dependabot and `pnpm audit` in CI. Pin versions when adding libraries, and prefer releases that have been public for a couple of weeks |

### 14.2 PDPA 2010 (Malaysia)

- **Collect the minimum:** name, email, optional phone. No national ID numbers, no card data (payments are mocked).
- **Consent and notice:** a privacy policy page and a consent checkbox at registration, recording the policy version and timestamp.
- **Access and correction:** the profile page lets users view and edit their data.
- **Deletion:** only admins can delete an account. Users contact support, and the admin runs an anonymisation that removes personal data while retaining order records needed for accounting (order data is kept without personal identifiers). Deletion is blocked while the user has upcoming paid tickets or an organiser has live events.
- **Retention:** define how long queue entries, logs and expired tokens are kept, and purge them on schedule.
- **Logging:** do not log passwords, tokens or full personal data. Mask emails in logs.
- **Disclosure:** document third-party processors (email, image, error tracking, hosting), as these receive some personal data.

This is an engineering guide, not legal advice. If EzTix ever handles real customers, have a qualified professional review compliance.

## 15. Testing Strategy

| Layer | Tooling | What to cover |
|---|---|---|
| Unit | Vitest | Pure logic: price and fee calculation, state machines, pass signing, queue position math |
| Integration (API) | Vitest + Supertest + a real Postgres and Redis (Docker, or Testcontainers) | Every endpoint, auth and role matrix, hold and order flow, webhook idempotency |
| **Concurrency** | Vitest scripts firing parallel requests | 100 parallel holds on the same seat produce exactly one winner. Parallel GA purchases never exceed capacity. Duplicate webhooks produce one ticket set |
| **Queue correctness** | Integration tests | N users join in known order, admission order equals join order. Double join keeps one position. Disconnect and reconnect within grace keeps place. Redis wipe then rebuild restores order |
| End-to-end | Playwright with multiple browser contexts | Two users race for one seat. Full journey from queue to e-ticket. Organiser creates and publishes an event. Admin creates an organiser |
| Load | k6 | Ramp virtual users through join, wait, admit, hold and pay. Measure hold latency and queue accuracy |
| Real-time | Integration with `socket.io-client` | Delta ordering, gap detection, reconnect snapshot |
| Static | TypeScript strict, ESLint | Type errors fail CI |

**Test data:** a Prisma seed script that creates an admin, two organisers, sample venues (a small theatre with reserved seats, a hall with GA), and a few events at different statuses.

## 16. CI/CD and Environments

### 16.1 Environments

| Environment | Web | API | DB | Redis |
|---|---|---|---|---|
| Local | `localhost:3000` | `localhost:4000` | Docker Postgres | Docker Redis |
| Production (demo) | Vercel | Render | Neon (main branch) | Upstash |
| Preview (optional) | Vercel preview | Local or shared staging | Neon branch | Local |

Neon supports database branching, so a separate branch can serve as a staging database at no extra cost. Create a staging setup only if you find you need it.

### 16.2 GitHub Actions Pipeline

1. Install dependencies with the pnpm cache.
2. Lint and typecheck all packages.
3. Run unit and integration tests (Postgres and Redis service containers).
4. Build web and API.
5. On the `main` branch, Vercel and Render auto-deploy from the repository. Prisma migrations run on API deploy.

### 16.3 Configuration

- Validate environment variables at boot with Zod and fail fast if anything is missing.
- Key variables: `DATABASE_URL` (pooled), `DIRECT_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PASS_SECRET`, `WEBHOOK_SECRET`, `WEB_ORIGIN`, `TURNSTILE_SECRET`, `RESEND_API_KEY`, `CLOUDINARY_*`, `SENTRY_DSN`.

## 17. Observability

- **Logs:** pino JSON logs with a `requestId` on every line, plus `userId` and `eventId` where relevant. Render keeps recent logs, so ship nothing extra for MVP.
- **Errors:** Sentry in both apps, with source maps for the web app.
- **Health:** `GET /health` (liveness, no dependencies) and `GET /ready` (checks Postgres and Redis, for manual use only, since it wakes the database).
- **Domain metrics (logged as structured events, dashboard optional):** queue length per event, admission rate, active passes, hold success and conflict counts, payment outcomes, Redis commands used per day.
- **Admin dashboard** (PRD ADM-05) doubles as a lightweight business-metrics view.

## 18. Performance Targets and Capacity Reality Check

The PRD target is **5,000 concurrent queued users**. That is a sensible design target but not something the free tier will necessarily serve. Treat it in two parts:

| Target | How to validate |
|---|---|
| Design correctness at high concurrency (ordering, no double-selling, fair admission) | k6 and concurrency tests locally against Docker Postgres and Redis. This is what you present in your portfolio write-up |
| Live capacity on free hosting | Free instances have limited memory and CPU, and Socket.IO holds one connection per waiting user. Measure how many concurrent sockets your Render instance really handles, and document the number honestly |

Other targets carried from the PRD: event pages under 2 seconds on 4G (achievable through server rendering and caching), and hold API under 500 ms at p95 (achievable with the single-statement hold query and indexes on `(event_id, status)` and `(event_id, seat_id)`).

**Design choices that protect capacity:**

- The `lastAdmittedSeq` broadcast keeps per-user updates cheap.
- Payload sizes are small (compact status maps, deltas rather than full snapshots).
- Polling intervals are conservative and backed off when the tab is hidden.
- Cache public event reads with short TTLs and Next.js revalidation.

## 19. Key Decisions and Trade-offs

| # | Decision | Reason | Trade-off |
|---|---|---|---|
| D1 | Modular monolith, not microservices | Solo developer, simple deploys | Single process is a scaling ceiling. Module boundaries keep extraction possible |
| D2 | API hosted on Render, not Vercel | Socket.IO needs persistent connections | Free tier cold starts. Two platforms to manage |
| D3 | Postgres is the inventory authority, Redis is not | Durable, transactional, constraint-enforced | Slightly slower than Redis locks, still fast enough with the single-statement hold |
| D4 | Redis sorted set with server-issued sequence for the queue | Strict FIFO, atomic pops via Lua, one position per user | Needs write-behind and a rebuild path for durability |
| D5 | Polling fallback built before sockets | Product is correct without real-time, safe downgrade | Slightly more initial work |
| D6 | REST through Next.js rewrite, sockets direct | Avoids third-party cookie problems | Extra hop on REST calls |
| D7 | Custom auth instead of a library | Clean fit with a separate Express API, strong portfolio signal | More security responsibility, mitigated by established patterns |
| D8 | Money as integer sen | No floating-point errors | Format at the edges |
| D9 | In-process cron, not BullMQ | Avoids continuous Redis commands on the free tier | Jobs pause when the service sleeps. Lazy expiry covers correctness |
| D10 | Mock payments behind a provider interface, with signed webhooks | Realistic flow, swappable later | More code than a simple "mark as paid" button |
| D11 | SVG seat map first | Simple and accessible | May need canvas for very large venues |
| D12 | No Socket.IO Redis adapter initially | Saves Redis commands on a single instance | Must add it before running multiple instances |

## 20. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Upstash command cap is exhausted | Queue stops working | Command budget rules (8.6), usage logging, local Redis for dev and tests, upgrade path to pay-as-you-go |
| Render cold start ruins a demo | Poor first impression | Pre-warm, keep-alive ping, friendly wake-up UI |
| Neon compute-hours exhausted | Database suspends until next month | Keep health checks off the DB, avoid polling the DB from idle clients, monitor usage |
| Free-tier terms change | Hosting breaks or costs money | Keep infrastructure behind env variables and standard protocols (Postgres, Redis, Node), so migration is easy |
| Seat hold race condition | Double-sold seat | Single conditional UPDATE, constraints, concurrency tests in CI |
| Real-time desync on the seat map | Users see wrong availability | Versioned deltas, snapshot-then-subscribe, polling fallback, server-side validation |
| Scope too large for solo, part-time work | Never finishes | Build in the order set by the IPD, keep P1 and P2 items optional |
| Prisma and pooled connections quirks | Migration or connection errors | Use separate direct and pooled URLs, test the deploy path early |

## 21. PRD Traceability

| PRD area | Technical approach |
|---|---|
| AUTH-01 to 06 | Section 7, custom JWT auth with RBAC, invite flow for organisers |
| DISC-01 to 06 | Section 11, server-rendered pages, Prisma queries with filters and indexes |
| QUE-01 to 12 | Section 8 |
| SEAT-01 to 06, 09 | Sections 9.1 to 9.3 |
| SEAT-07 and SEAT-08 | Sections 9.4 and 9.5 |
| PAY-01 to 06 | Section 10 |
| TIX-01 to 05 | Section 10.4 |
| ORG-01 to 09 | Modules `events` and `seats`, ownership checks (7.4). Organisers select an admin-managed venue, so no seat builder is needed on the organiser side |
| ADM-08 | Module `venues`: admin creates venues from templates, and the API generates the seat layout. Layout is locked once an event uses the venue |
| ADM-01 to 07 | Module `admin`, invite flow (7.4), audit log table |
| NOT-01 and NOT-02 | Resend (email), socket events (in-app) |
| Non-functional (security, PDPA, performance) | Sections 14 and 18 |

## 22. Open Items

These carry into the next documents:

1. The six open questions at the end of the PRD still use their default assumptions (strict FIFO by join time, login required to buy, six tickets per order, English first, fee and tax configurable, admin override for events). Tell me any you want changed and I will update both documents.
2. **Seat builder scope (resolved):** venues are created by admins from templates. Organisers pick a venue and assign tiers and prices to its sections. The AFD defines the flows.
3. **Domain name:** a custom domain would simplify cookies and email. Not required for MVP.
4. **Free-tier numbers** in section 5.2 should be re-checked at deployment time.

# EzTix Product Requirements Document

_Malaysia's local event ticketing platform_

| | |
|---|---|
| **Document code** | PRD |
| **Version** | 1.0 (Draft) |
| **Date** | 28 October 2026 |
| **Market** | Malaysia |

## Table of Contents

- 1. Document Control
- 2. Product Overview
- 3. Users and Personas
- 4. Scope and Release Plan
- 5. User Journeys (Summary)
- 6. Functional Requirements
- 7. Non-Functional Requirements
- 8. Success Metrics
- 9. Assumptions, Constraints and Dependencies
- 10. Risks and Mitigations
- 11. Open Questions
- 12. Glossary

---

## 1. Document Control

| Item | Detail |
|---|---|
| Product | EzTix, event ticketing platform (web) |
| Document | Product Requirements Document (PRD) |
| Status | Draft v1.0 |
| Related documents | TRD, AFD, DBD, BSD, IPD (to follow) |
| Priority labels | P0 = must-have for MVP, P1 = should-have, P2 = nice-to-have / stretch |

## 2. Product Overview

### 2.1 Purpose

This document defines what EzTix must do, who it serves, and how success will be measured. It is the source of truth for scope. The TRD, AFD, DBD, BSD and IPD derive from it.

### 2.2 Vision

EzTix is a web-based event ticketing platform focused on local events in Malaysia, inspired by platforms such as GoLive Asia. It gives event-goers a fair, reliable way to buy tickets for high-demand events, and gives organisers the tools to publish and manage their events.

### 2.3 Problem Statement

- **Unfair high-demand sales:** when popular concerts or shows go on sale, the site crashes or bots and fast connections win. Genuine fans lose out.
- **Opaque seat selection:** buyers often cannot see which seats are available, which leads to overselling, double-booking and frustration.
- **Organiser overhead:** smaller local organisers lack simple tools to create events, set ticket tiers and monitor sales.
- **Platform control:** operators need one place to onboard organisers and manage users.

### 2.4 Goals

- Deliver a true first-in, first-out (FIFO) virtual queue so access to checkout is granted strictly in arrival order.
- Let buyers choose their own seats from an interactive seating map, with live availability where feasible.
- Offer a complete checkout experience with multiple Malaysian payment methods (simulated in MVP).
- Give organisers self-service event management and sales visibility.
- Give admins control over organisers and all platform users.

### 2.5 Non-Goals (MVP)

- Real payment processing or settlement (payments are mocked).
- Native iOS or Android apps (web only; the web app must be mobile-responsive).
- Events outside Malaysia, and multi-currency support (MYR only).
- Resale / secondary marketplace and ticket transfers between users.
- Organiser payouts and automated financial reconciliation.
- Physical ticket scanning hardware integration (QR codes are generated; a basic web check-in may be considered P2).

## 3. Users and Personas

| Role | Description | Primary needs |
|---|---|---|
| Event-goer | Public user in Malaysia who browses events and buys tickets. Can browse as a guest; must log in to queue and purchase. | Find local events fast<br>Fair access in the queue<br>See and pick seats<br>Pay with a familiar method<br>Receive and keep tickets |
| Organiser | Account created by an admin. Represents a promoter, venue or company running events. | Create and publish events<br>Define venues, seating and ticket tiers<br>Control on-sale timing and queue<br>Monitor sales and attendees |
| Admin | Platform operator with full control. | Create organiser accounts<br>Manage all users<br>Oversee all events and orders<br>Platform-wide visibility |

### 3.1 Example Personas

- **Aina, 24, KL (event-goer):** wants Sunday-concert tickets the moment they go on sale and is tired of crashed sites. Mostly uses her phone browser.
- **Raj, 38, Penang (organiser):** runs mid-sized comedy and music nights. Needs a simple dashboard to set up seating and see how sales are going.
- **Siti, 30 (admin):** onboards new organisers, resolves user issues and monitors the platform.

## 4. Scope and Release Plan

| Phase | Content | Priority |
|---|---|---|
| MVP | Auth and roles, event browse and detail, FIFO queue, seat selection (with seat holds), mock checkout, e-ticket with QR, organiser event management, admin dashboard | P0 |
| MVP+ | Real-time seat updates via WebSocket, order and sales analytics, email notifications, promo codes | P1 |
| Later | Real payment gateway, ticket transfer, check-in app, waitlist, multi-language polish, reporting exports | P2 |

Note on real-time seating: the seat map is a P0 feature but live push updates are a stated stretch item. The MVP must always be correct (no double-selling). If real-time is too complex, the fallback is a map that refreshes on an interval and re-validates every seat at hold time on the server. See section 6.4.

## 5. User Journeys (Summary)

Detailed screen-by-screen flows are in the App Flow Document (AFD). In summary:

#### Event-goer

- Browse or search events → open event page → on-sale time arrives → join queue → wait in order → admitted to purchase window → pick seats → seats held → pay (mock) → receive e-ticket.

#### Organiser

- Log in with admin-issued credentials → create event (details, venue, seating layout, ticket tiers, on-sale time, queue settings) → publish → track sales → edit or close event.

#### Admin

- Log in → create organiser account → manage users (view, suspend, reactivate, change role) → oversee events and orders.

## 6. Functional Requirements

Each requirement has an ID for traceability across the later documents.

### 6.1 Authentication and Accounts

| ID | Requirement | Pri. |
|---|---|---|
| AUTH-01 | Event-goers can register with email and password and verify their email address. | P0 |
| AUTH-02 | Users can log in, log out, and reset a forgotten password. | P0 |
| AUTH-03 | Role-based access control with three roles: event-goer, organiser, admin. Users only see features for their role. | P0 |
| AUTH-04 | Organiser accounts cannot self-register; they are created only by an admin and must change their temporary password on first login. | P0 |
| AUTH-05 | Users can view and edit their profile (name, phone) and see their order history. | P0 |
| AUTH-06 | Suspended users cannot log in or purchase. | P0 |
| AUTH-07 | Social login (Google). | P2 |
| AUTH-08 | Users cannot delete their own accounts. Only admins can delete (anonymise) an account, and deletion is blocked while the user has upcoming paid tickets or an organiser has live events. | P0 |

### 6.2 Event Discovery

| ID | Requirement | Pri. |
|---|---|---|
| DISC-01 | Home page lists featured and upcoming Malaysian events. | P0 |
| DISC-02 | Event listing supports search by name and filters for category, date range, state/city and venue. | P0 |
| DISC-03 | Event detail page shows poster, description, date and time, venue, ticket tiers with prices, on-sale status and countdown. | P0 |
| DISC-04 | Event statuses are clearly shown: upcoming, on sale, queue open, sold out, ended, cancelled. | P0 |
| DISC-05 | Guests can browse and see event details and ticket prices without logging in. Login is required to view the seat map, join a queue or buy. | P0 |
| DISC-06 | Responsive layout for mobile and desktop browsers. | P0 |
| DISC-07 | English and Bahasa Malaysia interface. | P2 |

### 6.3 FIFO Queue (Virtual Waiting Room)

The queue is the signature feature. It protects the checkout system during traffic spikes and guarantees fairness.

| ID | Requirement | Pri. |
|---|---|---|
| QUE-01 | A queue can be enabled per event. When enabled, buyers must pass through it before seat selection. | P0 |
| QUE-02 | Strict FIFO: users are admitted in the exact order they joined, determined by a server-side timestamp or sequence, never by client time. | P0 |
| QUE-03 | Each logged-in user may hold only one active queue position per event. Opening multiple tabs or devices must not create multiple positions. | P0 |
| QUE-04 | Users joining before the on-sale time wait in a pre-queue room. Joining early confers no advantage: positions for the opening moment are assigned fairly (see open question Q1). | P0 |
| QUE-05 | Users see their live position, estimated wait and total queue size, updated automatically. | P0 |
| QUE-06 | The system admits users in batches at a controlled rate set per event (for example, N users every X seconds, or a maximum concurrent number in the purchase stage). | P0 |
| QUE-07 | An admitted user receives a time-limited purchase pass (for example, 10 minutes). Expiry returns the user to the end of the queue or ends their session (configurable). | P0 |
| QUE-08 | If a user disconnects, their place is kept for a short grace period (for example, 2 minutes) and is then released. | P0 |
| QUE-09 | Admitted users who abandon their purchase free capacity so the next users are admitted. | P0 |
| QUE-10 | Organisers can pause, resume and close a live queue. Admission rate and pass duration are set before the queue opens. Admins have no live queue controls in MVP. | P1 |
| QUE-11 | Basic bot and abuse protection: rate limiting and a CAPTCHA at queue entry. | P1 |
| QUE-12 | Queue survives a server restart without losing order (state is persisted, not only held in memory). | P0 |

### 6.4 Seat Selection and Seating Maps

| ID | Requirement | Pri. |
|---|---|---|
| SEAT-01 | Organisers define a venue layout with sections, rows and seats, and can mark sections as reserved seating or general admission (standing, with a capacity count). | P0 |
| SEAT-02 | Event-goers see an interactive seating map with zoom and pan, coloured by price tier, and with clear states: available, selected by me, held by someone else, sold, unavailable. | P0 |
| SEAT-03 | Users can select multiple seats up to a per-order limit set by the organiser (default 6). | P0 |
| SEAT-04 | Selecting seats creates a temporary hold (for example, 8 minutes) with a visible countdown. Held seats cannot be selected by others. | P0 |
| SEAT-05 | The server is the single authority on availability. Two users can never be sold the same seat, even under concurrent requests. | P0 |
| SEAT-06 | Expired holds are released automatically and the seats become available again. | P0 |
| SEAT-07 | Real-time updates: when another user holds, releases or buys a seat, the map updates without a page refresh. | P1 (stretch) |
| SEAT-08 | Fallback if SEAT-07 is downgraded: map polls at a short interval and conflicts are reported clearly ("Seat just taken, please pick another"). | P0 (fallback) |
| SEAT-09 | General admission tickets are selected by quantity per tier, with stock decremented atomically. | P0 |
| SEAT-10 | "Best available" auto-select for a chosen quantity and tier. | P2 |

### 6.5 Checkout and Payments (Mocked)

| ID | Requirement | Pri. |
|---|---|---|
| PAY-01 | Checkout summary shows event, seats, price per ticket, fees, taxes (configurable rate), total in MYR, and the hold countdown. | P0 |
| PAY-02 | Supported mock methods: FPX online banking, credit/debit card, Touch 'n Go eWallet, GrabPay, Boost, ShopeePay. | P0 |
| PAY-03 | A mock payment gateway simulates redirects, success, failure, cancellation and timeout so every path can be tested. A "test mode" panel lets testers force each result. | P0 |
| PAY-04 | Payment is abstracted behind an interface so a real gateway (for example, Billplz, iPay88, Stripe or Curlec) can be swapped in later without changing the order flow. | P0 |
| PAY-05 | On success: order is confirmed, seats become sold, tickets are issued. On failure or timeout: seats are released and the user may retry within the hold window. | P0 |
| PAY-06 | Orders are idempotent: refreshing or double-clicking Pay never creates duplicate orders or tickets. | P0 |
| PAY-07 | Admin can mark an order as refunded (simulated), which cancels its tickets and returns seats to inventory (organiser-configurable). | P1 |
| PAY-08 | Promo and discount codes. | P2 |

### 6.6 Tickets and Orders

| ID | Requirement | Pri. |
|---|---|---|
| TIX-01 | Each ticket has a unique ID and a QR code. Users see tickets under "My Tickets". | P0 |
| TIX-02 | Order confirmation page and confirmation email with order summary. | P0 / P1 (email) |
| TIX-03 | Tickets can be downloaded as PDF. | P1 |
| TIX-04 | Order history with status: pending, paid, failed, cancelled, refunded. | P0 |
| TIX-05 | Web-based check-in: organiser scans or enters a ticket code to mark it used, and a used ticket cannot be reused. | P2 |

### 6.7 Organiser Portal

| ID | Requirement | Pri. |
|---|---|---|
| ORG-01 | Organiser dashboard with their events, status and headline sales numbers. | P0 |
| ORG-02 | Create and edit events: title, description, category, poster image, date and time, venue, and age or entry rules. | P0 |
| ORG-03 | Define ticket tiers: name, price, quantity or linked seat section, per-order limit, and sale window. | P0 |
| ORG-04 | Seating setup: the organiser picks an **admin-created venue** (template-based layout) and assigns its sections to ticket tiers and prices. Organisers cannot create venues or draw layouts. Optionally block individual seats so they are never sold. | P0 |
| ORG-05 | Configure queue settings per event (see QUE-10). | P0 |
| ORG-06 | Event lifecycle: draft → published → on sale → ended, plus cancel. Edits to price or seats after sales begin are restricted. | P0 |
| ORG-07 | Sales view: tickets sold, revenue, per-tier breakdown, and an attendee list for their own events only. | P0 |
| ORG-08 | Export attendee list to CSV. | P1 |
| ORG-09 | Organisers can only access their own events and data. | P0 |

### 6.8 Admin Dashboard

| ID | Requirement | Pri. |
|---|---|---|
| ADM-01 | Create organiser accounts (name, email, company), with a generated temporary password or invite link. | P0 |
| ADM-02 | User management: list, search, filter by role, view details, suspend or reactivate, and change role. | P0 |
| ADM-03 | View and cancel any event. Admins cannot create or edit events in MVP. | P0 |
| ADM-04 | View all orders and tickets, with search by order ID, email or event. | P0 |
| ADM-05 | Platform overview: total users, events, tickets sold, gross sales, active queues. | P0 |
| ADM-06 | Audit log of sensitive admin actions (account creation, suspension, role change, refunds). **Deferred to a future release.** | Deferred |
| ADM-07 | Platform settings: service fee, tax rate, default hold and pass durations. | P1 |
| ADM-08 | Venue management: admins create, edit, archive and preview venues from layout templates (reserved rows, standing, mixed). Editing a venue overrides its previous details (no versioning in MVP) and affects only events published afterwards, because each event keeps its own copy of the layout. | P0 |

### 6.9 Notifications

| ID | Requirement | Pri. |
|---|---|---|
| NOT-01 | Transactional emails: verification, password reset, organiser invite, order confirmation. | P1 |
| NOT-02 | In-app notices for queue status changes and hold expiry. | P0 |
| NOT-03 | Reminder email before event date. | P2 |

## 7. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | Event pages load in under 2 seconds on a typical 4G connection.<br>Queue admits and updates correctly at a target of 5,000 concurrent queued users for MVP (to be validated by load test).<br>Seat hold API responds in under 500 ms at the 95th percentile. |
| Correctness | No double-selling of a seat or overselling of GA stock under any concurrency.<br>Queue order is deterministic and auditable. |
| Availability | Target 99.5% uptime during on-sale windows.<br>Graceful degradation: if real-time fails, fall back to polling. |
| Security | Passwords hashed with a modern algorithm (argon2 or bcrypt).<br>HTTPS everywhere, secure session or token handling, CSRF and XSS protection, input validation, rate limiting.<br>Role checks enforced on the server for every protected endpoint. |
| Privacy and compliance | Comply with Malaysia's Personal Data Protection Act 2010 (PDPA): consent, purpose limitation, data access and deletion requests, and a privacy policy.<br>Store only the minimum personal data required. No real card data is stored (mock only). |
| Usability | Mobile-first responsive design, WCAG 2.1 AA colour contrast and keyboard navigation as a goal.<br>All times shown in Malaysia Time (MYT, UTC+8); prices in MYR. |
| Maintainability | Clear module boundaries, automated tests for queue, seat hold and payment flows, and CI pipeline. |
| Observability | Structured logs, error tracking, and basic metrics for queue length, hold counts and payment outcomes. |
| Browser support | Latest two versions of Chrome, Safari, Edge and Firefox on desktop and mobile. |

## 8. Success Metrics

| Metric | Target (MVP) |
|---|---|
| Double-sold seats | 0 |
| Queue fairness: admission order matches join order | 100% in automated tests |
| Checkout completion rate (admitted users who complete a mock purchase) | ≥ 60% in testing |
| Seat-hold to payment success within hold window | ≥ 80% in testing |
| Organiser can create and publish an event without help | Under 15 minutes |
| Load test: queue plus seat-hold at peak | Passes with no data inconsistencies |

## 9. Assumptions, Constraints and Dependencies

### 9.1 Assumptions

- MVP is a demonstration and learning-grade platform: payments are simulated and no real money moves.
- All events take place in Malaysia and all prices are in MYR.
- Organisers are trusted and vetted offline before an admin creates their account.
- A single organiser account represents one organisation (no multi-member teams in MVP).

### 9.2 Constraints

- Tech stack: Next.js (frontend), Express.js (backend), PostgreSQL (database). Supporting tools are recommended in the TRD.
- Web only; no native apps.
- Real-time seat maps may be downgraded if complexity or timeline requires (see SEAT-07 and SEAT-08).

### 9.3 Dependencies

- Email provider for transactional mail.
- Image storage for posters.
- Hosting capable of long-lived connections (WebSocket or SSE) if real-time is delivered.

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Concurrency bugs cause double-booking | High | Enforce uniqueness and row locking in PostgreSQL; concurrency tests; server-side validation on every hold and purchase. |
| Real-time seating is too complex for timeline | Medium | Ship polling fallback first (SEAT-08), add WebSocket updates as an enhancement. |
| Queue state lost on restart or scale-out | High | Persist queue state (Redis plus database); design for a single source of truth. |
| Seat map UI is hard to build and slow with large venues | Medium | Use SVG or canvas with virtualisation; limit MVP to template-based layouts. |
| Bots and queue abuse | Medium | Rate limiting, CAPTCHA, one position per account, email verification. |
| Scope creep across six documents and many modules | Medium | Strict P0 / P1 / P2 prioritisation; build in the order set in the IPD. |

## 11. Open Questions

These are the assumptions I made while writing this document. Please confirm or correct them, and I will update the PRD and carry the answers into the other documents.

| # | Question | Assumed default |
|---|---|---|
| Q1 | Pre-queue fairness: should everyone who joins before on-sale be randomly ordered at the opening moment (lottery-style), or strictly by the time they joined? You asked for true FIFO. | Strict FIFO by server join time, with the queue room opening a set time before on-sale. |
| Q2 | Can guests buy tickets, or must users be logged in? | **Confirmed:** login required to view the seat map, queue and buy. |
| Q3 | Maximum tickets per order and per account per event? | 6 per order; organiser can change. |
| Q4 | Which languages: English only, or also Bahasa Malaysia? | English for MVP; BM is P2. |
| Q5 | Service fee and SST: should these be shown? | Configurable fee and tax, default 0% until set by admin. |
| Q6 | Should the admin also be able to create events on behalf of organisers? | **Confirmed: no.** Admins can only view and cancel events. |

## 12. Glossary

| Term | Meaning |
|---|---|
| FIFO | First-in, first-out. The first person to join the queue is the first to be admitted. |
| Virtual waiting room | A holding page where buyers wait in line before they are allowed to reach seat selection and checkout. |
| Seat hold | A temporary, time-limited reservation of seats while the buyer completes payment. |
| Purchase pass | A time-limited permission, granted when a user leaves the queue, to enter the purchase flow. |
| GA | General admission: tickets without assigned seats. |
| FPX | Malaysian online banking payment method operated by PayNet. |
| PDPA | Personal Data Protection Act 2010 (Malaysia). |

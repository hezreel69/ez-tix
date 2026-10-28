# EzTix Design Brief Documentation (DBD)

_The visual identity, UI system and voice for EzTix: dark, cinematic, sleek, and Malaysian._

| | |
|---|---|
| **Document code** | DBD |
| **Version** | 1.0 (Draft) |
| **Date** | 28 October 2026 |
| **Depends on** | PRD v1.0, TRD v1.0, AFD v1.0 |
| **Feeds into** | BSD (a few data fields, see section 18), IPD |

## Table of Contents

- 1. Purpose
- 2. Design Decisions Captured
- 3. Brand Direction
- 4. Design Principles and the "No AI Slop" Rules
- 5. Colour System
- 6. Typography
- 7. Layout, Spacing, Shape and Elevation
- 8. Iconography and Imagery
- 9. Motion
- 10. Component Specifications
- 11. Seat Map Design
- 12. Key Screen Design Notes
- 13. Voice and Tone (Malaysian English)
- 14. Accessibility
- 15. Responsive Behaviour
- 16. Implementation: Tokens, Theming and Fonts
- 17. Handoff and Design QA
- 18. Open Items

---

## 1. Purpose

This document tells you **how EzTix should look, feel and sound**, so that every screen in the AFD can be built consistently without redesigning each one. It is written for a solo developer: it favours a small, reusable system (tokens plus a short list of custom components) over a pile of mockups.

It covers the visual language, the components, the seat map, the key screens, the copywriting voice, accessibility and the exact values to put into code. Screen flows and routes stay in the AFD.

## 2. Design Decisions Captured

| # | Your decision | How it is applied |
|---|---|---|
| 1 | **Dark and cinematic, clean typography, modern and sleek, no AI slop** | Ink-black backgrounds, a single warm gold accent, poster-led imagery, restrained motion, and an explicit list of banned clichés (section 4) |
| 2 | **Propose a palette and typography that fits "Easy Tickets for Malaysians"** | Palette inspired by Jalur Gemilang (blue-black, yellow, red, white) and a ticket-stub motif. Type pairing in sections 5 and 6 |
| 3 | **Both themes** | Dark is the default and the brand showpiece. Light is a full, tested theme. Users choose System, Dark or Light. The seat map stage stays dark in both (section 11) |
| 4 | **English, friendly and casual, with Malaysian-English slang** | Voice guide with three "slang levels" and a microcopy library (section 13). Slang is kept away from money, security and legal text |
| 5 | **Tailwind CSS with shadcn/ui** | Tokens map to shadcn's variable names (section 16). Components are listed with what is stock and what is custom |
| 6 | **Realistic seat map, but not tacky** | Real venue cues (stage, aisles, row labels, standing zones) drawn in a flat, minimal style, without 3D, bevels or glossy chairs |

## 3. Brand Direction

### 3.1 Personality

EzTix is the friend who always knows how to get you into the show. It should feel:

- **Cinematic:** a dim room, a lit screen. The poster is the star and the interface steps back.
- **Sharp:** exact spacing, confident type, nothing wobbly or over-decorated.
- **Easy:** the promise is in the name. Every flow should feel one step lighter than the competition.
- **Local:** unmistakably Malaysian in voice and references, but not costume-y. No flag waving, no batik pattern wallpaper.

### 3.2 The Idea Behind the Look

| Element | Meaning |
|---|---|
| **Ink** (deep blue-black) | The cinema or concert hall just before the lights drop. Also nods to the dark blue of Jalur Gemilang |
| **Marquee gold** | The glow of a ticket booth and marquee lights, and the yellow of the Malaysian flag. One accent, used with discipline |
| **Hibiscus red** | Bunga raya, the national flower. Used for "Live" and for errors, nowhere else |
| **Paper** | Warm off-white for text and the light theme, like a printed ticket |
| **The notch** | The semicircle cut out of a ticket stub. This is the signature shape (3.4) |

### 3.3 Wordmark and Logo

- **Wordmark:** "EzTix" set in the display typeface (Barlow Condensed, semi-bold). "Ez" in Paper, "Tix" in Marquee gold on dark. On light: "Ez" in Ink, "Tix" in the darker gold ink (`#8A5A00`).
- **Mark:** a ticket stub silhouette with two side notches, with a bold "E" cut into it. Used for the favicon, app icon and loading screen.
- **Clear space:** at least the height of the "E" on every side. **Minimum size:** 88 px wide for the wordmark, 20 px for the mark.
- **Do not:** add gradients, outlines, drop shadows, or rotate it.
- A simple SVG version should be hand-built once and stored in `apps/web/public/brand/` (wordmark and mark, dark and light variants).

### 3.4 The Ticket Notch (Signature Motif)

A small semicircular notch on the left and right edges of ticket-like surfaces, with a faint dashed perforation line between them. It appears on:

- the **event card** (between poster and details, optional on desktop),
- the **ticket** (B07) and the **order summary** (B03),
- the **seat selection panel** (separating seats from the total).

Rules: the notch is drawn with a CSS mask, not an image. One notch motif per surface. Do not put it on tables, forms, dashboards or admin screens. It must never reduce readability or touch targets.

### 3.5 Tagline Options

Pick one for the home page hero and the footer.

| Option | Feel |
|---|---|
| **Find the show. Grab the ticket. Settle.** | Casual and Malaysian ("settle" means "done"). My recommendation |
| **Easy tickets for every Malaysian show.** | Plain, clear, safe |
| **Tiket mudah. Show confirm.** | Cheeky, mixes Malay and English. Fun, but harder for non-Malay-speaking visitors such as recruiters |

## 4. Design Principles and the "No AI Slop" Rules

### 4.1 Principles

1. **The poster is the hero.** Event artwork and event names carry the colour. The interface stays quiet.
2. **One accent, used on purpose.** Gold means "do this next" (primary action) or "this is yours" (selected). If everything glows, nothing does.
3. **Calm under pressure.** Queue and checkout are stressful. Reduce motion, noise and choice. Show one clear next step.
4. **Show the truth.** Never fake urgency, fake scarcity or fake numbers. Counts and timers come from the server.
5. **Fast by design.** Dark interfaces with big images can get heavy. Budget images, fonts and animation.

### 4.2 What "No AI Slop" Means Here

These are the habits that make an interface look machine-generated. They are banned.

| Banned | Do this instead |
|---|---|
| Purple-to-blue gradients, neon glow blobs, mesh backgrounds | Flat Ink surfaces. Colour only from posters and the single gold accent |
| Gradient text on headlines | Solid Paper-white headlines. Gold only for small emphasis |
| Glassmorphism on everything (frosted cards, floating panels) | Opaque layered surfaces with hairline borders. Blur allowed only on the sticky header and the poster glow |
| Default Inter or system-ui look, with Space Grotesk as the "designer" swap | Barlow Condensed plus Hanken Grotesk (section 6) |
| Italic serif accent word in every hero headline | Plain, confident headlines |
| Emoji as icons, bullets or decoration | Lucide icons at a consistent stroke |
| Identical rounded cards with big shadows in a three-column grid for everything | Varied, purposeful layouts. Lists where lists are better. Dense tables for organiser and admin |
| Floating abstract 3D shapes, stock people on laptops | Posters, typography and the venue itself |
| Vague hype copy such as "Elevate your experience", "Seamless", "Unlock the power of" | Specific, human copy (section 13) |
| Placeholder text and fake round numbers such as "10,000+ happy users" | Seed data that looks real but is clearly fictional, and no invented statistics |
| Sparkle icons and "AI-powered" badges | None. The product does not need them |
| Pill-shaped everything and 24 px radius on every element | A small radius scale (section 7) with sharper corners than the typical template |
| Centered text blocks with three emoji feature cards | Left-aligned, scannable, content-first layouts |

## 5. Colour System

All values below were checked against WCAG 2.1 contrast ratios.

### 5.1 Dark Theme (Default)

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `background` | `#0A0C12` | Page background (Ink) | n/a |
| `surface-1` (card) | `#11141C` | Cards, panels | n/a |
| `surface-2` (raised) | `#181C27` | Popovers, dialogs, dropdowns | n/a |
| `surface-3` (hover and input) | `#1F2433` | Inputs, row hover, pressed | n/a |
| `border` | `#262B3A` | Decorative hairlines, dividers | Decorative only |
| `input-border` | `#6B7285` | Form fields, checkboxes, toggles | 3.8:1 on cards |
| `text` | `#F3EFE6` | Primary text (Paper) | 17.0:1 on background |
| `text-secondary` | `#A9AFC0` | Secondary text | 8.9:1 |
| `text-muted` | `#8A91A5` | Captions, placeholders, helper text | 6.2:1 |
| `primary` (Marquee) | `#F6C445` | Primary buttons, selected state, key links | 12.0:1 as text |
| `primary-hover` | `#FFD36B` | Hover on primary | n/a |
| `primary-pressed` | `#DFA92B` | Pressed on primary | n/a |
| `on-primary` | `#1A1306` | Text on gold buttons | 11.3:1 on gold |
| `focus` (Cobalt) | `#6EA0FF` | Focus ring, info, links | 7.6:1 |
| `success` | `#3DD6A0` | Paid, verified, success | 10.5:1 |
| `warning` | `#FF9A4D` | Hold ending, pending | 9.3:1 |
| `danger` (Hibiscus) | `#FF6B6B` | Errors, destructive text, "Live" dot | 7.0:1 |
| `danger-solid` | `#C93A3A` | Destructive filled buttons (white text) | 5.1:1 for white text |

### 5.2 Light Theme

A warm paper look, not stark white.

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `background` | `#F7F4EC` | Page background (Paper) | n/a |
| `surface-1` | `#FFFFFF` | Cards, panels | n/a |
| `surface-2` | `#FBF9F3` | Raised, popovers | n/a |
| `surface-3` | `#EFEBDF` | Hover, pressed | n/a |
| `border` | `#E3DDCF` | Hairlines | Decorative only |
| `input-border` | `#8A8470` | Form fields | 3.7:1 on white |
| `text` | `#14161F` | Primary text | 16.4:1 |
| `text-secondary` | `#4A4F60` | Secondary text | 7.4:1 |
| `text-muted` | `#636979` | Captions, helper text | 5.0:1 |
| `primary` (button fill) | `#F2B72D` | Primary buttons (dark text on top) | 10.2:1 for text on gold |
| `primary-ink` | `#8A5A00` | Gold used **as text or link** on light | 5.4:1 |
| `on-primary` | `#1A1306` | Text on gold buttons | 10.2:1 |
| `focus` | `#2B5FD9` | Focus ring, info, links | 5.1:1 |
| `success` | `#0B7A57` | Success text | 4.9:1 |
| `warning` | `#B54708` | Warning text | 4.9:1 |
| `danger` | `#C42B2B` | Error text | 5.1:1 |

Gold buttons on the light theme get a 1 px darker edge (`#C98F0A`), because gold on paper has low contrast against the background itself. The label inside meets contrast, so the button stays identifiable.

### 5.3 Colour Usage Rules

- **Gold appears once per view as the main action.** A second gold button on the same screen is a design bug. Secondary actions use outline or ghost buttons.
- **Red is only for errors, destructive actions and "Live".** It is not decoration.
- **Status is never colour-only.** Every status badge has text, and key ones have an icon.
- **Do not use pure black or pure white.** Ink and Paper only.
- **Large coloured areas come from posters,** never from the UI.

### 5.4 Status Badge Colours

| Status | Colour | Label examples |
|---|---|---|
| On sale, Live | Danger dot plus text | "On sale now", "Live" |
| Coming soon, Waiting room open | Cobalt | "Coming soon", "Waiting room open" |
| Paid, Valid, Active | Success | "Paid", "Valid" |
| Pending, Hold ending | Warning | "Pending", "Hold ending" |
| Sold out, Ended, Used, Expired | Neutral (muted text on `surface-3`) | "Sold out", "Ended" |
| Cancelled, Failed, Suspended | Danger | "Cancelled", "Failed" |
| Refunded | Neutral with icon | "Refunded" |
| Draft, Invited | Neutral outline | "Draft", "Invited" |

### 5.5 Poster Ambient Glow

Event pages take their mood from the poster, which is the cinematic touch.

- Extract an **accent colour** from the poster when it is uploaded (Cloudinary can return dominant colours). Store it on the event (see section 18).
- Behind the event hero, draw a large blurred radial of that colour at **18 to 25 percent opacity** over Ink, fading to the background. It sits behind content and never reduces text contrast.
- If the extracted colour is too light or too dull, clamp its lightness so text still passes contrast. If no colour exists, skip the glow.
- In the light theme the glow is reduced to about 8 to 10 percent.

## 6. Typography

### 6.1 Typefaces

All three are open-licence Google Fonts, loaded through `next/font` (self-hosted, no layout shift).

| Role | Typeface | Why |
|---|---|---|
| **Display** (hero, event titles, big numbers) | **Barlow Condensed** (600 and 700) | Tall and condensed, like a film poster or ticket stub, but clean. Keeps long event titles compact |
| **Interface and body** | **Hanken Grotesk** (400, 500, 600, 700) | Clean and modern with friendly proportions. Reads well on dark backgrounds and at small sizes |
| **Numbers in motion and codes** | **JetBrains Mono** (500) | Fixed-width digits so countdowns, queue positions and ticket codes do not jitter |

**Fallback stacks**

- Display: `"Barlow Condensed", "Arial Narrow", sans-serif`
- Body: `"Hanken Grotesk", system-ui, sans-serif`
- Mono: `"JetBrains Mono", ui-monospace, monospace`
- Event titles can contain Chinese, Tamil or Jawi characters. The display font does not include them, so the browser falls back. Add `"Noto Sans SC"`, `"Noto Sans Tamil"` and `"Noto Naskh Arabic"` fallbacks **only if you need them** and test a few long mixed-script titles.

### 6.2 Type Scale

| Style | Size / line height | Weight | Font | Use |
|---|---|---|---|---|
| Display XL | 64 / 64 (mobile 40 / 42) | 700 | Barlow Condensed | Home hero only |
| Display L | 48 / 50 (mobile 34 / 38) | 700 | Barlow Condensed | Event title on detail page |
| Heading 1 | 32 / 38 | 600 | Barlow Condensed | Page titles |
| Heading 2 | 24 / 30 | 600 | Hanken Grotesk | Section titles |
| Heading 3 | 18 / 26 | 600 | Hanken Grotesk | Card titles, panel headings |
| Body L | 18 / 28 | 400 | Hanken Grotesk | Event description lead |
| Body | 16 / 24 | 400 | Hanken Grotesk | Default text |
| Small | 14 / 20 | 400 and 500 | Hanken Grotesk | Secondary text, tables, form help |
| Caption | 12 / 16 | 500 | Hanken Grotesk | Labels, timestamps |
| Overline | 12 / 16, uppercase, letter-spacing 0.08em | 600 | Hanken Grotesk | Category labels ("LIVE MUSIC") |
| Numeric L | 48 / 48 | 500 | JetBrains Mono | Queue position, hold timer |
| Numeric | 14 / 20 | 500 | JetBrains Mono | Ticket codes, order numbers |

### 6.3 Typography Rules

- **Sentence case** for event titles in cards and lists, so long Malay or English titles stay readable. Uppercase is allowed for the Display XL hero line (three words or fewer) and overlines.
- Body text lines are 60 to 75 characters on desktop.
- **Prices** use tabular figures and the "RM" prefix: `RM 288.00`. Format with `Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' })`. (This replaces the `ms-MY` locale I mentioned in the TRD, since the interface is in English.)
- **Dates** read like `Sat, 12 Dec 2026, 8:00 PM`. Times are MYT.
- Never set body copy below 14 px. Never use light weights (under 400) on dark backgrounds.

## 7. Layout, Spacing, Shape and Elevation

### 7.1 Grid and Containers

| Breakpoint | Width | Columns | Margins and gutters |
|---|---|---|---|
| Base (mobile) | 360 and up | 4 | 16 and 12 |
| `sm` | 640 | 4 | 24 and 16 |
| `md` | 768 | 8 | 32 and 20 |
| `lg` | 1024 | 12 | 40 and 24 |
| `xl` | 1280 | 12 | 48 and 24 |

Public pages have a max content width of **1200 px**. Organiser and admin shells are fluid with a 240 px sidebar and a max of 1440 px for content.

### 7.2 Spacing

4 px base: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`. Page sections are separated by 64 to 96 px on desktop and 40 to 56 px on mobile.

### 7.3 Shape

| Token | Radius | Used for |
|---|---|---|
| `radius-sm` | 6 px | Badges, small chips, seats |
| `radius-md` | 10 px | Buttons, inputs, menus |
| `radius-lg` | 14 px | Cards, panels, dialogs |
| `radius-full` | 999 px | Avatars and the "Live" dot only |

Buttons are **not** pills. The slightly squarer shape feels more precise.

### 7.4 Elevation

Dark interfaces do not read shadows well, so depth comes from **surface steps and hairlines**:

- Level 0 `background`, level 1 `surface-1` (cards), level 2 `surface-2` (menus, dialogs, with a `border`), level 3 `surface-3` (hover and input).
- Dialogs add a dim scrim (`rgba(5, 6, 10, 0.72)`) and a soft shadow (`0 24px 64px rgba(0, 0, 0, 0.5)`).
- In the light theme, cards use a very soft shadow (`0 1px 2px rgba(20, 22, 31, 0.06)`) plus the hairline border.

### 7.5 Density

| Area | Density |
|---|---|
| Public and buyer screens | Comfortable: 48 px inputs and buttons, generous space |
| Organiser | Medium: 44 px controls, table rows 52 px |
| Admin | Compact: 40 px controls, table rows 44 px, 14 px text |

## 8. Iconography and Imagery

### 8.1 Icons

- **Lucide** (comes with shadcn/ui), stroke 1.75 px, 20 px by default, 16 px in dense tables, 24 px in navigation.
- Icons support text and never replace it, except for universal ones (close, search, menu).
- No emoji in the UI. No mixing of icon libraries.

### 8.2 Event Posters

- **Aspect ratio:** upload as **4:5 portrait**. Minimum 1200 × 1500 px. The system produces a 16:9 hero crop automatically, centred, with the option to adjust the focal point (P2).
- **On cards:** the poster fills the card top at 4:5 with the notch below it. A 40 percent bottom scrim (`transparent` to `#0A0C12`) can carry badges.
- **On the detail page:** poster at left (desktop) or top (mobile), with the ambient glow behind.
- Use Next.js `Image` with Cloudinary transforms, responsive `sizes`, `blur` placeholders and `priority` only on the first visible poster.
- **Text on posters is never relied upon.** Title and date are always set as live text beside or under the image.

### 8.3 Placeholder and Seed Artwork

Because this is a portfolio project:

- Use **fictional events, artists and venues** (for example "Malam Muzik Merdeka", "Dewan Seri Pelangi"). Do not use real artists' names, logos or photos.
- Seed posters should be **typographic designs generated in code** (SVG or canvas) in a few cinematic colour schemes. No stock photography needed.

### 8.4 Empty States and Illustration

No illustration library. Empty states use a **line drawing of a ticket stub** (one SVG, reused, with the notch motif), a clear headline, one sentence of helper text and one button.

### 8.5 Payment Brands

The mock gateway must **not** use real bank or e-wallet logos (they are trademarks). Use text labels for method names, neutral icons, and generic mock pages such as "Mock Bank". Every gateway page carries the notice **"Demo payment only. No real money moves."**

## 9. Motion

Motion should feel like a good title sequence: slow, smooth and rare.

| Pattern | Spec |
|---|---|
| Base transition | 160 ms, `cubic-bezier(0.2, 0, 0, 1)` (ease-out). Colour, border and opacity changes |
| Enter (dialogs, menus, toasts) | 200 to 240 ms, fade plus 8 px rise. Exit 140 ms |
| Page and list entrance | Content fades in with a 40 ms stagger for up to 8 items. Never block interaction |
| Poster and hero | Poster fades in over the glow in 400 ms. No parallax, no Ken Burns |
| Queue number | Digits roll or cross-fade over 250 ms when the position changes. Update at most every 2 seconds |
| Hold and pass timers | A thin ring or bar that drains. Colour moves from Paper to warning at 1 minute left, then danger in the last 15 seconds. No flashing |
| Seat state change | Colour and scale (1.0 to 1.08 to 1.0) over 180 ms |
| Payment success | **One** signature moment: the ticket slides in and the notches "settle" (300 ms). Subtle gold edge highlight that fades |
| Skeletons | Slow shimmer (1.6 s), low contrast |

**Rules**

- **Respect `prefers-reduced-motion`:** replace movement with simple fades and stop all looping animation.
- **Maximum one looping animation per screen** (the "Live" dot pulse or the timer, never both at full strength).
- No bouncing, shaking or spring overshoot. Do not animate layout on the seat map while the user is selecting.
- Nothing flashes more than three times per second.

## 10. Component Specifications

### 10.1 Component Inventory

| Component | Source | Notes |
|---|---|---|
| Button (primary, secondary, outline, ghost, destructive, link) | shadcn | Primary is gold. Destructive uses `danger-solid` |
| Input, textarea, select, combobox, checkbox, radio, switch | shadcn | 48 px tall on public screens. Visible `input-border` |
| Date and time picker | shadcn calendar plus time input | MYT only. Placeholder "DD MMM YYYY" |
| Dialog, sheet (bottom sheet on mobile), popover, dropdown, tooltip | shadcn | Dialogs for destructive confirmations |
| Toast | shadcn (Sonner) | Bottom centre on mobile, bottom right on desktop |
| Tabs, breadcrumb, pagination | shadcn | |
| Table | shadcn plus TanStack Table | Sticky header, sortable columns, card list on mobile |
| Badge | shadcn, restyled | Status colours from 5.4 |
| Skeleton, progress, alert | shadcn | Alerts for banners such as "Verify your email" |
| Stepper (event wizard) | Custom | Left rail on desktop, top bar on mobile |
| Chart | shadcn charts (Recharts) | Gold primary series, cobalt secondary, hairline grid, no gradient fills |
| **Event card** | Custom | 10.2 |
| **Ticket card** | Custom | 10.3 |
| **Queue status panel** | Custom | 10.4 |
| **Countdown and timer** | Custom | 10.5 |
| **Seat map and selection panel** | Custom | Section 11 |
| **Tier chip and legend** | Custom | Dot or swatch plus tier name and price |
| **Status badge** | Custom wrapper | Text plus optional icon, mapped from status enum |
| **Empty state** | Custom | Section 8.4 |
| **Stat card** (dashboards) | Custom | Label, number (mono), delta, no decoration |
| **Poster upload** | Custom | Drag and drop, crop check at 4:5, progress |

### 10.2 Event Card

```text
┌────────────────────────┐
│                        │
│        poster 4:5      │
│   [Live]       [Tier]  │  ← badges on a bottom scrim
│                        │
├ ◖ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ ◗ ┤  ← notch and perforation
│ LIVE MUSIC             │  ← overline
│ Malam Muzik Merdeka    │  ← Heading 3, 2 lines max
│ Sat, 12 Dec · 8:00 PM  │
│ Dewan Seri Pelangi, KL │
│ From RM 88             │  ← price from, mono numerals
└────────────────────────┘
```

- States: default, hover (poster scales to 1.03 over 300 ms, border brightens), focus (focus ring), sold out (poster desaturated to 60 percent, badge "Sold out"), ended (same, plus "Ended").
- The whole card is one link with a single accessible name (title, date, venue, status).
- Grid: 2 columns on mobile, 3 at `md`, 4 at `xl`.

### 10.3 Ticket Card (B07)

- Portrait card with the poster strip at the top, event details in the middle, the notch and perforation line, then a **large QR code on a white tile** (QR must be dark on light for reliable scanning, even in dark mode).
- Shows ticket code in mono, seat or tier, order reference, and a status badge (Valid, Used, Cancelled).
- Used or Cancelled tickets overlay a diagonal "Used" or "Cancelled" stamp at 12 percent opacity and dim the QR. Never hide the status in colour alone.
- Brightness hint: "Turn your screen brightness up when scanning" in helper text.

### 10.4 Queue Status Panel (B01)

- Centre-aligned single column, max width 520 px.
- Order: event name (Heading 2), **position** in Numeric L ("#1,234"), "people ahead" line, **estimated wait** range, a slim progress bar, connection indicator, the reassurance line ("Don't refresh, your spot is safe"), then a ghost "Leave queue" button at the bottom.
- Before the sale starts, the countdown to on-sale takes the place of the estimate.
- The panel changes state with a simple cross-fade: Waiting, Reconnecting, Paused, Closed, Admitted.
- Admitted state: the page background glow brightens once, the panel shows "Your turn!" and a 3 second auto-redirect with a visible "Go now" button.

### 10.5 Countdown and Timer

- **Format:** `mm:ss` in mono for under an hour, `Dd Hh Mm` for long countdowns, `hh:mm:ss` for sale countdowns inside the last day.
- Driven by server timestamps (AFD 5.3).
- A hold timer sits in a sticky bar on the seat map and checkout with an icon, the time and a thin drain bar.
- Announce to screen readers only at 5 min, 1 min and 10 s, not every second (section 14).

### 10.6 Forms

- Labels are always visible above fields (no placeholder-only labels).
- Errors appear under the field in danger colour with an icon, and the field gets a danger border. A summary at the top appears for long forms.
- Required fields are the default. Optional fields say "(optional)".
- Password fields have a show or hide toggle and a plain-language strength hint.
- The event wizard shows a **live preview of the event card** next to the form, which helps organisers see what buyers will see.

## 11. Seat Map Design

The seat map is the centrepiece. It is **realistic enough to orient people, minimal enough to stay elegant.**

### 11.1 Visual Language

| Element | Treatment |
|---|---|
| **Canvas** | Always Ink `#0A0C12`, in both themes (like a video player on a light page). This keeps seat colours consistent and verified |
| **Stage** | A flat dark-grey shape with a thin gold edge line (1.5 px at 60 percent opacity) and a small "STAGE" overline label. A faint light "wash" fades towards the audience. No spotlights, no 3D |
| **Seats** | Rounded squares (radius 3 px), 16 px at default zoom, with 4 px gaps. A subtle 1 px inner highlight on the top edge suggests a chair back without looking like a clip-art icon |
| **Rows** | Row letters at both ends in Caption size, text-muted colour. Optional gentle curvature per section (a P1 setting on the venue template) that arcs rows by a few degrees. Never exaggerated |
| **Aisles** | Real gaps in the grid, with an optional faint "aisle" label |
| **Sections** | Section labels in overline style, a faint section outline appears on hover. Walls and exits are hairline lines with small labels |
| **Standing (GA) zones** | A soft rounded area with a fine dot texture, the tier colour at 18 percent, and a live "capacity left" counter. Selecting uses a quantity stepper rather than seats |
| **Mixed venues** | Reserved sections and GA zones in the same canvas using the same visual rules |

Avoid: wood or velvet textures, glossy chair icons, drop shadows under seats, perspective or isometric views, curtains, spotlights, confetti.

### 11.2 Seat States

Every state differs by **more than colour**.

| State | Fill | Extra cue |
|---|---|---|
| Available | Tier colour, 100 percent | None. Hover raises it slightly and shows a tooltip |
| Selected (by you) | **White fill with a gold ring** (2 px, 2 px gap) | Checkmark glyph once zoomed in. The only state with a ring |
| Held by someone else | Tier colour at 35 percent | Fine diagonal hatch pattern |
| Sold | `#2A2F3E` (neutral dark) | Small "×" mark when zoomed in |
| Blocked or unavailable | No fill | Dashed outline |

### 11.3 Tier Colours

Organisers pick tier colours **from a fixed palette of five** (the free-form colour picker is removed to protect contrast and colour-blind safety). All five have at least 6.4:1 contrast against the canvas.

| Slot | Name | Hex |
|---|---|---|
| 1 | Sky | `#5BB8F5` |
| 2 | Emerald | `#2FBF8F` |
| 3 | Violet | `#A78BFA` |
| 4 | Rose | `#E4709A` |
| 5 | Orange | `#F2994A` |

- The gold of the brand is **never** a tier colour, so "selected" stays unambiguous.
- **Maximum five tiers per event** in MVP. This is a new constraint carried into the BSD.
- Because some colour pairs (such as Rose and Violet) can look similar to people with colour-vision deficiency, tiers are also identified by **section labels, the legend, tooltips and the selection panel**. Tiers usually map to whole sections, so confusion is rare.

### 11.4 Interaction Design

- **Desktop:** scroll or pinch to zoom, drag to pan, click seats, shift-drag to select a range in a row (P2). A zoom control (plus, minus, reset) sits at the bottom right. A **minimap** appears for large venues (P1).
- **Mobile:** pinch to zoom, drag to pan, double-tap a section to zoom into it, tap seats. **Seats expand their hit area** to at least 44 × 44 px (the visible seat stays small, the invisible touch area grows). At low zoom, tapping a section zooms in instead of selecting.
- **Hover or tap tooltip:** "Row F, Seat 12 · Sky · RM 288 · Available".
- **Selection panel:** on desktop, a right column (width 360 px). On mobile, a **bottom sheet** that shows a collapsed summary ("3 seats · RM 864") and expands to the list and the Continue button.
- **Tier legend:** a horizontal strip above the map (wraps on mobile) with swatch, tier name, price and a count of seats left in that tier. Tapping a tier highlights its seats and dims the rest.
- **Sticky top bar:** event name, pass timer (queued events) and hold timer. The Continue button is in the panel and repeated in the bottom sheet.
- **Conflicts:** when a seat is taken, it plays the state change animation and a toast appears ("Alamak, someone just took that seat"). The user's selection is never cleared by someone else's action.
- **Connection indicator:** a small chip at the map corner: "Live" (socket), "Reconnecting…", or "Updating every few seconds" (fallback).
- **List view fallback (P1):** a toggle that switches the map to a sectioned list of available seats, for screen-reader users, very small screens and anyone who finds the map hard.

### 11.5 Performance Rules for the Map

- Render geometry (static) and status (dynamic) separately, so a status change re-renders only the affected seats.
- Hide row labels and seat numbers until the zoom level makes them legible.
- Use a single SVG group per section and `React.memo` per seat. Move to canvas only if a venue exceeds the practical SVG limit (section 9.6 of the TRD).

## 12. Key Screen Design Notes

Wireframes are low-fidelity, to show hierarchy only.

### 12.1 Home (P01)

- **Hero:** left-aligned. Display XL headline (the chosen tagline, three lines max), one sentence of support, a search field (not a button), and below it category chips (Concerts, Festivals, Theatre, Comedy, Sports, Workshops). The right side shows the poster of the next big on-sale event with the ambient glow, **not** a decorative graphic.
- **Rows:** "On sale now", "Coming soon", "This weekend", "Near you" (by state). Horizontal scroll on mobile, grid on desktop.
- **No** testimonial strips, partner logo walls or statistics.
- **Footer:** policy links, contact for support, and the demo-project notice: "EzTix is a portfolio project. Payments are simulated."

### 12.2 Event Detail (P03)

```text
┌────────────────────────────────────────────────────────────────┐
│ EzTix   Events   [ search ]                 Log in   Sign up   │
├────────────────────────────────────────────────────────────────┤
│  ░░░░░░░░░░ ambient poster glow ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ┌─────────┐   LIVE MUSIC · KUALA LUMPUR                        │
│  │         │   Malam Muzik Merdeka                (Display L)   │
│  │ poster  │   Sat, 12 Dec 2026 · 8:00 PM · Doors 6:30 PM       │
│  │  4:5    │   Dewan Seri Pelangi, Kuala Lumpur                 │
│  │         │                                                    │
│  └─────────┘   ● On sale now    Waiting room is open            │
│                [  Get tickets  ]   (gold, one per screen)       │
├──────────────────────────────────────┬─────────────────────────┤
│  About this event                    │  Tickets                │
│  Description (Body L lead)           │  ● Sky      RM 288      │
│  Rules: age, entry, refunds          │  ● Emerald  RM 188      │
│  Venue and getting there             │  ● Violet   RM 128      │
│  Organiser                           │  ● Standing RM 88       │
│                                      │  Max 6 tickets per order│
└──────────────────────────────────────┴─────────────────────────┘
```

- Mobile: poster, then title block, then a **sticky bottom bar** with price-from and the main button.
- The main button follows the table in AFD F-04 (login, join waiting room, get tickets, sold out, and so on).
- For guests, the tier list shows prices but the text beside the button says "Log in to see seats".

### 12.3 Waiting Room (B01), Mobile

```text
┌───────────────────────────┐
│ ‹ Malam Muzik Merdeka     │
├───────────────────────────┤
│                           │
│   You're in the queue     │
│                           │
│        #1,234             │  ← Numeric L, mono
│   1,233 people ahead      │
│                           │
│   About 6–9 min to go     │
│   ▓▓▓▓▓░░░░░░░░░░░░░░░    │
│                           │
│   ● Connected             │
│   Don't refresh ah,       │
│   your spot is safe.      │
│                           │
│   [ Leave queue ]         │  ← ghost button
└───────────────────────────┘
```

- Poster glow fills the background, very low contrast.
- Nothing else competes for attention. No ads, no recommendations.

### 12.4 Seat Map (B02), Desktop

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Malam Muzik Merdeka            Pass 07:42     Hold 06:10 ▓▓▓▓░░       │
├──────────────────────────────────────────────┬───────────────────────┤
│ ● Sky RM 288 (42)  ● Emerald RM 188 (120) …  │  Your seats           │
│ ┌──────────────────────────────────────────┐ │  Row F · Seat 12  288 │
│ │              ▔▔▔▔ STAGE ▔▔▔▔             │ │  Row F · Seat 13  288 │
│ │   A  ▪▪▪▪▪▪   ▪▪▪▪▪▪▪▪   ▪▪▪▪▪▪  A       │ │ ◖┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄◗   │
│ │   B  ▪▪▪▪▪▪   ▪▪▪▪▪▪▪▪   ▪▪▪▪▪▪  B       │ │  Total       RM 576   │
│ │   C  ▪▪▪▪▪▪   ▪▪▪▪▪▪▪▪   ▪▪▪▪▪▪  C       │ │  [ Continue ]         │
│ │                                          │ │  Cancel selection     │
│ │      ░░░░ Standing zone · 85 left ░░░░    │ │                       │
│ └──────────────────────────────────────────┘ │                       │
│  [+] [–] [reset]            ● Live            │                       │
└──────────────────────────────────────────────┴───────────────────────┘
```

### 12.5 Checkout (B03)

- Two columns on desktop: payment methods at left, **order summary as a ticket-style card with the notch** at right. Mobile: summary collapses into an accordion at the top, with the total always visible.
- Payment methods are large selectable rows (radio) with a text label and neutral icon.
- The hold timer is pinned under the header.
- The **Pay** button states the exact amount: "Pay RM 576.00". It becomes a loading state on click and cannot be double-submitted.
- Copy near the button is plain and exact (slang level 0, section 13).

### 12.6 Mock Gateway (B04)

- Deliberately looks **different** from EzTix (light, neutral, utilitarian) so it feels like leaving for another site. A thin banner at the top: "Demo payment only. No real money moves."
- The test panel (testing mode only) is a fixed strip at the bottom with five outcome buttons and a dashed border labelled "Developer test panel".

### 12.7 Order Result and Tickets (B05 to B07)

- Success: one calm full-width confirmation with the single signature motion (section 9), order number in mono, and the buttons "View tickets" (gold) and "Back to events" (ghost).
- Failure: the reason in plain language, what happens to the seats and the hold time left, then "Try again".
- My tickets: a vertical list of compact ticket cards. Past tickets are dimmed.

### 12.8 Organiser Area (O01 to O07)

- Utilitarian and dense, same tokens, no ambient glow and no notch motif.
- **Dashboard:** four stat cards (mono numerals), a sales line chart (gold), a recent orders table.
- **Event wizard:** left stepper, form in the centre, live event card preview at right (hidden on small screens, available through a "Preview" button).
- **Section-to-tier assignment** shows the venue's seat map preview with sections that colour in as the organiser assigns tiers. This is the one place organiser screens get cinematic.
- **Sales and attendees:** tabs, chart, attendee table with search.

### 12.9 Admin Area (A01 to A12)

- The most utilitarian area: compact tables, filter bars, clear destructive actions.
- **Venue editor (A06):** a split view. Configuration on the left, **live seat map preview on the right**, using exactly the same renderer as the buyer map. A seat count and a performance hint ("2,400 seats") are shown prominently.
- Destructive actions (cancel event, suspend, delete, refund) use dialogs with red confirm buttons and require typing the target name where the AFD says so.

## 13. Voice and Tone (Malaysian English)

### 13.1 The Voice

Friendly, quick and a little cheeky, like a helpful friend at the counter. We speak Malaysian English: plain English with the occasional local word that Malaysians of every background use.

**We are:** warm, clear, relaxed, confident.
**We are not:** corporate, over-excited, mocking, or trying too hard.

### 13.2 The Slang Dial

Every string has a level:

| Level | Meaning | Where it is allowed |
|---|---|---|
| **L0: None** | Plain, exact English | Money, payments, refunds, security, legal and privacy text, suspension notices, errors where precision matters, all organiser and admin screens, emails about orders and cancellations |
| **L1: Light** | Friendly tone, at most one local word | Buttons helper text, confirmations, queue status, tooltips, onboarding |
| **L2: Playful** | Local flavour, one or two local words | Empty states, 404, the waiting room, success moments, the home page hero |

**Rules**

1. **Clarity beats charm.** If a message states a time limit, a price, a deadline or a consequence, state it plainly. Slang can sit around it, never inside it.
2. **One particle per message** ("lah", "ah", "lor", "meh"). Never stack them.
3. **Buttons and labels stay plain:** "Get tickets", "Join waiting room", "Pay RM 576.00". Slang lives in the helper text.
4. **Approved local words:** lah, ah, can, boleh, alamak, aiyo, steady, shiok, confirm (as in "definitely"), settle, habis (sold out), siap (done). Use "habis" sparingly and always next to an English label.
5. **Banned:** vulgar words, anything mocking an accent, spelling tricks ("dun", "wanna lah"), ethnic or religious jokes, and in-jokes that only one community would get.
6. **Not for translation.** Bahasa Malaysia is a P2 feature. Slang strings need a plain alternative when i18n is added.
7. Always write with the user as "you". Use contractions. Avoid exclamation marks except at success moments, and one at most.

### 13.3 Microcopy Library

| Moment | Copy | Level |
|---|---|---|
| Home hero | "Find the show. Grab the ticket. Settle." | L2 |
| Home search placeholder | "Search for a show, artist or venue" | L0 |
| Main buttons | "Get tickets", "Join waiting room", "Continue to checkout" | L0 |
| Guest on event page | "Log in to get tickets" | L0 |
| Register welcome | "Welcome aboard. One more step: check your inbox to verify your email." | L1 |
| Waiting room title | "You're in the queue" | L0 |
| Waiting room helper | "Don't refresh ah, your spot is safe." | L2 |
| Wait estimate | "About 6 to 9 minutes to go" | L0 |
| Estimate caveat | "This is an estimate. It can change as the queue moves." | L0 |
| Before sale starts | "You're in. Sale starts at 10:00 AM, and you'll be admitted in the order you joined." | L1 |
| Connection lost | "Connection lost. Reconnecting… We'll keep your spot for 2 minutes." | L0 |
| Admitted | "Your turn! You've got 10 minutes to pick your seats." | L1 |
| Hold warning | "1 minute left. Finish up or these seats go back to the pool." | L0 |
| Hold expired | "Time's up and your seats are released. You can pick again lah." | L1 |
| Pass expired | "Your time to buy has ended. Join the queue again if you still want in." | L0 |
| Seat taken | "Alamak, someone just took that seat. Pick another one?" | L2 |
| Over seat limit | "You can pick up to 6 seats per order." | L0 |
| Checkout button | "Pay RM 576.00" | L0 |
| Payment success | "Confirm! You're going. Your tickets are in My Tickets." | L2 |
| Payment failed | "Your payment didn't go through. You haven't been charged. Try again or use another method." | L0 |
| Payment cancelled | "Payment cancelled. Your seats are held for 4:20 more." | L0 |
| Demo notice | "Demo payment only. No real money moves." | L0 |
| Sold out label | "Sold out" | L0 |
| Sold out helper | "Habis. Check out other shows you might like." | L2 |
| Empty tickets | "No tickets yet. Go find a show lah." | L2 |
| Empty events search | "No shows match that. Try a different date or state." | L1 |
| 404 | "Alamak, we can't find that page." | L2 |
| 500 | "Something went wrong on our side. Try again in a moment. Reference: req_8f2a." | L0 |
| Server waking up | "Waking up the server. Give us a minute ah." | L2 |
| Offline | "You're offline. We'll reconnect when you're back." | L0 |
| Rate limit | "Slow down a little. Please try again in a few seconds." | L1 |
| Logout | "You're logged out. See you at the next show." | L1 |
| Suspended | "Your account has been suspended. Please contact support." | L0 |
| Event cancelled (page) | "This event has been cancelled. If you bought tickets, you'll be refunded." | L0 |
| Profile delete note | "To delete your account, contact support." | L0 |
| Organiser welcome | "Welcome aboard. Let's set up your first event." | L1 |
| Organiser publish success | "Your event is live. Share the link and get the word out." | L1 |
| Admin messages | Plain, neutral, always L0 | L0 |

### 13.4 Writing Details

- **Currency:** "RM 288.00". In running text, "RM288" is acceptable but pick one style and keep it.
- **Dates and times:** "Sat, 12 Dec, 8:00 PM". Always say "MYT" only where time zones could confuse (emails, admin).
- **Numbers:** thousands with commas. Queue numbers with a hash (#1,234).
- **Errors:** say what happened, what it means for the user and what to do next, in that order.
- **Emails:** subject lines are plain (L0). A warm friendly line at the top is fine (L1). Order and refund details always L0.

## 14. Accessibility

Target **WCAG 2.1 AA**.

| Area | Requirement |
|---|---|
| Contrast | Verified for all text and UI colours in section 5. Do not introduce new colours without checking |
| Focus | Visible 2 px focus ring in `focus` colour with a 2 px offset on every interactive element, in both themes. Never remove outlines |
| Keyboard | Everything works without a mouse. Logical tab order. Skip-to-content link. Dialogs trap focus and return it on close |
| Colour independence | Status and seat states always have a text, shape, pattern or icon cue (sections 5.4 and 11.2) |
| Touch targets | At least 44 × 44 px, including expanded hit areas on seats |
| Motion | `prefers-reduced-motion` respected (section 9). No flashing content |
| Forms | Visible labels, associated error text, `aria-invalid`, autocomplete attributes, clear required marks |
| Zoom and text size | Layout works at 200 percent zoom and with larger system fonts. Use `rem` units for type |
| **Live updates** | The waiting room uses an `aria-live="polite"` region that announces position changes at most every 30 seconds, and always announces important changes immediately (admitted, paused, closed) |
| **Timers** | Announce at 5 minutes, 1 minute and 10 seconds only. Provide the timer as text, not just a graphic |
| **Seat map** | Keyboard: arrow keys move between seats, Space or Enter toggles selection, Escape closes the tooltip. Each seat has an accessible name, for example "Row F, seat 12, Sky tier, RM 288, available". A list view alternative is provided (P1). Map region has a skip link |
| Images | Poster images have alt text that includes the event title. Decorative glows are `aria-hidden` |
| Language | `lang="en-MY"` on the document |
| Tables | Proper headers and captions. On mobile, card layouts keep the label and value pairing |

## 15. Responsive Behaviour

| Screen | Mobile (360 to 639) | Tablet (640 to 1023) | Desktop (1024 and up) |
|---|---|---|---|
| Navigation | Top bar with menu button, bottom bar for the buyer's key links (Events, My Tickets, Account) | Top bar with inline links | Top bar with search |
| Event list | 2-column cards | 3 columns | 4 columns |
| Event detail | Stacked, sticky bottom CTA | Two columns | Two columns plus sticky tickets panel |
| Waiting room | Full-screen single column | Same, centred | Same, centred |
| Seat map | Full-screen map, bottom sheet | Map with a collapsible side panel | Map plus 360 px side panel |
| Checkout | Single column, summary accordion | Two columns | Two columns |
| Organiser and admin tables | Card list with key fields | Table with horizontal scroll | Full table |
| Organiser and admin shell | Slide-over menu | Collapsible sidebar | Fixed sidebar 240 px |
| Event wizard | One step at a time, preview via button | Stepper top, form full width | Stepper left, form centre, preview right |

## 16. Implementation: Tokens, Theming and Fonts

### 16.1 Theming

- Use `next-themes` with `attribute="class"`, **`defaultTheme="dark"`**, `enableSystem` on, and a three-way toggle (System, Dark, Light). Choosing dark as the default (rather than "follow system") makes the brand first impression consistent.
- Define colours as CSS variables, with the dark values under `:root` and the light values under `.light`. (If your version of shadcn generates the opposite arrangement, follow its convention. The values in the table below are the source of truth.)
- The seat map canvas uses its own fixed variables that do not change with theme.

### 16.2 Token File (`apps/web/styles/tokens.css`)

```css
:root {
  /* Dark theme (default) */
  --background: #0A0C12;
  --foreground: #F3EFE6;
  --card: #11141C;
  --card-foreground: #F3EFE6;
  --popover: #181C27;
  --popover-foreground: #F3EFE6;
  --primary: #F6C445;
  --primary-hover: #FFD36B;
  --primary-pressed: #DFA92B;
  --primary-foreground: #1A1306;
  --primary-ink: #F6C445;          /* gold used as text */
  --secondary: #181C27;
  --secondary-foreground: #F3EFE6;
  --muted: #1F2433;
  --muted-foreground: #8A91A5;
  --text-secondary: #A9AFC0;
  --accent: #1F2433;
  --accent-foreground: #F3EFE6;
  --destructive: #FF6B6B;
  --destructive-solid: #C93A3A;
  --success: #3DD6A0;
  --warning: #FF9A4D;
  --info: #6EA0FF;
  --border: #262B3A;
  --input: #6B7285;
  --ring: #6EA0FF;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  --ease-out: cubic-bezier(0.2, 0, 0, 1);
  --dur-fast: 160ms;
  --dur-base: 220ms;

  /* Seat map (fixed in both themes) */
  --seat-canvas: #0A0C12;
  --seat-sold: #2A2F3E;
  --seat-selected-fill: #FFFFFF;
  --seat-selected-ring: #F6C445;
  --tier-1: #5BB8F5;
  --tier-2: #2FBF8F;
  --tier-3: #A78BFA;
  --tier-4: #E4709A;
  --tier-5: #F2994A;
}

.light {
  --background: #F7F4EC;
  --foreground: #14161F;
  --card: #FFFFFF;
  --card-foreground: #14161F;
  --popover: #FBF9F3;
  --popover-foreground: #14161F;
  --primary: #F2B72D;
  --primary-hover: #F7C54E;
  --primary-pressed: #D9A020;
  --primary-foreground: #1A1306;
  --primary-ink: #8A5A00;
  --secondary: #EFEBDF;
  --secondary-foreground: #14161F;
  --muted: #EFEBDF;
  --muted-foreground: #636979;
  --text-secondary: #4A4F60;
  --accent: #EFEBDF;
  --accent-foreground: #14161F;
  --destructive: #C42B2B;
  --destructive-solid: #C42B2B;
  --success: #0B7A57;
  --warning: #B54708;
  --info: #2B5FD9;
  --border: #E3DDCF;
  --input: #8A8470;
  --ring: #2B5FD9;
}
```

Map these to Tailwind through the theme configuration of your Tailwind and shadcn version so that classes like `bg-background`, `text-muted-foreground` and `border-border` work.

### 16.3 Fonts (`next/font`)

```ts
import { Barlow_Condensed, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';

export const display = Barlow_Condensed({
  subsets: ['latin'], weight: ['600', '700'], variable: '--font-display', display: 'swap',
});
export const sans = Hanken_Grotesk({
  subsets: ['latin'], variable: '--font-sans', display: 'swap',
});
export const mono = JetBrains_Mono({
  subsets: ['latin'], weight: ['500'], variable: '--font-mono', display: 'swap',
});
```

Check Hanken Grotesk's weights and tabular-figure support when you set it up. If tabular figures are missing, keep all changing numbers (prices in tables, countdowns, queue positions) in the mono face.

### 16.4 Component Rules for Code

- Build custom components on shadcn primitives and keep them in `apps/web/components/` (`ui/` for stock, `brand/` for event card, ticket and queue panel, `seat-map/` for the map).
- All colours come from tokens. **No hard-coded hex values in components** (the seat map reads the `--tier-*` variables).
- Status enums map to badge variants in one file, so the AFD and the UI stay in sync.

## 17. Handoff and Design QA

### 17.1 Handoff Approach for a Solo Developer

You do not need a full Figma library. A practical process:

1. **Tokens and a style guide page** first: build a `/design` route (development only) that shows colours, type, buttons, form fields, badges, event card, ticket card, queue panel, and a sample seat map in both themes. This becomes your visual test bench.
2. **Sketch the five screens that matter** before coding them: event detail, waiting room, seat map, checkout and ticket. The wireframes in section 12 are the starting point. Paper or Excalidraw is enough.
3. **Build the seat map and queue panel as isolated components** with fake data before wiring them to the API.

### 17.2 Design QA Checklist

Before calling any screen done:

- [ ] Works in dark and light themes
- [ ] No hard-coded colours, only tokens
- [ ] Exactly one gold primary action
- [ ] Passes contrast (spot-check with a browser tool)
- [ ] Keyboard-only walkthrough works, focus visible
- [ ] 360 px width has no horizontal scroll
- [ ] Loading, empty and error states exist (AFD section 12)
- [ ] Copy follows the voice level for that string
- [ ] Money, time and consequences are stated plainly
- [ ] Reduced-motion mode checked
- [ ] No banned clichés from section 4.2
- [ ] Images are optimised and have alt text
- [ ] Long titles, long names and mixed-script text do not break the layout

## 18. Open Items

**Things this document adds to the data model** (to be carried into the BSD):

1. `events.poster_accent_color`: dominant colour extracted from the poster for the ambient glow.
2. `events.poster_width` and `events.poster_height` (or validation at upload) to enforce the 4:5 ratio and minimum size.
3. **Maximum five ticket tiers per event**, with each tier's colour chosen from the five fixed slots (`tier_colour_slot` between 1 and 5).
4. Optional `venue_sections.curvature` for gentle row arcs (P1).
5. Optional hero focal point for the 16:9 crop (P2).

**Please confirm or correct:**

1. **Tagline:** which of the three options do you want? I recommend "Find the show. Grab the ticket. Settle."
2. **Default theme:** I assumed dark by default rather than following the system setting.
3. **Wordmark:** is a hand-built text wordmark plus ticket-stub mark acceptable, or do you want something more illustrated? (I would keep it simple.)
4. **Tier limit:** are five tiers per event enough?
5. **Curved rows:** worth building as a P1 setting, or keep all rows straight for MVP? (Straight rows can still look realistic with good staging and aisles.)
6. **Event categories** for the filters and home page chips. My starting list: Concerts, Festivals, Theatre, Comedy, Sports, Workshops, Conferences. Add or remove any.
7. **Light theme importance:** I treated it as fully supported but secondary. Say so if you want equal polish for both.

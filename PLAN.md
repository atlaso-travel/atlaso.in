# Atlaso — Marketplace Build Plan

**Status:** Step 0 (audit + plan). No implementation code written yet.
**Date:** 2026-08-01

---

## 1. Audit of the existing repo

### What's actually here

| Area | State |
|---|---|
| Framework | Next.js 16.2.9 (App Router), React 19.2.4, TS 5, Tailwind 4 (CSS-first `@theme`) |
| Deps | `framer-motion`, `lucide-react`, `@radix-ui/react-slider`, `@vercel/analytics` |
| Backend | **None.** Zero `/api` routes, no DB, no ORM, no auth, no server actions |
| Data | 3 static arrays: 15 operators, 5 destinations, 17 packages (`src/data/*.ts`, 1,489 lines) |
| Pages | `/`, `/search`, `/compare`, `/comparisons`, `/saved`, `/destinations`, `/destinations/[slug]`, `/operators`, `/packages/[id]` |
| SEO | `sitemap.ts`, `robots.ts`, 4 JSON-LD schema components, `lib/seo/altText.ts`. Genuinely good — preserve. |
| Persistence | `localStorage` only (`useSavedOperators`, `useSavedComparisons`) |

The mock data is a better starting point than expected: 15 operators and 5 destinations already satisfies the "10–15 operators, 4–6 destinations" requirement. But packages are thin — **17 total, unevenly spread** (Spiti 6, Leh 5, Rishikesh 4, Meghalaya 3, Coorg 2). Coorg can't support a 3-way comparison. Seed needs to bring every destination to 4–5 packages (target ~24).

### Keep vs. rework

**Keep as-is (no changes):**
- `src/components/ui/*` — `Button`, `Badge`, `StarRating`, `AnimatedNumber`, `ReviewCard`
- `src/components/schema/*` — all four JSON-LD components; they take props, so they work unchanged once props come from the DB
- `src/components/layout/Footer.tsx`
- `src/lib/seo/altText.ts`, `src/lib/utils.ts`
- `robots.ts`
- `next.config.ts` — already whitelists `images.unsplash.com`

**Keep, re-point at DB (mechanical: swap import for a server query):**
- `src/app/destinations/page.tsx`, `src/app/destinations/[slug]/page.tsx` — already server components with `generateStaticParams` + `generateMetadata`. Cleanest migration in the repo.
- `src/app/operators/page.tsx`
- `src/components/destination/DestinationTabs.tsx`, `src/components/RelatedDestinations.tsx`
- `src/components/home/*` — `TrendingDestinations`, `TopOperators`, `ComparisonPreview` need real data passed in as props from a server parent; the rest (`HeroSection`, `HowItWorks`, `FAQ`, `WhyAtlaso`, `CtaBanner`, `Testimonials`) are static marketing and need nothing
- `sitemap.ts` — swap static import for a DB query; **add package + operator routes**, which are missing today

**Needs real rework:**

1. **`src/app/packages/[id]/page.tsx`** (366 lines) — it's `"use client"` with `useParams`. That means: no SSR, no `generateMetadata`, no JSON-LD, **no server-rendered price**. Every package detail page is currently invisible to Google and violates the "price must come from the server" rule by construction. Must become a server component with a small client island for the tab/accordion state.

2. **`src/components/compare/CompareContent.tsx`** (608 lines) — three problems:
   - Hardcoded to exactly 3 columns (`CARD_ACCENTS`, `COL_BG`, `BEST_FOR_LABELS` are 3-element arrays); the UI advertises "Compare Upto 4"
   - **Invents prices client-side**: `Math.round(p.price * 0.68)` for "Base Price" and `* 0.18` for "Tax & Fees" are fabricated. Direct violation of the non-negotiable. Must be deleted and replaced with the server price breakdown.
   - No retail-vs-platform "you save ₹X" framing at all — the entire value proposition is absent from the comparison view
   - Desktop-only: fixed `w-52` sidebar + `grid-cols-4`, no mobile layout

3. **`src/components/search/SearchContent.tsx`** (415 lines) — filters the full in-memory array client-side. Needs to become URL-state-driven server querying. Also displays fabricated stats: hardcoded `4.8`, `(124 reviews)`, and `filteredPackages.length * 3` as "Trips". `FilterSidebar` exposes duration/inclusions/groupSize filters that **are never applied** (only budget + difficulty are wired).

4. **`useSavedComparisons` / `useSavedOperators`** — need a DB-backed path when authenticated, with the localStorage path kept for anonymous users and merged on login.

5. **`src/components/search/OperatorCard.tsx`** — needs the save-vs-retail price block as its primary visual element.

### Data-model gaps found in the mock data

- `Package.price` is a single number. No `retail_price`, no `b2b_cost`. **The core business entity does not exist yet.**
- Operator has no legal name, contact, KYC, bank/payout, or login.
- `reviews` are inline string arrays on packages, not entities, and are not tied to bookings.
- `destination.operatorCount` / `tripCount` are hand-typed constants that don't match the actual package rows (Coorg claims 11 operators; 1 operator has a Coorg package). Once DB-driven these must be computed, or they'll keep lying.
- No booking, lead, payment, or availability concept anywhere.

### Palette drift (relevant to the design question in §6)

Three uncoordinated values for what should be two brand colours:
- Navy: `--color-atlas-night #0A1628` (tokens) vs `#1A2B4A` (hardcoded ~40× in compare/search)
- Accent: `--color-compass-blue #FF5A5F` (tokens — note: named "blue", is coral) vs `#E85D75` (hardcoded throughout `CompareContent`)

`#FF5A5F` is Airbnb's exact brand coral. Worth a decision before Phase 2 UI work.

---

## 2. Proposed data model

Prisma + Postgres. Money stored as **integer paise** (`Int`), never `Float` — no floating-point money.

```
Operator
  id, slug, displayName, legalName, gstin, panMasked
  contactName, contactEmail, contactPhone
  verificationStatus  PENDING|VERIFIED|SUSPENDED|REJECTED
  isDemoData Boolean @default(false)      ← bulk-delete key for dummy rows
  logoUrl, description, badge, foundedYear
  avgResponseMinutes Int?                  ← trust signal
  ratingCached Float, reviewCountCached Int   (denormalised, recomputed on review write)
  createdAt, updatedAt

OperatorDocument      operatorId, type (GST|PAN|LICENSE|INSURANCE), fileUrl, status, reviewedAt
OperatorPayoutAccount operatorId, accountHolder, accountNumberEnc, ifsc, upiId, verified

OperatorUser          id, operatorId, email @unique, passwordHash, name, role OWNER|STAFF, lastLoginAt
User (customer)       id, email @unique, passwordHash?, name, phone, emailVerified, createdAt
AdminUser             id, email @unique, passwordHash, name, role ADMIN|SUPERADMIN

Destination
  id, slug @unique, name, region, tagline, description
  imageUrl, heroImageUrl, imageCredit
  category, difficulty, bestTime, avgDurationDays, accentColor
  highlights String[], experiences Json, monthStatuses Json, faqs Json
  isDemoData Boolean @default(false)
  -- operatorCount / tripCount are COMPUTED, not stored

Package
  id, slug @unique                        ← preserves existing /packages/[id] URLs
  operatorId, destinationId
  title, summary, durationDays, nights, groupSizeMin, groupSizeMax
  difficulty, hotelType, cancellationPolicyId
  mealsIncluded, guideIncluded, transportIncluded
  images String[], inclusions String[], exclusions String[]
  itinerary Json      -- [{day,title,description,activities[]}]
  status DRAFT|PENDING_REVIEW|ACTIVE|PAUSED|PRICING_VIOLATION
  isDemoData Boolean @default(false)
  bookingsLast30d Int @default(0)         ← "X people booked this month"
  publishedAt, createdAt, updatedAt

PackagePricing        -- one CURRENT row per package + full history
  id, packageId, currency "INR"
  retailPrice   Int    -- paise; operator's own direct-to-consumer price
  b2bCost       Int    -- paise; what the operator charges us
  platformPrice Int    -- paise; COMPUTED server-side, persisted
  appliedMarginRuleId, marginAmount Int, marginPct Float
  validationStatus OK|BELOW_MIN_MARGIN|ABOVE_RETAIL|INVERTED
  validationNote String?
  isCurrent Boolean, effectiveFrom, effectiveTo
  @@index([packageId, isCurrent])

MarginRule            -- admin-editable; NOT hardcoded
  id, scope GLOBAL|OPERATOR|DESTINATION|PACKAGE
  operatorId?, destinationId?, packageId?
  strategy PERCENT|FLAT|MIN_OF_PERCENT_AND_FLAT|MANUAL_OVERRIDE
  percentBps Int?      -- 2000 = 20.00%
  flatAmount Int?      -- paise
  minMargin  Int?      -- paise floor
  priority Int, active Boolean, createdByAdminId, note

PackageDeparture      packageId, startDate, endDate, seatsTotal, seatsBooked, priceOverride Int?
CancellationPolicy    id, label, flexibility HIGH|MEDIUM|LOW, refundTiers Json

Booking
  id, reference @unique          -- ATL-XXXXXX
  userId, packageId, departureId?
  travellerCount, startDate
  -- FROZEN pricing snapshot; never recomputed
  snapshotRetailPrice, snapshotB2bCost, snapshotPlatformPrice, snapshotMargin  Int
  snapshotPricingId, totalAmount Int
  status PENDING|CONFIRMED|CANCELLED|COMPLETED|REFUNDED
  paymentStatus  UNPAID|PAID|FAILED|REFUNDED
  payoutStatus   PENDING|SCHEDULED|PAID
  travellers Json, contactEmail, contactPhone, notes
  createdAt, confirmedAt

Payment       bookingId, provider "razorpay", razorpayOrderId, razorpayPaymentId,
              razorpaySignature, amount Int, status, rawWebhook Json, createdAt

Lead          id, packageId?, destinationId?, name, phone, email,
              travelDate?, travellerCount?, budgetRange?, message,
              status NEW|CONTACTED|QUOTED|CONVERTED|LOST, assignedToAdminId?, source

Review        id, bookingId @unique  ← 1:1 with a COMPLETED booking; no booking, no review
              userId, packageId, operatorId, rating Int, title, body,
              photos String[], status PENDING|PUBLISHED|REJECTED, createdAt

SavedComparison   id, userId, name, packageIds String[], createdAt
SavedPackage      userId, packageId  @@unique([userId, packageId])
```

**Deviations from your draft, and why:**
- Split `PackagePricing` into current + history rows rather than one mutable row, so a booking's `snapshotPricingId` always points at a real historical record.
- Pulled `margin_rule` out of `PackagePricing` into its own scoped `MarginRule` table — your requirement is that margin be configurable per operator/destination from admin, which a per-package column can't express.
- Added `PackageDeparture` — checkout needs dates and seat inventory; without it "book this package" has nothing to decrement.
- Added `validationStatus` on pricing + `PRICING_VIOLATION` on package status, so a violating package is flagged and withheld from listings rather than silently shown wrong.
- `CancellationPolicy` as a table because the comparison view needs to rank flexibility; today `CompareContent` string-matches `"free"` / `"no refund"` against free text.

### Pricing engine

`src/server/pricing/` — pure, unit-testable, server-only.

Resolution order (most specific wins, ties broken by `priority`):
`PACKAGE → OPERATOR+DESTINATION → OPERATOR → DESTINATION → GLOBAL`

Default seeded GLOBAL rule: `MIN_OF_PERCENT_AND_FLAT`, `percentBps 2000`, `flatAmount ₹1,500`, `minMargin ₹500` — i.e. `min(20% of b2b_cost, ₹1,500)`, editable from admin.

```
platformPrice = b2bCost + margin
```

Validation, run on every write and nightly:
1. `platformPrice >= b2bCost + minMargin` → else `BELOW_MIN_MARGIN`
2. `platformPrice < retailPrice` → else `ABOVE_RETAIL` (kills the value proposition)
3. `b2bCost < retailPrice` → else `INVERTED` (bad operator data)

Any non-`OK` status ⇒ package flagged, excluded from search/compare, surfaced in the admin queue. **Never silently displayed.**

Enforcement of "server-computed price only": `PackagePricing` is exposed to the client through a `PublicPrice` DTO carrying `{ platformPrice, retailPrice, savings, savingsPct }` as pre-formatted server values. `b2bCost` and margin **never cross the network boundary** to a customer surface. A lint rule + a single `toPublicPrice()` chokepoint enforces this.

---

## 3. Tech choices

| Need | Choice | Why |
|---|---|---|
| Database | **Supabase Postgres** *(your call, §6.2)* | Used as plain Postgres via Prisma — pooled `DATABASE_URL` (pgbouncer, :6543) for the app, `DIRECT_URL` (:5432) for migrations. **Supabase Storage is used** for operator KYC documents and logos, which is a real win over the alternative. **GoTrue auth is not used** — see the auth row. |
| ORM | **Prisma 6** | Requested default; `prisma/seed.ts` is exactly the seeding story you asked for. |
| Auth | **Auth.js v5 (NextAuth)** + Prisma adapter | Customers: email+password and Google. Operators and admins: separate credentials providers, separate cookie scope, separate middleware-guarded route groups. Deliberately *not* Supabase GoTrue — one GoTrue user table can't cleanly model three principal types with different profile shapes and different login surfaces. |
| File storage | **Supabase Storage** | Operator KYC documents in a private bucket with signed URLs; operator logos in a public bucket. Add `*.supabase.co` to `next.config.ts` `remotePatterns`. |
| Payments | **Razorpay, test mode** | Server-side Order create, client Checkout, **webhook is the source of truth** for booking confirmation (never trust the browser callback). Test keys only until real inventory exists. |
| Email | **Resend** + React Email | Booking confirmation, operator notification, lead alert. |
| Validation | **Zod** | Shared schemas between route handlers, server actions, and forms. |
| Data access | Server Components → `src/server/*` service layer | Route handlers only where a client genuinely needs to fetch (search-as-you-type, compare drawer). |
| Rate limiting | `@upstash/ratelimit` | Lead form and auth endpoints. |
| Money | Integer paise everywhere | Format only at the edge. |

Env vars you'll need to provision (full list will ship with each phase):
`DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `AUTH_GOOGLE_ID/SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RESEND_API_KEY`, `UPSTASH_*`.

---

## 4. Seed data plan

`prisma/seed.ts`, idempotent (`upsert` by slug), all rows `isDemoData: true`.

- **15 operators** — carried over from `src/data/operators.ts`, enriched with legal names, GSTINs, contacts, response times, KYC docs in mixed states (so the admin verification queue has something to show)
- **5 destinations** — carried over from `src/data/destinations.ts` verbatim, including the existing Unsplash imagery and FAQ/experience content
- **~24 packages** — existing 17 kept with their current slugs, plus ~7 new ones so **every destination has 4–5 packages** (Coorg and Meghalaya are currently too thin for a 3-way comparison)
- **Pricing on every package**: `retailPrice` = the existing `price` field; `b2bCost` = retail × (0.76–0.85), varied per package so the gap is 15–24% and not uniform; `platformPrice` computed by the real engine at seed time, not hand-written
- **Two deliberate violations** seeded (one `ABOVE_RETAIL`, one `BELOW_MIN_MARGIN`) so the admin flag queue and the exclusion logic are demonstrably working rather than theoretically working
- 2 operator logins + 1 admin login with known dev passwords, printed by the seed script
- ~60 reviews, each attached to a completed dummy booking, so the "no booking, no review" constraint holds in the seed too
- Departures for the next 6 months; a few near-sold-out to exercise scarcity UI

Cleanup path: `npm run db:purge-demo` deletes every `isDemoData: true` row in FK-safe order.

Images: per-destination curated Unsplash IDs (already correct in the existing data — Spiti's photo is genuinely Spiti). New packages get destination-matched photos from the same curated pool, never a random ID.

---

## 5. Phased rollout

| Phase | Contents | Visible change |
|---|---|---|
| **1. Foundation** | Prisma schema, Neon, migrations, `prisma/seed.ts`, pricing engine + unit tests, `src/server/*` service layer, all existing pages re-pointed at the DB, Auth.js scaffolding for all three principal types | None intended — pages render identically, sourced from Postgres |
| **2. Comparison** | Compare rewritten (2–4 columns, real price breakdown, save-vs-retail hero number, itinerary/inclusion diffs, mobile layout); search → real DB queries with all filters wired; saved comparisons persisted per account with anonymous→login merge; empty/loading states | Core differentiator, visibly better |
| **3. Checkout** | Booking flow (package → dates → travellers → details → pay), Razorpay test-mode + webhook, frozen price snapshot, confirmation + operator emails, **and** the Request-Callback / Custom-Quote lead path | Revenue path, end to end in sandbox |
| **4. Portals** | Operator portal (packages, dual pricing entry, bookings, payouts) and admin panel (verification queue, margin rules, GMV/margin analytics, pricing-violation queue) | Internal + operator-facing |
| **5. Trust & growth** | Booking-gated reviews, rating recomputation, DB-driven sitemap incl. package/operator routes, JSON-LD from live data, OG images | SEO + credibility |

After each phase I'll stop and hand you: what changed, what to configure, what to test manually.

---

## 6. Decisions taken

### 6.1 Design scope — **(B) Token correction + new price/trust components** ✅

The design brief ("pick a palette", "avoid the AI-template look") and the non-negotiable ("keep the current visual design language, this is not a redesign problem") pulled in opposite directions. Resolved as:

**Keep:** every layout, all spacing, the Plus Jakarta Sans + Inter pairing, and every existing component.

**Fix (token values only, `globals.css`):** replace `#FF5A5F` — Airbnb's exact brand coral, and the strongest "template" signal on the site — with a distinct accent; collapse the two drifted accents (`#FF5A5F` / `#E85D75`) into one; collapse the two drifted navies (`#0A1628` / `#1A2B4A`) into one; rename `--color-compass-blue`, which is not blue. The ~40 hardcoded hex literals in `CompareContent`/`SearchContent` get replaced with tokens as those files are reworked anyway.

**Design new (they don't exist today and Phase 2 needs them regardless):**
- the save-vs-retail price block, with the savings figure as the dominant number
- verified badge
- trust-signal row (rating + review count, bookings this month, cancellation flexibility, operator response time)

Per the two-pass instruction, the palette values and these three component designs ship as a **separate proposal before any Phase 2 UI code**. Phase 1 is backend-only and doesn't block on it.

### 6.2 Database — **Supabase** ✅

Used as plain Postgres through Prisma, plus Supabase Storage for KYC documents and operator logos. Auth stays on Auth.js, not GoTrue (§3).

---

## 6.3 Phase 0 (done): placeholder data, no database

Database work is deferred until `DATABASE_URL` / `DIRECT_URL` are provided. In the
meantime the three static files in `src/data/` were expanded to the exact shapes the
Prisma models will use, so the migration is a data move rather than a refactor.

| | Before | After |
|---|---|---|
| Operators | 15 | 15, with KYC, payout, contact, response-time fields |
| Destinations | 5 | 6 (added Jaisalmer) |
| Packages | 17 (Coorg had 1) | 27, 4–6 per destination |
| Pricing | single `price` | `retailPrice` + `b2bCost` + computed `platformPrice` |
| Departures | none | 91 dated, seat-tracked |

New files: `src/data/pricing.ts` (margin rules + engine + validation) and
`src/data/cancellationPolicies.ts`. Money stays in whole rupees here to match
`formatPrice()`; the seed script multiplies by 100 for the paise columns.

**Margin model changed from the brief's formula.** The suggested default
`min(20% of b2b_cost, ₹1,500)` is cost-plus and ignores retail, so on low-ticket
packages it consumed up to 93% of the operator discount — the cheapest Coorg
package showed a ₹100 saving on ₹7,999. It also does not reproduce the brief's own
worked example (₹8,000 cost / ₹10,000 retail gives ₹9,500, not ₹9,000). The GLOBAL
rule now implements the worked example instead: an even split of the operator
discount, floored at ₹500 and capped at ₹1,500. Savings across the catalogue moved
from 1–15% (median 8%) to 9–15% (median 11%), and Atlaso keeps 43% of the discount
rather than 56%. Both cost-plus strategies remain in the engine and two seeded rules
still use them; reverting is a one-line change to `rule-global-default`.

Also corrected while in here: every destination photo. The previous set was largely
mismatched — Coorg was illustrated with India Gate in Delhi, Meghalaya with a
Kashmiri snow meadow, Spiti with a forested snow trek (Spiti is a treeless cold
desert), and Rishikesh reused Ladakh's image. All 38 image URLs were opened,
visually verified against the place they are attached to, and confirmed to return
200.

## 7. Risks

- **`#FF5A5F` is Airbnb's brand coral.** Not a legal problem at this scale, but it's the single strongest "template" signal on the site and it's currently the primary CTA colour.
- **Razorpay needs a registered business entity** even for test-mode keys. If the entity isn't set up, Phase 3 stalls at the gateway — flag early if so.
- **Payouts to operators are out of scope as specified.** The schema tracks `payoutStatus`, but actually moving money (RazorpayX / bank transfer) isn't in any phase. It'll need a Phase 6 before a real operator is onboarded.
- **`generateStaticParams` + DB.** Destination pages are statically generated today. Once DB-driven they need ISR with tag-based revalidation on operator edits, or the operator portal will appear broken (edit saved, page unchanged).
- **The mock data's fake counts.** `operatorCount: 11` for Coorg vs. 1 real Coorg operator. Once computed from real rows these numbers will drop visibly. That's correct behaviour, but the homepage will look emptier — worth knowing before you see it.

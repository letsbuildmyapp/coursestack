# CourseStack

A reading-room for working professionals. Six new courses every quarter, taught by people who still ship.

CourseStack is one of several portfolio demos for [letsbuildmyapp.com](https://letsbuildmyapp.com). It is a fully working membership and online-education platform: catalog, paid subscriptions, lesson player, AI study tools, instructor authoring, admin dashboards, and a per-role onboarding tour.

It is built on the LBMA portfolio stack (see `../CourseStack - Membership : Education Platform/STACK.md`) with an **Editorial / magazine** visual archetype.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

The app boots in **demo mode** — an in-memory + localStorage-backed data store that exercises every flow without needing Firebase / Stripe / Anthropic credentials. The Sign-In page lists pre-seeded accounts you can click to autofill (password is always `coursestack`):

| Email                          | Roles                | Tier  |
|--------------------------------|----------------------|-------|
| `admin@coursestack.demo`       | admin + instructor   | team  |
| `ada@coursestack.demo`         | instructor           | team  |
| `marco@coursestack.demo`       | instructor           | team  |
| `remy@coursestack.demo`        | instructor           | team  |
| `pro@coursestack.demo`         | member               | pro   |
| `team@coursestack.demo`        | member               | team  |
| `free@coursestack.demo`        | member               | free  |

When you set Firebase env vars (see below) the same data interface routes through Firebase Auth, Firestore, and Cloud Functions — code switches transparently.

---

## Visual identity

CourseStack uses the **Editorial** archetype from STACK.md.

- **Type**: Fraunces (display) + Inter (text), loaded from Google Fonts with `display=swap`.
- **Palette** (OKLCH, light mode only — editorial archetype does not require dark mode):
  - Paper / background: `oklch(0.985 0.012 82)`
  - Paper soft: `oklch(0.975 0.014 80)`
  - Paper deep: `oklch(0.955 0.018 78)`
  - Ink / primary text: `oklch(0.22 0.04 268)`
  - Ink soft: `oklch(0.36 0.035 268)`
  - Ink mute: `oklch(0.52 0.028 270)`
  - Rule (border): `oklch(0.88 0.02 80)`
  - Terra (accent): `oklch(0.62 0.16 38)`
  - Terra deep: `oklch(0.48 0.18 36)`
  - Success: `oklch(0.55 0.13 152)`
  - Danger: `oklch(0.55 0.18 28)`
- **Radius**: `rounded-md` (`0.375rem`) throughout.
- **Density**: generous whitespace, asymmetric editorial layouts, drop caps on long lessons, pull quotes for instructor bios, B&W portrait photography.
- **Hero**: split-screen — large Fraunces display headline left, layered course cards at slight angles right.
- **Typography rules** from STACK.md are enforced: 16px body min, line-height ≥1.5, hierarchy via size+weight, tabular-nums on every number column, 44×44 touch targets, all-caps under 13px tracked at ≥0.05em, ~70ch line length cap.

---

## What's in the box

### User-facing

- **Marketing landing** — split-screen hero with stacked course cards, six-course "stack" grid, B&W instructor portraits, three-tier pricing, editorial essay.
- **Auth** — email/password and Google sign-in (via Firebase Auth in production, demo store in demo mode), with redirect-to-intended-destination.
- **Member dashboard** — Continue learning, in-progress library with progress bars, recommendations, reading streak.
- **Catalog** — search and filter by topic, tier, length, instructor.
- **Course detail** — modules + lesson outline with lock icons for tier-gated lessons, instructor card, sticky sidebar with progress.
- **Lesson player** — video / text (markdown + drop cap) / quiz (auto-scored, ≥70% to pass), sidebar module/lesson tree with completion checks, persists video position every 10 s and on pause, auto-advance on complete.
- **AI tool dock** on every lesson:
  - **Summarizer** — Haiku 4.5 with prompt caching, cached in Firestore so subsequent loads are free.
  - **Study buddy** — Sonnet 4.6 streaming chat, system prompt is the lesson content (cached).
  - **Notes** — saved to Firestore per-lesson.
- **Instructor tools** — course list with publish toggles, drag-to-reorder modules and lessons (`@dnd-kit/sortable`), type-aware lesson editors (markdown for text, URL for video, question builder for quiz), aggregate student progress, **AI course outline generator** (Opus 4.7) that drafts a 2–4 module outline you review and one-click create.
- **Admin tools** — users table (search, filter by role, promote/demote), courses table (publish, see enrollment counts), revenue dashboard with Recharts (MRR area chart, by-tier bar chart, MRR / total / new subs / churn stat cards).
- **Onboarding tour** — per-role (member / instructor / admin), spotlight on ≥768px, centered modal fallback for <768px and welcome/done steps, keyboard nav (Esc/←/→/Enter), clickable step dots, body scroll lock, click-outside dismiss, separate localStorage key per role (`coursestack:tutorial_seen:<role>`).

### Backend (`functions/`)

Cloud Functions written in TypeScript, Node 20:

- **`stripeCheckout`** — creates a Stripe Customer (idempotent) and a Checkout Session for subscriptions.
- **`stripePortal`** — opens the Stripe Customer Portal for plan management.
- **`stripeWebhook`** — verifies signature, idempotent on `event.id`, flips `users/{uid}.{tier, subscriptionStatus, currentPeriodEnd}` in Firestore on `checkout.session.completed`, `customer.subscription.{created,updated,deleted}`, marks `past_due` on `invoice.payment_failed`.
- **`stripeMetrics`** — admin-only call, 5-minute Firestore cache.
- **`aiSummarizeLesson`** — Haiku 4.5 with system-prompt caching, cached per lesson in `aiSummaries/{lessonId}`.
- **`aiStudyBuddyStream`** — Sonnet 4.6 streaming HTTPS endpoint, system prompt = lesson content (cached).
- **`aiCourseOutline`** — Opus 4.7, instructors+admins only, returns strict JSON.
- All AI calls include per-user rate limits in `rateLimits/{uid}_{op}`.
- **`onUserCreated`** — Firestore-trigger welcome email via Resend + react-email.
- **`sendCompletionEmail`** — branded course-completion email with shareable certificate link.

### Data + security

- **Firestore rules** (`firestore.rules`) — admins all-access, instructors write only courses where `instructorId == request.auth.uid`, members read their own progress/enrollments only, lesson reads gated by tier rank and free-preview flag. Stripe events and rate limits are server-only (`if false`).
- **Storage rules** (`storage.rules`) — avatars writable by their owner, course covers and lesson assets writable by signed-in users (instructor scope further enforced by Firestore rules on the parent course doc).
- **Indexes** (`firestore.indexes.json`) — composite indexes for catalog queries, instructor-scoped course lists, and lesson ordering.

### Tests

- **Vitest** units on access-gate logic, progress math, and quiz scoring (13 tests, all passing — `npm test`).
- **Playwright** golden-path e2e in `e2e/golden-path.spec.ts`: signup → subscribe → enroll → complete a lesson → verify progress on dashboard. Run with `npm run test:e2e` (Playwright browsers must be installed once with `npx playwright install`).

---

## Environment configuration

`.env.local` (template at `.env.example`). The app runs in **demo mode** when these are blank; real Firebase activates once they're set.

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_EMULATORS=false
VITE_STRIPE_PUBLISHABLE_KEY=
```

**Never put server secrets in `VITE_*` vars** — they get bundled into the browser. Server secrets live in Firebase Functions config:

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set STRIPE_PRICE_PRO     # price_xxx for $29 plan
firebase functions:secrets:set STRIPE_PRICE_TEAM    # price_xxx for $79 plan
firebase functions:secrets:set RESEND_API_KEY
firebase functions:secrets:set EMAIL_FROM           # e.g. "CourseStack <hello@coursestack.app>"
firebase functions:secrets:set APP_URL              # e.g. https://coursestack-staging.web.app
```

---

## Deploy

CourseStack uses two Firebase Hosting sites: **`coursestack-staging`** and **`coursestack`** (prod). Always staging first.

### One-time setup

1. Create the Firebase project (`coursestack-demo` per `.firebaserc` — change to your own) and add the two Hosting sites.
2. Copy your config into `.env.local`.
3. `firebase use coursestack-demo` (or the project ID you chose).
4. `cd functions && npm install`.
5. Set the secrets listed above.
6. Configure the Stripe webhook endpoint to point at the deployed Function URL: `https://<region>-<project>.cloudfunctions.net/stripeWebhook`. Copy the resulting webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

### Staging

```bash
npm run deploy:staging
```

Smoke test the staging URL: sign up, subscribe with `4242 4242 4242 4242`, complete a lesson, click the AI summarizer.

### Production

```bash
npm run deploy:prod
```

(Per LBMA rule: never deploy straight to prod.)

### Local Stripe webhook forwarding for dev

```bash
stripe listen --forward-to localhost:5001/<project>/<region>/stripeWebhook
```

---

## Seeding

```bash
firebase emulators:start --only firestore,auth   # in one terminal
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
npm run seed
```

For staging, supply a service-account JSON: `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npm run seed`.

The seed script is idempotent and matches the demo fixtures (1 admin, 3 instructors, 3 members, 6 published courses, progress data on the `pro` and `team` members).

---

## Decisions to revisit with Alex

These were decisions made autonomously to ship the demo. None are load-bearing — all are easy to swap before the real client engagement.

- **Tier names and pricing.** Free / Reader, Pro / **Member** at **$29/mo**, Team at **$79/mo**. The "Member" naming for the paid plan is editorial-flavoured and might be confusing alongside the literal user role of "member"; "Pro" is the safer label.
- **Exact OKLCH palette.** Paper-and-ink with a warm terracotta accent — listed in full above. The terracotta lands at `oklch(0.62 0.16 38)`. Could push more aubergine or rose without changing anything else.
- **Marketing copy tone.** Direct, slightly snobby, anti-content-marketing ("six new courses every quarter, no autoplay"). Sets the platform up as a curated reading-room rather than a marketplace — which is on-brand for editorial but excludes the marketplace pitch entirely.
- **Catalog topics.** Brand strategy, composition, TypeScript, cold outbound, photography, productivity. Good range for a portfolio demo; production catalog should be narrower and more opinionated.
- **Light mode only.** STACK.md explicitly allows skipping dark mode for the editorial archetype. Worth a sanity check before going to a real client — many SaaS buyers will ask for it reflexively.
- **Free tier = "1 free preview lesson per course."** Enforced via the `isFreePreview` flag on each course's first lesson, plus a Firestore rule that grants any signed-in user that lesson regardless of tier. If the team wants "any one lesson the user picks" instead, the flag becomes a per-user record.
- **Course completion = 100% of lessons completed.** Quiz lessons require ≥70% to mark complete; non-quiz lessons accept a manual "Mark complete" button. No time-on-page check.
- **AI rate limits.** Hard-coded at 60 summarizer calls/hour and 20 outline generations/hour per user. These are arbitrary; Alex may want different caps per tier.
- **Demo authentication mock.** When Firebase keys are absent, a localStorage-backed store stands in for Auth/Firestore so the UI is fully exercisable. The Google-sign-in button in demo mode logs you in as `pro@coursestack.demo`. In production this is a real `signInWithPopup`.
- **Recommendations algorithm.** Currently "any course not in your library, top of the recency list." A real recommendation pass (rating × tier-eligibility × topic similarity) is straightforward but out of scope here.

---

## Stack summary

Frontend: React 18 + TypeScript + Vite, Tailwind v4, Radix primitives wrapped as shadcn-style components, React Router v6, TanStack Query, react-hook-form + zod, Framer Motion, lucide-react, sonner, Recharts, @dnd-kit, react-markdown.

Backend: Firebase Auth + Firestore + Storage + Hosting, Cloud Functions on Node 20 / TypeScript, Stripe, Anthropic SDK, Resend + react-email.

Tests: Vitest, Playwright.

Project lives at `/Users/adamdow/Documents/claude-projects/LBMA Demo Projects/coursestack`. STACK.md sits in the sibling `CourseStack - Membership : Education Platform/` directory and is the source of truth for stack and visual rules.

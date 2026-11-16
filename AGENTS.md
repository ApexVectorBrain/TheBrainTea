# The Brain Tea: repository guide for agents

This guide applies to the whole repository. Paths are relative to the root. Keep it current when architecture, commands, routes, or business rules change.

## Start here

- One Next.js application serves the public website, booking flow, staff dashboards, and backend API.
- The product is **The Brain Tea**, a Pune therapy clinic. `madhumati-clinic` in `package.json` and some README wording are older names.
- Database models use **Therapist**; the UI often calls the same entity a **consultant**. The authenticated role remains `THERAPIST`.
- `/admin`, `/reception`, and `/therapist` use live APIs. `/portal` is a client-facing **visual prototype without live data or authentication**. Do not assume it is a working patient account system.
- Operational data lives in PostgreSQL; biographies and some marketing copy are separate static content.
- Read the relevant route, service, domain rules, schema, and tests together. Implementation takes precedence over stale comments and README sections.

For backend work, begin with `prisma/schema.prisma`, `src/server/http.ts`, and the relevant file in `src/server/services/`. For public UI work, begin with the route in `src/app/`, shared components, `src/lib/site.ts`, and `tailwind.config.js`.

## Stack and top-level layout

Declared stack: Next.js 16, React 18, mixed JavaScript/TypeScript, Tailwind CSS 3, Prisma 5/PostgreSQL, Zod 4, Vitest 4. Exact versions are in `package.json` and `package-lock.json`. Authentication is custom JWT/bcrypt, not NextAuth despite the `NEXTAUTH_SECRET` variable name.

```text
src/
  app/                       App Router pages, layouts, and api/**/route.* handlers
  components/                Shared public UI, booking wizard, staff UI
    ui/                      Public primitives: Button, Surface, Input, etc.
    admin/                   Shared staff primitives and custom charts
    reception/               Booking tables, detail/scheduling modals, queues
    staff/                   Shared consultant leave modal
    legal/                   Shared legal-page layout
  lib/                       Prisma singleton, auth, encryption, formatting, site data
  server/
    domain/                  Pure booking, scheduling, commission, posting rules
    services/                Database orchestration and external integrations
    payments/                PaymentProvider interface and gateway adapters
    serializers/             Public allow-list and note-stripping helpers
    __tests__/               Backend unit and PostgreSQL integration tests
  proxy.ts                   Signed-cookie verification and staff-page redirects
prisma/
  schema.prisma              Schema and constraints; no migrations directory currently
  public-roster.json         Operational data for additional public consultants
  *.js                       Seeds, catalogue fixes, roster/account maintenance
public/                      Served images, logos, team/office photos, intro videos
netlify/functions/           Scheduled callers of the application's cron routes
```

- `next.config.mjs`: global response security headers and remote image allow-list (currently Unsplash).
- `tailwind.config.js`, `src/app/globals.css`, `postcss.config.mjs`: tokens, global styles, animations, Tailwind processing.
- `tsconfig.json`, `jsconfig.json`, `vitest.config.mts`: all resolve `@/*` to `src/*`. TypeScript permits JS and currently has `strict: false`.
- `eslint.config.mjs`: flat ESLint configuration using Next core web vitals.
- `netlify.toml`: actual deployment build pipeline, including database writes.
- `README.md`, `NETLIFY_DEPLOY.md`: setup/background material; cross-check against code and configuration.
- `all-fixes-v4.bundle`, root `TBT logo.png`, and `.neon` are not application entry points. Preserve unrelated artifacts and keep local connection data out of documentation.
- `node_modules/`, `.next/`, generated Prisma output, and `next-env.d.ts` are generated/ignored artifacts, not source to edit.

## Pages and route ownership

Each route below maps to `src/app/<route>/page.*`; layouts sit beside their route groups.

| Surface | Routes | Main implementation notes |
| --- | --- | --- |
| Public website | `/`, `/about`, `/team`, `/services`, `/services/[slug]`, `/contact`, `/faq` | Home/about have substantial page-local markup and motion; services read Prisma; team/about read `TEAM`. |
| Booking | `/book`, `/booking/payment-status`, `/booking-confirmed` | `BookingWizard.js`, server booking page, polling/retry page, server-rendered confirmation. Query keys differ: `bookingId` for payment status, `id` for confirmation. |
| Internship | `/internship` | `InternshipApplicationForm.tsx` submits multipart form data. |
| Legal | `/privacy`, `/terms`, `/refund-policy` | Shared `components/legal/LegalLayout.tsx` and identity/policy constants. |
| Admin | `/admin`, `/admin/login`, `/admin/bookings`, `/admin/consultants`, `/admin/clients`, `/admin/payments`, `/admin/payouts`, `/admin/settings`, `/admin/internship-applications` | Full operational and financial control; APIs under `/api/admin`. |
| Reception | `/reception`, `/reception/appointments`, `/reception/confirmations`, `/reception/clients`, `/reception/payments` | Front-desk operations; common booking UI in `components/reception/bookings.tsx`. Uses `/admin/login`. |
| Therapist | `/therapist`, `/therapist/login`, `/therapist/appointments`, `/therapist/calendar`, `/therapist/clients`, `/therapist/payments`, `/therapist/profile`, `/therapist/settings` | Own appointments, client access, earnings, profile and calendar connection; APIs scoped to the logged-in therapist. |
| Client prototype | `/portal`, `/portal/appointments`, `/portal/payments`, `/portal/invoices`, `/portal/profile` | Static examples marked with `PrototypeBanner.tsx`; no `/api/portal` backend. |

`src/app/layout.tsx` loads Cormorant Garamond, DM Sans, metadata/JSON-LD, `IntroOverlay`, `Header`, `Footer`, and `WhatsAppButton`. Public chrome uses `isDashboardRoute`/`DASHBOARD_PREFIXES` in `src/lib/site.ts`. Staff layouts request `/me` and render navigation; APIs authorize independently.

Public canonical URLs use the non-www `SITE_URL` as `metadataBase`. The homepage server wrapper in `src/app/page.tsx` sets its canonical and renders `HomeClient.tsx`; other public route layouts/pages set their own canonicals, including the dynamic service detail metadata. Do not add a homepage canonical or `openGraph.url` back to the shared root layout.

### API map

Handlers are in `src/app/api/**/route.ts` or `route.js`. Most TS routes use `handleApi`; JS/upload/OAuth handlers may manage responses directly. Read the handler's Zod schema before changing payloads.

| Route family | Responsibility |
| --- | --- |
| `/api/auth/login`, `/api/auth/logout` | Password verification, role-based redirects, issuing/clearing `auth_token`. |
| `/api/consultants?service=<slug>` | Approved, active consultants offering a service; resolves per-service fees and booking order. |
| `/api/bookings` | Public booking creation; strict payload, clinic-time parsing, server-selected price/provider. |
| `/api/bookings/available-slots` | Weekly windows minus existing bookings, leave blocks, past times, and expired payment holds. |
| `/api/bookings/cancel` | Public cancellation by booking UUID, notice cutoff, and paid-booking refund request. |
| `/api/bookings/[id]/payment-status`, `/retry-payment` | Payment state resolution and retry within the reservation window. |
| `/api/admin/*` | Admin operations, analytics/reports, audit logs, commission settings, payouts, application review. |
| `/api/reception/*` | Dashboard, bookings, clients, consultants, payments, identity; narrower fields/actions than admin. |
| `/api/therapist/*` | Dashboard, appointments, calendar, clients, earnings, profile, availability, Calendar connection, identity. |
| `/api/consultant-leaves` | Shared admin/reception leave management; protected despite lacking a staff route prefix. |
| `/api/internship` | Public application upload; admin list/status/resume downloads are under `/api/admin/internship-applications`. |
| `/api/webhooks/[provider]` | Provider-authenticated payment events and deduplication. |
| `/api/google-calendar/callback` | OAuth callback, signed state/nonce checks, connection and recovery work. |
| `/api/cron/reconcile-payments`, `/api/cron/send-appointment-reminders` | POST jobs authenticated with Bearer `CRON_SECRET`. |

Admin booking detail PATCH actions are `transition`, `reschedule`, `record-payment`, `refund`, and `notes`. Reception supports only its permitted transitions, rescheduling, and payment collection. Therapist appointment detail supports scoped transitions and notes. Keep action schemas, UI controls, and service guards aligned.

## Backend responsibilities

Paths in this table are under `src/server/`.

| File | Responsibility |
| --- | --- |
| `http.ts` | `ApiError`, `handleApi`, role guards, Zod parsing, pagination, IP extraction, rate-limit enforcement. |
| `validation.ts` | HTTP(S)-only URL validation and CSV escaping/formula-injection protection. |
| `audit.ts` | Structured audit records; accepts a transaction client for atomic recording. |
| `clinicTime.ts` | Parse clinic dates/times and day boundaries using UTC+05:30 independently of host timezone. |
| `dateRange.ts` | Analytics date presets and chart buckets; currently uses host-local Date operations, so do not assume identical behavior to clinic-time helpers. |
| `money.ts` | Integer minor-unit validation and rupee conversion. |
| `domain/bookingStatus.ts` | Legal status transitions and statuses that hold/release slots. |
| `domain/receptionScope.ts` | Reception transitions/rescheduling restrictions, a subset of the main state machine. |
| `domain/workingHours.ts` | Five-hour working windows, 50-minute sessions, hourly start spacing, legacy-row compatibility. |
| `domain/counselingType.ts` | Staff scheduling categories, labels, canonical service slugs/defaults. |
| `domain/commission.ts`, `domain/postings.ts` | Pure money splitting, proportional reversals, and ledger posting generation. |
| `services/bookingService.ts` | Public creation, staff scheduling, validation, overlap prevention, expiration, transition history, rescheduling, side-effect orchestration. |
| `services/paymentService.ts` | Charge creation, successful/failed charge and refund recording, manual collection, invoices, webhook journal, ledger insertion. |
| `services/paymentStatusService.ts` | Provider status checks, retry coordination, stale-payment/refund reconciliation. |
| `services/commissionService.ts` | Default/consultant commission history and booking-time rate resolution. |
| `services/ledgerService.ts` | Financial summaries and consultant balances derived from ledger entries and payout reservations. |
| `services/payoutService.ts` | Balance-checked payout creation and settlement transitions. |
| `services/analyticsService.ts` | Admin/therapist KPIs, revenue/booking/client series, distributions and consultant performance. |
| `services/googleCalendarService.ts` | Per-therapist OAuth, encrypted refresh tokens, Calendar/Meet creation, sync/cancel and recovery. |
| `services/emailNotificationService.ts` | Resend templates, notification claims, booking/payment emails and reminders. |
| `payments/types.ts`, `payments/registry.ts` | Gateway interface and adapter selection; implementations are `manualProvider.ts` and `phonepeProvider.ts`. |
| `serializers/publicBooking.ts` | `publicBookingView` allow-list and `stripNotes` for list responses. |

Reuse domain/services for business rules and multi-record mutations. Direct Prisma reads in pages/routes already exist. Pure domain modules can be shared with UI; Prisma, credentials and integrations must stay out of client bundles.

## Data model and invariants

`prisma/schema.prisma` is authoritative for persistence. Status/role fields are strings constrained by application code, not Prisma enums.

| Model group | Meaning and relationships |
| --- | --- |
| `User`, `Therapist`, `GoogleCalendarConnection` | Staff identity, optionally linked consultant profile, and one encrypted Calendar connection per consultant. A public consultant can exist without a login. |
| `Service`, `TherapistServiceRate` | Active catalogue, many-to-many consultant offerings, optional unique consultant/service rate override. |
| `TherapistAvailability`, `SlotBlock` | Recurring weekly working windows and one-off leave/unavailability. |
| `Client` | Unique email, contact/consent/age data, optional primary therapist. `dob` is legacy; see `prisma/backfill-client-age.js`. |
| `Booking`, `BookingSlot`, `BookingStatusHistory` | Appointment and price/commission snapshot, unique slot claim, append-only transition history. |
| `PaymentRecord`, `WebhookEvent` | Charge/refund attempts and provider event journal; unique idempotency key and `(provider, externalId)` respectively. |
| `LedgerEntry`, `Payout`, `CommissionSetting` | Financial postings, settlement/reservation lifecycle, commission configuration history. |
| `EmailNotification`, `AuditLog` | Notification deduplication by `(bookingId, type)` and structured operational audit trail. |
| `InternshipApplication`, `Testimonial` | Applicant details and resume bytes; testimonial persistence also exists, but has no dedicated management route in the current tree. |

Preserve these rules:

1. **Money is integer paise.** Fields ending in `Minor` are not rupees. Convert at input/display boundaries. `commissionBps` is basis points; the current split treats it as the **consultant's share**, with the platform receiving the remainder. Current domain bounds are 0–10000 and the fallback default is 3000. Do not copy the README's older 30–35% restriction.
2. **Bookings freeze economics.** Public pricing uses `TherapistServiceRate.feeMinor` when present, otherwise `Therapist.feeMinor`. `Service.priceMinor` is indicative. Later price/commission changes must not rewrite existing booking snapshots.
3. **Ledger history is append-only in normal operations.** Refunds/corrections add reversal postings. Derive balances from entries; do not maintain competing revenue counters or patch payment flags without ledger/history changes.
4. **Preserve transactional concurrency controls.** Booking creation/rescheduling uses consultant-scoped PostgreSQL advisory locks and overlap checks; `BookingSlot` additionally has a unique `(therapistId, startAt)` constraint. Payments use conditional status updates (compare-and-swap) to post once. Refund preparation and payout creation use row locks; payout settlement is also guarded. Do not replace these with unguarded read-then-write logic.
5. **Use the state machine.** Main statuses are `PENDING`, `AWAITING_PAYMENT`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`, `REFUND_PENDING`, `REFUNDED`. Consult the actual transition table; this is not a single linear sequence. Keep history, slot ownership, and denormalized `paymentStatus` consistent.
6. **Use clinic time for appointments.** The clinic is `Asia/Kolkata` (UTC+05:30). Use `clinicTime.ts` for incoming local times and `src/lib/format.ts` for UI formatting. Avoid interpreting date/time strings in the machine's local timezone.
7. **Scheduling permissions are intentional.** Admin sets weekly hours; admin/reception manage leave through `/api/consultant-leaves`. Therapist availability PUT and block mutations currently return 403. Staff can authorize overtime outside the normal window, but leave and overlapping appointments still block it.
8. **Distinguish policy from enforcement.** `src/lib/site.ts` declares 48-hour cancellation and 24-hour rescheduling notice. Public cancellation enforces its constant; current staff rescheduling does not enforce the 24-hour constant and deliberately skips normal-hours validation while checking future time, leave and overlaps. Search policy copy and guards together before changing this behavior.

## Main request flows

### Public and staff booking

1. `/book` reads active services offered by at least one active, approved consultant; it accepts `?service=<slug>` for preselection.
2. `BookingWizard.js` asks `/api/consultants` for service-specific consultants/rates, then `/api/bookings/available-slots` for a date. `src/lib/booking-consultants.ts` controls preferred ordering and portrait framing.
3. POST `/api/bookings` validates client details/consent and clinic time, then calls `createBooking`. The service checks offerings, working hours, leave and overlaps, upserts the client, and snapshots price/commission.
4. With `PAYMENT_PROVIDER=manual` (the default), the booking begins `PENDING`/`UNPAID`, has no payment expiry, and returns no online checkout. Any other registered provider begins `AWAITING_PAYMENT` with a 30-minute TTL and attempts checkout after the transaction commits.
5. **Both paths currently create a BookingSlot immediately.** Comments in booking/payment services that say public requests never hold slots are stale. Expired online reservations are released lazily and by reconciliation.
6. The wizard navigates to hosted checkout when available, to the payment-status page for an online reservation needing recovery, or to booking confirmation for a manual request. The confirmation route name does not imply that an unpaid request is already confirmed.
7. Admin/reception scheduling uses `scheduleAdminBooking`, existing/new clients, a canonical counselling type, and a staff-entered fee. Collected fees always use the manual payment adapter, even when online checkout uses PhonePe. A zero-fee waiver is `CONFIRMED`/`PAID` without a zero-value payment or ledger entry.

### Payments, refunds and payouts

- `PaymentProvider` isolates gateway-specific behavior. Implement an adapter and register it in `payments/registry.ts` to add a gateway.
- PhonePe checkout redirects are not proof of payment. Webhooks, server-side status polling, and reconciliation converge on `recordChargeSuccess`/`recordRefundSuccess`.
- Keep signature validation, provider amount comparisons, idempotency keys, webhook deduplication, and late/duplicate-payment handling intact. Confirmation and ledger writes are coupled transactionally.
- Public cancellation queues a refund when money was collected; reception may request a refund, while admin executes it. Refunds generate reversal entries instead of rewriting the original payment history.
- `consultantBalance` subtracts paid and pending/processing payout amounts from earned commission. `createPayout` locks the consultant before checking/reserving the available balance; settlement records `PAYOUT_PAID` once.

### Calendar, notifications and applications

- Each therapist connects their own Google account from the therapist UI. OAuth connect/callback routes and `googleCalendarService.ts` manage signed state, encrypted tokens, event/Meet creation and reconnect recovery for future paid confirmed bookings missing links.
- Booking/payment services invoke Calendar and Resend side effects outside core booking transactions. Rescheduling/cancellation also syncs/deletes existing events. Keep notification claim/retry behavior when changing these calls.
- `EmailNotification` claims are created before sending; failed sends remove the claim for retry. Templates and the client/consultant recipient pair are centralized in `emailNotificationService.ts`.
- Netlify calls reminder processing every **5 minutes**, targeting confirmed sessions **55–60 minutes ahead**, and payment reconciliation every **10 minutes**. Equivalent external schedulers must POST to the protected cron routes if deployed elsewhere.
- Internship uploads are PDFs up to 10 MiB, checked by filename, MIME and `%PDF-` signature, then stored as database bytes. Admin resume downloads use attachment/nosniff headers. Preserve these checks and access controls.

## Authentication and data boundaries

- `src/lib/auth.js` handles HS256 JWTs. `auth_token` is HttpOnly, SameSite=Strict, Secure in production, and expires after seven days. Login requires `DATABASE_URL` and `NEXTAUTH_SECRET`; production must not use fallback secrets.
- `src/proxy.ts` verifies signature and expiry before staff-page redirects. Its matcher covers `/admin`, `/reception`, `/therapist`, not API routes or the prototype `/portal`. The README's decode-only description is outdated.
- Every protected API must call the appropriate guard in `src/server/http.ts`: `requireAdmin`, `requireReception` (also admits admin), or `requireTherapist` (resolves the user's linked therapist). Re-check resource ownership for therapist reads/mutations.
- `/admin/login` serves admin and receptionist accounts; `/therapist/login` serves therapists. There is no reception login page or patient authentication role.
- Reception cannot access clinical notes, commission/payout details, execute refunds, or erase clients. Enforce this in APIs as well as UI.
- Use public allow-list responses rather than returning Prisma rows. Strip encrypted notes from lists and decrypt only authorized detail responses. Clinical notes and Google refresh tokens use `src/lib/encryption.js`; `ENCRYPTION_KEY` is 32 bytes encoded as 64 hex characters. Legacy decryption has plaintext/raw fallback behavior; inspect it before changing compatibility.
- Public booking UUID routes are capability-style access rather than patient sessions. Do not broaden the information they expose. Keep rate-limit buckets separate; the current limiter in `src/lib/rateLimit.js` is in-memory/per-instance.
- Preserve `next.config.mjs` security headers and `validation.ts` CSV protections. Do not log credentials, refresh tokens, clinical notes or real client data into new diagnostics or fixtures.

## UI and content sources

- Reuse public primitives in `src/components/ui/` and staff primitives (`Panel`, `KpiCard`, `StatusPill`, `Modal`, `Pager`, `Field`, etc.) in `src/components/admin/ui.tsx`.
- Staff charts are implemented in `src/components/admin/charts.tsx`; there is no separate chart-library layer. Shared reception scheduling/detail UI lives in `src/components/reception/bookings.tsx`; the leave dialog is `src/components/staff/ConsultantLeaveModal.tsx`.
- Public styling uses warm sand, sage/teal, forest slate and ivory. Staff panels use ocean blue, panel ivory and raised/inset surfaces. Legacy color names deliberately map to current tokens. `data-panel` scopes staff focus/style behavior.
- `src/lib/site.ts` holds identity, contacts, social links, route prefixes and policies. Search pages/header/footer too: some copy remains inline.
- `src/lib/team-data.ts` supplies `/about` and `/team`. Operational consultants are independent database rows. For roster changes, inspect `prisma/public-roster.json`, `prisma/add-public-consultants.js`, `prisma/add-launch-consultants.js`, relevant seeds, booking ordering and portraits together. Editing a biography does not update a database consultant or create a login.
- `/services`, `/services/[slug]`, and `/book` read the database. `src/lib/services-data.ts` is legacy/static content and currently only imported by its test; changing it does not update the live catalogue. The services listing also contains page-local pricing copy.
- Current staff counselling types are `CAREER_ACADEMIC`, `COUPLE_FAMILY`, and `INDIVIDUAL`, mapped to `career-academic-counselling`, `couples-counseling`, and `individual-counselling`. Older comments saying there are five categories and legacy static slugs are not authoritative.
- Use assets in `public/` via root-relative URLs. `public/team/` holds portraits and office images; `public/intro/` holds intro videos. `IntroOverlay.js` contains playback, fallback and dismissal logic; inspect that before changing intro assets.

## Local development and verification

Run npm commands from the root. The npm lockfile is committed; Node is not pinned. Use a runtime compatible with the installed Next/Vitest versions.

| Command | Purpose / caveat |
| --- | --- |
| `npm install --legacy-peer-deps` | Documented dependency installation; Netlify also sets this peer-dependency flag. Do not change the lockfile incidentally. |
| `npx prisma generate` | Generate the Prisma client after installation/schema edits; does not synchronize the database. |
| `npm run dev` | Starts `next dev --webpack`. |
| `npm run build` | Runs `prisma generate && next build`; distinct from the database-mutating Netlify pipeline. Google font loading/build tooling may need network access. |
| `npm start` | Runs the previously built Next application. |
| `npm test` | Runs Vitest; database suites are conditional but mutate the database when enabled. |
| `npm test -- src/server/domain` | Focused pure domain tests. Other test files/directories can be supplied similarly. |
| `npx tsc --noEmit` | Type check; may require generated Prisma/Next types. No dedicated typecheck script exists. |
| `npx eslint .` | Direct invocation for the flat ESLint configuration. The existing `npm run lint` still points to the legacy `next lint` command; do not treat the script name alone as a validated lint check. |
| `npm run db:push` | Runs `prisma db push` against the configured database; this is a schema mutation. |

There is no committed `.env.example`. Configure the variables below locally; never commit secrets. Verify the database target before any write.

| Variables | Consumers |
| --- | --- |
| `DATABASE_URL`, `DIRECT_URL` | Prisma PostgreSQL connection and direct schema-management connection. |
| `NEXTAUTH_SECRET`, `ENCRYPTION_KEY` | Session/OAuth signing and encrypted stored data. |
| `PAYMENT_PROVIDER` | `manual` by default; `phonepe` selects online checkout. |
| `APP_BASE_URL`, `CRON_SECRET` | Payment redirects, Google OAuth callback URL and scheduled endpoint authentication. |
| `PHONEPE_CLIENT_ID`, `PHONEPE_CLIENT_SECRET`, `PHONEPE_CLIENT_VERSION`, `PHONEPE_ENV` | PhonePe credentials/version and sandbox/production selection. |
| `PHONEPE_WEBHOOK_USERNAME`, `PHONEPE_WEBHOOK_PASSWORD` | Webhook verification. |
| `PHONEPE_BASE_URL`, `PHONEPE_AUTH_BASE_URL` | Optional provider endpoint overrides, also used by adapter tests. |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Transactional email configuration. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Per-consultant Calendar OAuth; callback is `<APP_BASE_URL>/api/google-calendar/callback`. |
| `RUN_ADD_LAUNCH_CONSULTANTS` | Netlify flag enabling the launch-account script. |
| `SEED_PROFILE`, `RECEPTION_EMAIL`, `RECEPTION_PASSWORD`, `CONSULTANT_*_TEMP_PASSWORD` | Script-specific seed/account controls; inspect the selected script for exact names and defaults. |

`razorpay` and `twilio` are unused dependencies in current source. Gateways are manual/PhonePe; reminders use Resend. The README's WhatsApp reminders are not implemented; the website button is a contact link.

### Tests

`vitest.config.mts` uses Node, discovers `src/**/*.test.ts`, disables file parallelism for the shared integration database, and sets a 20-second timeout. Preserve its custom JSX-in-`.js` transform.

- `src/server/domain/__tests__/`: booking transitions, reception scope, commission arithmetic, postings, counselling types, working windows.
- `src/server/__tests__/clinicTime.test.ts`, `validation.test.ts`, `publicBookingPayment.test.ts`, `googleCalendarRecovery.test.ts`: time parsing, safe URL/CSV handling, strict public input, OAuth recovery state.
- `src/server/serializers/__tests__/publicBooking.test.ts`: public response fields and note stripping.
- `src/server/payments/__tests__/phonepeProvider.test.ts`: mocked provider transport, tokens, status/refund mapping, webhooks.
- `src/server/services/__tests__/googleCalendarService.test.ts`: calendar event title behavior; not a full live integration test.
- `src/lib/__tests__/`: JWT hardening, static content/roster and booking consultant presentation.
- `src/components/__tests__/bookingWizardServiceStep.test.ts`: server-rendered wizard/service/slot checks; not a browser E2E suite.
- Database-dependent suites are `integration.test.ts`, `paymentFlow.test.ts`, `payoutConcurrency.test.ts`, `reception.test.ts`, and `publicApiSecurity.test.ts` under `src/server/__tests__/`. They check `DATABASE_URL`, create/delete fixtures and call real services. Use a dedicated test PostgreSQL database with the current schema and keep real external integrations disabled/mocked. Skipped suites are not successful integration verification.

Run relevant tests and type/lint checks; build for routing/compilation changes and inspect desktop/mobile UI for interaction/layout changes. Documentation-only edits need path/content/whitespace checks. Report skipped checks and environment limitations.

## Database scripts and deployment

- `prisma/seed.js` deletes existing operational data before repopulating it. `seed-small.js` and `seed-90-days.js` select profiles of that same destructive seed. `seed-fresh.js` also clears data. **None is a harmless setup command against a populated database.** Run them only for an intended reset/disposable database within the task's scope; never as routine verification.
- Catalogue/maintenance scripts include `fix-service-catalogue.js`, `fix-service-details.js`, `set-service-availability.js`, `remove-service.js`, `fix-madhumati-fee.js`, `fix-commission-default.js`, `fix-photos.js`, and `backfill-client-age.js` in `prisma/`. Read the exact script before running it; names/comments can understate the fields affected.
- Account/roster scripts include `add-public-consultants.js`, `add-launch-consultants.js`, `create-receptionist.js`, `update-login-emails.js`, and `reset-consultant-passwords.js`. `add-public-consultants` creates profiles without logins and may enforce service restrictions on existing profiles. Seed/demo credentials are not evidence of production credentials.
- No migration history is checked in. Current schema deployment uses `prisma db push`; assess data compatibility before changing schema or deployment strategy.
- **Netlify deployment changes data before building.** `netlify.toml` runs client generation, schema push, `fix-madhumati-fee.js`, service-availability synchronization, public-consultant synchronization, optionally launch-consultant creation, then `npm run build`. The fee script also updates a linked login email and selected service prices; availability sync sets active services to both Online and Offline. Account for these repeated writes when changing pricing, catalogue, roster or admin behavior.
- The Netlify Next plugin publishes `.next`. The README's Vercel instructions do not reproduce the Netlify scheduled jobs or data scripts automatically.

## Where to start for common changes

| Change | Trace these locations together |
| --- | --- |
| Public copy, contacts, policies | Relevant `src/app/` page, `src/lib/site.ts`, header/footer, legal layout; policy enforcement in booking routes/services. |
| Consultant biography, photo, ordering | `src/lib/team-data.ts`, `src/lib/booking-consultants.ts`, `public/team/`, operational roster/scripts and consultant APIs. |
| Service catalogue or fees | Prisma `Service`/`TherapistServiceRate`, `domain/counselingType.ts`, admin consultant routes/UI, public service pages, deployment data scripts. |
| Slot availability, leave, overtime | `domain/workingHours.ts`, `clinicTime.ts`, `bookingService.ts`, available-slots/consultant-leaves routes, staff scheduling components. |
| Booking form or lifecycle | `BookingWizard.js`, public/admin/reception/therapist route schemas as applicable, `bookingService.ts`, state-machine/scope rules, serializer. |
| Payment, refund, invoice | Provider adapter/registry, `paymentService.ts`, `paymentStatusService.ts`, webhook/cron routes, status page, postings and concurrency tests. |
| Dashboard metrics or payouts | `analyticsService.ts`, `ledgerService.ts`, `payoutService.ts`, `dateRange.ts`, relevant API, `components/admin/charts.tsx`. |
| Login, role or permission | `lib/auth.js`, `proxy.ts`, `server/http.ts`, auth route, panel layout, guarded API and ownership checks. |
| Calendar or email | Google connect/callback routes, Calendar/email services, booking/payment side effects, Netlify cron functions. |
| Internship applications | Form, `/api/internship`, Prisma model, admin application list/status/resume routes. |

Check `git status` and preserve unrelated work. Match existing language/style; avoid broad conversion/formatting changes. Preserve awaited Next `params`/`searchParams`. Update all affected UI, validation, domain, persistence and documentation layers.


## Campaign and free-call changes

- `src/components/MarketingAnalytics.tsx` loads a configured `NEXT_PUBLIC_GTM_ID` only after analytics consent. `BookingConversion.tsx` emits confirmed booking events; click and submission events must never include names or clinical details. The footer reopens cookie preferences. `MARKETING_HANDOFF.md` records configuration, privacy, copy and launch checks.
- `prisma/setup-free-call.js` provisions the 15-minute free-call service; the Netlify build runs it after schema push and roster sync. First creation connects currently approved active consultants; subsequent runs preserve service assignments. Booking treats that exact service slug as zero-fee and confirmed, with quarter-hour availability and the same overlap locks as other bookings. Referral and optional consented attribution fields are stored on Booking. Schema changes must reach the database before using these fields.
- Team and services fees are computed from active consultant/service rates (and consultant fee fallback), matching booking. Static biographies remain in `team-data.ts`; do not reintroduce its stale fee strings. Campaign pages are draft, noindex placeholders pending approved copy.

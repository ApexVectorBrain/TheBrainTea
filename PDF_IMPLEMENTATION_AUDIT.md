# Website findings: implementation audit

Compared against “The Brain Tea Website Findings and Developer Guide”, checked 12 November 2026. Status reflects the local working tree; it is not evidence of deployment or production behavior. Do not treat this list as approval to run ads.

## 01. Performance baseline

- Implemented: primary intro WebM reduced from 706,148 bytes to 99,279 bytes; MP4 fallback is 34,818 bytes. The booking wizard is imported only by `/book`; logo uses Next image optimization and the footer logo is lazy-loaded.
- Not verified: fresh Lighthouse scores, LCP, image savings, JavaScript/polyfill and CSS savings, network weight and real-device measurements. The PDF's numeric results are a historical baseline, not proof of current performance.

## 02. Search and indexing

- Implemented locally: non-www metadata base; individual canonicals for the homepage, public routes, and dynamic service pages; distinct titles/descriptions for the listed pages; route-specific public Open Graph URLs and a 1200×630 share image; robots.txt and sitemap; noindex for admin, reception, therapist and draft campaign pages; removed footer admin link; `/book?service=assessment` redirects to `/book`.
- Implemented: clinic JSON-LD; FAQ answers rendered in native disclosures and FAQPage JSON-LD; Google Meet wording replaces the HIPAA claim; navigation points to `/team` and About uses shorter profile cards.
- Still needed: verify rendered metadata/canonicals and noindex on the deployed review environment and in Search Console; submit sitemap, inspect and request removal/recrawling as appropriate. Clinic must verify name, map coordinates, street address and hours. Search snippets and structured data do not guarantee a search result appearance.

## 03. Intro and speed

- Implemented: intro only runs on homepage, bypasses query parameters beginning `utm_` and `gclid`/`fbclid`, uses localStorage for seen state, respects reduced motion, removes the hidden-focusable mismatch, uses an optimized WebM with MP4 fallback and poster/preload settings.
- Still needed: Safari/iOS and other real-device playback and visual QA; remeasure mobile LCP, logo/image sizing, unused JS and CSS. Do not claim the PDF performance targets have been achieved without measurement.

## 04. Booking flow and prices

- Implemented in code: zero-fee 15-minute service setup, quarter-hour starts and existing overlap/leave constraints, no gateway for a free call, optional emergency contact, referral source plus doctor name, consent-dependent campaign attribution storage, clearer inputs, consultant summaries with expandable biography, help-choosing link, service starting price, no floating WhatsApp button on `/book`.
- Implemented: team and services fees derive from approved active consultants' per-service rates and default fees, as does the booking flow; historical booking snapshots are not rewritten.
- Still needed: staging PostgreSQL schema and free-call service provisioning; end-to-end tests of reservations, concurrent overlapping slots, payment and refunds, scheduling, email and calendar. Determine which consultants actually offer free calls. The child/teen counselling service has not been added as an active bookable service: age range, clinical suitability, guardian consent, participating practitioners and price need clinic confirmation. The emergency-contact intake procedure needs clinic confirmation. Test prices against configured staging data; do not interpret hard-coded roster fees as actual live database values.

## 05–06. Mobile and accessibility

- Implemented: homepage first-screen booking/WhatsApp actions, shorter mobile service imagery and fewer testimonials, extra WhatsApp link, larger home/team/about labels, larger tap targets, darker primary colors, visible keyboard focus and reduced-motion support; mobile menu has expanded state, close button, Escape handling and focus return; booking selection uses radio controls, labels, slot state and an error alert.
- Verified locally: mobile homepage/About preview, menu opens/closes and focus returns; selected source and focused test coverage. This is not a complete WCAG conformance audit. Still needed: test booking and all responsive screens with real data and keyboard/screen readers; measure all contrast combinations and layouts at relevant sizes, and run Lighthouse/accessibility tooling. Some components outside the checked pages can still contain small or low-contrast text.

## 07. Tracking

- Implemented: optional consent interface and preferences control, GTM environment setting with consent-gated loading, events for booking start/submission/confirmed and phone/WhatsApp clicks, referral source and opt-in campaign fields.
- Still needed: actual GTM container ID, Meta domain verification value, approved tag configuration and external verification. No separate doctor/HR referral form exists, so `referral_submitted` for such a form is not implemented. Click event `location` is currently `site`, not the distinct hero/floating/footer values in the PDF. Verify consent, attribution, conversion deduplication and privacy of booking IDs. Click IDs are captured only if consent is given while the URL containing them is still open.

## 08. Campaign pages

- Five routes exist as noindex drafts with generic content. They do not yet contain the PDF's complete audience-specific sections, approved copy, 2–3 verified practitioners and fees, specific FAQ content/schema, or confirmed mobile speed targets. The draft pages use the regular footer. Marketing must supply/approve copy and clinician/service claims before finalization, indexing or advertising.

## 09. Consistency

- Implemented: public footer, site constants and contact text updated to the report's Sakal Nagar address; About no longer advertises unconfirmed psychiatry, yoga or Reiki and no longer calls all practitioners licensed; team details and pricing are separated from static biographies.
- Still needed: clinic confirmation of its exact legal/merchant name and Google Maps address, pin and hours; verify qualifications, registrations, languages and actual services. Some biographies lack verified languages/fees and fee display depends on active database associations; do not invent these facts.

## 10. Deployment and approval

The PDF calls items 1–7 before ads; this is a launch plan, not evidence that the changes are complete or that they must be implemented in the printed order. `MARKETING_HANDOFF.md` lists page paths, information to obtain and staging checks. Netlify's existing build pipeline executes `prisma db push` and data-changing scripts; never point a review deployment at production credentials. A separate staging database and sandbox integrations are needed for functional review.

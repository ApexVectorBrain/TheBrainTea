# Launch checklist — attention needed today

Updated 20 November 2026. This document contains only unfinished work.
The full release is not live yet. Complete changes one at a time, check each,
then publish one final release. Keep all work on `feat/november-website-review`
until the owner authorizes merging and deployment.

## 1. What you need from Madhumati now

Send these questions together so the remaining content can be finished today:

- Please confirm the languages spoken by Ananya Sunil Nair, Ananya Saxena,
  Sharayu, Gauri, Krutika and Shwetha. Only Madhumati's languages are currently
  populated in the team data.
- The PDF already supplies these practitioner suggestions. Ask Madhumati only
  to confirm or correct them, as the PDF requests:
  - Anxiety: Shwetha Jayakrishnan, Sharayu Harpale, Krutika A. Sonigra, Gauri Ghorpade.
  - Couples/marriage: Krutika A. Sonigra, Gauri Ghorpade, Madhumati Dhumak.
  - Children/teenagers: Madhumati Dhumak (adolescents); confirm any others and the youngest age accepted.
  - Online: all seven psychologists.
  - Career/academic: the PDF explicitly leaves the lead practitioner for the clinic to confirm.
- Please confirm who offers the free discovery call and that their schedules
  are ready to receive bookings.
- Please confirm the parent/guardian checkbox wording:
  “I am the parent or legal guardian and consent to this booking for the child.”
  Confirm how emergency-contact details will be collected during intake.
- December workshops are listed as every weekend in December 2026, as the owner
  confirmed. Exact dates/times, fees and seat counts can be added when available;
  WhatsApp enquiries cover these details for now. Do not request the workshop
  concepts again. For letter writing, arrange consented postal-address collection
  with the clinic and mailing in mid-2027; no address should enter analytics.

## 2. What you need to arrange with marketing / the domain administrator

- **Google DNS verification:** ask whoever manages DNS for `thebraintea.co.in`
  to add the following TXT record. Keep existing TXT records.
  - Host/name: `@` (or the DNS provider's root-domain format).
  - Value: `google-site-verification=xbrrefTpMHx5zfSvyXQ1j_yUGACMRU9s2QyBFY8DWDY`
  - After DNS propagation, marketing must complete verification in Search Console.
- **GTM:** marketing must configure and publish the actual analytics/advertising
  tags in the supplied container. Adding the container ID to the website does
  not configure conversions by itself.
- Agree whether the pseudonymous `booking_id` is permitted in the tags. Never
  send client/guardian names, ages, phones, psychologist names or booking-reason
  text. Check that automatic tags do not collect sensitive booking URLs or fields.
- After all website changes are complete, use GTM Preview to check consent and
  the events below. No website review is requested before completion.

| Event | Meaning / required fields |
| --- | --- |
| `discovery_call_booked` | Confirmed free call; `booking_id` |
| `booking_started` | Service selected; `service` |
| `booking_confirmed` | Confirmed paid session; `booking_id`, `value` in rupees, `currency: INR`, `service` |
| `whatsapp_click` | WhatsApp link; `position` |
| `phone_click` | Phone link; `position` |
| `workshop_interest` | Workshop WhatsApp link; `workshop_name` |

Marketing should configure the four main advertising results:
`discovery_call_booked`, `booking_confirmed`, `whatsapp_click`, and `phone_click`.
Do not use pending requests / `booking_submitted` as confirmed conversions.
Browser booking conversions require a visit to the confirmation page.

## 3. Developer work before going live

- Insert Madhumati's remaining languages, confirmed campaign practitioner assignments
  and any corrected consent wording. FAQ answers are supplied; do not request them again.
- Check the new workshop cards and all 15 supplied campaign FAQ answers on mobile
  and desktop, including the conditional international-card payment wording.
  Marketing/clinic should verify international card support on the merchant account
  before advertising it; supplied copy is not a live gateway acceptance test.
- Commit and push the new FAQ/workshop changes to the feature branch when requested.
  Marketing-ID and fee changes were already pushed on 17 November.
- Run final desktop/mobile checks after the content is complete, including
  390 px and 1440 px layouts, keyboard use, contrast and loading performance.
- On a separate test database, verify free and paid bookings, under-18 guardian
  validation, availability/overlap/leave rules, cancellation, payment status,
  email and Google Calendar behavior. Local unit tests do not replace these checks.
- Verify no GTM loading/events before consent; accepting, declining and delayed
  consent; attribution/referral capture; event payloads and duplicate conversions.
- Verify the intended production database and take a backup before deployment.
  Netlify applies the additive schema and catalogue/fee scripts before building.
  Its fee sync updates existing paid-service overrides as well as consultant fees;
  confirm the resulting team/services/booking prices. Never run destructive seeds.
- After all content is complete, set `PUBLIC_MARKETING_LAUNCH_READY=true` only
  for the production deployment. Keep previews non-indexable. This enables
  campaign/workshop indexing and their sitemap inclusion.
- Once the work is complete, provide the finished site for the owner's final
  walkthrough and obtain authorization to merge/deploy. Do not create a pull
  request unless the owner asks for one.

## 4. Immediately after deployment

- Confirm the live homepage contains the Meta verification tag, then tell
  marketing it is live so they can verify the domain in Meta Business Settings.
- Confirm the supplied GTM container loads only with consent and that the
  published conversion tags fire correctly on the live domain.
- Check live fees on team, services and booking; complete a controlled booking
  smoke test and check the confirmation, email and calendar result.
- Check live canonicals, public indexing, `/robots.txt` and `/sitemap.xml`.
  Marketing should submit the sitemap and inspect URLs in Search Console.
- Check workshop enquiries, WhatsApp/phone links, and all five campaign CTAs.
- Start ads after the live booking and tracking checks pass.

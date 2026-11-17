# Launch checklist — attention needed today

Updated 17 November 2026. This document contains only unfinished work.
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
- Please let me know the details about the December workshop.

### Campaign answers still needed

The PDF supplies all campaign headlines, supporting lines, audiences, shared
steps, buttons, practitioner suggestions and FAQ questions; do not request those
again. It supplies only one explicit FAQ answer (session count). The table below
lists unanswered questions, not a request to rewrite the campaign copy. Reuse
existing clinic FAQ content where it directly answers a question (first session,
online availability and Google Meet); ask Madhumati only about remaining gaps.

| Page | Answers needed from Madhumati |
| --- | --- |
| Anxiety | No new copy request: use the existing clinic first-session/online answers and the PDF session-count answer. |
| Couples/marriage | What if a partner is unsure about coming? Do you take sides? Are pre-marital sessions offered? |
| Children/teenagers | What is shared with parents and what stays private? Does a parent attend the first session? Can sessions fit around exams? |
| Online | Use the existing Google Meet answer. How should effectiveness compared with in-person sessions be explained? Can clients pay from outside India? Confirm which countries the clinic can serve; the PDF already specifies English, Hindi and Marathi for the service overall. Per-practitioner languages are still needed. |
| Career/academic | Are aptitude tests offered? Can parents join? Are sessions in person, online, or both? |

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

- Insert Madhumati's languages, campaign practitioner assignments, FAQ answers
  and any corrected consent wording. Add confirmed workshops to
  `src/lib/workshops.ts`; the page currently has no workshop entries.
- Commit and push the latest marketing-ID, fee and content changes to the
  feature branch. The latest ID/fee changes are currently local only.
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

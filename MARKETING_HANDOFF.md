# Marketing and launch handoff

The advertising team supplies `NEXT_PUBLIC_GTM_ID` (format `GTM-XXXXXXX`), Meta domain-verification code, approved campaign copy, clinician registration and languages, and a 1200 x 630 share image. Do not use example IDs or unverified qualifications. Set public environment variables in the hosting provider and redeploy; never put secrets into public variables. GTM is not loaded until visitors accept optional analytics cookies. Coordinate tag consent behavior and confirm no names, phones, therapist names, health concerns or other sensitive data are sent. The booking UUID is a pseudonymous identifier: review its use with the privacy lead before enabling tags.

1. Apply the additive Prisma schema to a staging database (`npx prisma db push`), then run `node prisma/setup-free-call.js`. On first creation this script attaches active approved consultants to the free call; review participation and schedules before launch. Later runs preserve the service offering assignments, so add or remove consultants through the admin portal. Netlify currently runs this script at each deploy. Verify a free call reserves a 15-minute slot, cannot overlap a paid session or leave, generates the correct notifications and never opens checkout. Confirm cancellation, email, and calendar behavior with the clinic. Do not seed or reset a populated database.
2. Confirm the database prices and per-service consultant overrides in the admin portal. Team, services and booking read the same live rates; check each service and consultant on staging.
3. Set `NEXT_PUBLIC_GTM_ID` only after the marketing team provides its real container ID. In GTM Preview verify analytics is absent before consent and that accepting consent enables it. Check `booking_started`, `booking_submitted` (a request, not a confirmed payment), `booking_confirmed` (confirmed free call), `whatsapp_click` and `phone_click`. Paid gateway confirmations are emitted on the confirmation page after the booking is marked paid and confirmed; verify redirect, return and deduplication behavior before optimizing ads. Do not treat a pending request as a paid conversion. Test declined consent and browser storage restrictions. Attribution parameters are captured only after consent and only from the current landing URL; ask marketing to validate attribution reporting.
4. The five campaign routes are draft placeholders with noindex, not approved final landing pages. Obtain and review approved copy, practitioner matches, qualifications, fees, photos, FAQ and destination links. Complete the requested ad-page structure and remove noindex only after approval, then add to the sitemap and test mobile performance, metadata and booking links. Confirm the free-call service is enabled before using those links.
5. Obtain the Meta verification value, set `META_DOMAIN_VERIFICATION` in the hosting environment and redeploy; verify in Meta Business Settings. Never expose account access tokens in browser code.
6. Confirm the address, hours and Google Maps listing with the clinic. Confirm practitioner registration, languages, and service offerings before publishing claims. Update `src/lib/team-data.ts` and coordinate existing database roster records, keeping prices in the database.
7. In Search Console, verify the domain, submit `/sitemap.xml`, inspect the canonical URLs and request recrawls. Confirm the admin login has noindex and remains crawlable. The URL-removal tool is temporary and should not replace noindex. Validate structured data, social previews and final landing pages after deployment.
8. Use a staging environment for the full mobile booking, consent, cancellation, payment, calendar and email checks; run Lighthouse and accessibility checks. Confirm tracking, campaign copy, price and clinic approval before ads go live. Verify production after deployment.

The guide proposed a 15-minute-call service and moving emergency contact collection to intake; confirm the clinic's intake workflow covers that information. Do not turn on ads until the clinic has confirmed operational capacity and the free-call workflow is tested with its calendar provider.

## Material to send for review

Send marketing a staging link and request approval for:

- The five draft ad routes, proposed copy, calls to action, mobile layout and proposed target audiences. They remain `noindex` and require approved copy before launch.
- The 1200 × 630 share image at `public/social-share.jpg`, page titles/descriptions, canonical URLs, structured data, and how Google and social previews will appear.
- The analytics event names and definitions, consent behavior, whether a pseudonymous booking ID should be transmitted, click attribution, and the real GTM container ID. Request the Meta domain verification value.
- Current booking/fee presentation and the introductory-call messaging. Agree how marketing will verify conversions in GTM Preview and Search Console.

Separately, the clinic should confirm its address/hours/map location, practitioner credentials and languages, live prices, available services and age ranges, and who offers the free call. Confirm the emergency-contact intake process and the policy for minors before launching a child/teen service. Those are operational/clinical facts and should not be inferred from marketing copy.

The site contains preliminary mobile and keyboard improvements and an optimized intro, but a fresh Lighthouse, contrast and real-device accessibility review must be performed on staging before advertising. Provide the team the resulting report as well as the staging link.

## Pages to send for approval

Send the team the staging-site origin followed by each path below. These pages must be reviewed on the staging deployment; they have not been published by this work.

- `/` — homepage, first-screen actions and introductory-call wording.
- `/about` — practice description and abbreviated practitioner cards.
- `/team` — practitioner details and database-driven fees.
- `/services` and each `/services/<slug>` — service descriptions, availability and starting fees.
- `/book` and `/book?service=free-15-minute-call` — booking flow, referral question, 15-minute call and confirmation.
- `/contact` and `/faq` — contact information, hours, location and answers.
- `/anxiety-counselling-pune`, `/couples-counselling-pune`, `/teen-counselling-pune`, `/online-counselling`, `/career-counselling-pune` — draft campaign pages. They are not approved copy and remain noindex.
- `/privacy`, `/terms` and `/refund-policy` — policy wording, consent and operational review.

Ask the clinic to approve clinical, privacy and operational claims. Ask marketing to approve campaign wording, audience, visuals, search snippets, tracking definitions and the share image, and supply the GTM container ID and Meta verification value. A staging walkthrough should cover phone and desktop sizes, payment and free-call confirmations, cancellation and consent choices before launch.

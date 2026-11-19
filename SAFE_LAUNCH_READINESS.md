# OficioRD — Safe Marketplace Launch Readiness (proposal only)

**Status: preparation, NOT authorization to launch.** Last reviewed: 2026-11-19.
All account registration, public postings, chat, offers, ratings, payments and public reports stay disabled in production. No production database migrations are authorized by this document. This roadmap does not certify legal compliance or security readiness.

## Separation of demonstration and production

- `/demo/`, `/demo/crear/`, `/demo/cliente/`, `/demo/profesional/` and `/demo/recorrido/` are fictitious, noindex, no-store previews. They must not fetch an endpoint or store personal data.
- AI illustration, fictional prices, service professionals, and messages must always be identified as examples. Never manufacture stars, endorsements, verified accounts or testimonials.
- Production account and public write gates must remain **off** by default. No implicit activation via changed configuration, login workflows, migration jobs, query flags or static UI.
- Developer checks read production gate source files but do not invoke real APIs, modify secrets or apply Cloudflare D1 production migrations.
- Public routes and mobile demos must not be interpreted as permission to accept user submissions. Server-side state transitions require separate authenticated authorization.

## Future review system: fairness and safety

1. **Eligibility:** Only an authenticated customer tied server-side to a genuinely completed job may review the assigned professional. Validate the relationship against original transaction records; do not trust caller-supplied provider/job IDs alone.
2. **One verified relationship, one review:** Atomic uniqueness on the job–customer–provider tuple. Do not allow reviews for cancelled, unassigned or merely simulated jobs. Prevent self-reviews and related-party manipulation.
3. **Moderation:** Queue all reviews before publication. Publish only after fraud/privacy checks. Keep documented moderation criteria and a contest/appeal process for both customer and professional.
4. **Privacy:** Remove personal addresses, phone numbers and defamatory/threatening content; collect the minimum necessary. Separate private evidence from public text, establish retention and deletion rules.
5. **No fake social proof:** Until production eligibility + moderation + abuse controls are actually implemented and audited, show **“Noch keine verifizierten Bewertungen”** (translated into all five supported languages) rather than blank or fabricated stars.
6. **Fairness:** Distinguish reviews about confirmed service experience from disputes. Preserve documented evidence for an appeal, and resist extortion in the rating process. Never imply that an individual profile is verified when it is only fictional.

A *reference-only*, unimported `scripts/prelaunch-review-policy.mjs` illustrates strict input normalization and conjunction-of-checks. It is not a deployed endpoint and never accepts production reviews.

## Future anti-spam and abuse requirements (not enabled)

- Strong identity/session verification, CSRF/origin checks and strict role- and ownership-scoped writes before any customer/provider mutation.
- Turnstile/bot resistance; fail closed without secrets/configuration; independent server-enforced IP and identity rate limits, not just a UI timer.
- Atomic server-side throttling and idempotency keys to prevent duplicate listings, proposals, reports, reviews and magic-link redemption under concurrent requests.
- Validate each incoming field, enforce payload size/length limits and attachment restrictions, and escape untrusted text; never render supplied HTML.
- Require reviewed report handling, abuse escalation, suspension, privacy controls and audit trail before making public reporting or messaging available.
- Establish incident response, backup/restore drills, monitoring thresholds and user support contact before production rollout.

## Current non-production safeguards

- HTML: skip-to-content keyboard links, visible focus, increased contrast-mode affordances, responsive controls and overflow handling on key demo and account pages.
- Response headers: demo-scoped no-store/no-referrer/noindex, account-scoped no-store and noindex; global nosniff, deny framing and denied sensitive permissions.
- CI: offline tests for five-language journey, demo catalog/price consistency, review policy reference and production write gate invariants. **These are not a substitute** for WCAG audit, browser/device testing, security penetration testing or a legal review.

## Explicit production launch blockers

Do **not** turn on any write flags or account functionality, provision paid services, or apply D1 production migrations without a separate user authorization and staged readiness review. Stage a test deployment first, assess privacy and Dominican Republic law with qualified counsel, configure required credentials securely, audit permission enforcement and tests on real D1, test accessibility on actual iOS/Android devices, and document operational support. A marketing/demo page alone is not a production-ready marketplace.

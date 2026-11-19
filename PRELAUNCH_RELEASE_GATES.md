# OficioRD — Pre-launch release gate checklist

**Status: NOT RELEASE-READY / PRODUCTION LOCKED (2026-11-19).**
This page records the preparatory work and blockers; it does not authorize a launch, activate a flag, establish legal compliance, or apply migrations.

## Already implemented or checked in the repository

- [x] All five-language demo views remain **fictional**, on separate `/demo/` pages with noindex/no-store headers.
- [x] Customer and professional synthetic job/offer catalogs use the same IDs and deterministic matching; no backend writes.
- [x] Server-side helper tests reject wrong account roles, foreign job/profile ownership, and cross-origin mutation requests.
- [x] Automated no-login / no-API-write-gate checks cover seven disabled entry points; no secrets or live data are used.
- [x] Keyboard skip links, focus indicators, responsive CSS and reduced-motion support exist for primary demos.
- [x] Example profiles do not impersonate real reviewers and cannot produce genuine ratings.
- [x] GitHub CI runs synthetic SQL, security and UI consistency regressions.
- [x] GitHub CI now runs an **actual headless Chromium browser** via the runner's preinstalled Chrome and a local static server: 320/390/768/1280px responsive smoke checks, five UI languages, role transitions, sample quotes and basic keyboard navigation. This is browser viewport emulation, **not real iPhone/Android device testing**.

## Must remain **BLOCKED** before launch

- [ ] **Written, explicit authorization** for any real account, listing, proposal, messaging, review or reporting feature.
- [ ] Authorized legal and privacy review for the Dominican Republic, consumer/provider terms, retention/deletion, minors and dispute handling.
- [ ] Full server-side write authorization scoped to current authenticated role **and** exact job/provider ownership, with review of every mutation and session/CSRF behavior.
- [ ] Independent multi-user end-to-end test on **isolated local/staging D1** with real concurrent transaction semantics and rollback. **No production D1 migration.**
- [ ] Rate limits enforced transactionally, anti-spam Turnstile with securely provisioned credentials, abuse moderation capacity, audit evidence and appeals.
- [ ] Real review eligibility tied to completed jobs, one-review uniqueness, no fake stars, privacy redaction and moderation before public display.
- [ ] Browser and actual-device checks on iOS Safari and Android Chrome, at 320px/375px/768px/desktop, 200% zoom, screen reader and keyboard-only flows. Automated CSS checks alone do not prove WCAG compliance.
- [ ] Accessibility, information security and privacy review including CSP, XSS, injection, permissions and structured incident-response/backup procedures.
- [ ] Operational plan: moderation, support contact, complaints, abuse response, maintenance and monitoring cost ceilings.
- [ ] Separate, reviewed production launch change with exact flag list, migration plan, rollback, staged approval, and explicit spend ceiling.

## Decision rule

**HOLD** while any blocker remains unchecked. The current GitHub test suite checks that demo behavior and write gates are still closed; it cannot claim that every future production risk has been solved. NEVER infer approval from a green GitHub check or a successful Cloudflare Pages deployment.

## Browser quality limitations and safety

- The Chrome suite serves the checked-out repository only on `127.0.0.1`; network interception rejects nonlocal resources and `/api/` calls. No Cloudflare credentials or production D1 access are used.
- On each relevant PR/push, the test uses the preinstalled runner Chrome, an ephemeral version-pinned `playwright-core` library (without downloading browsers) and an 8-minute job timeout. This uses existing GitHub Actions minutes; **it is not a promise of unlimited free CI quota**.
- Browser execution covers simulated narrow viewports and interactive journeys, but does not certify VoiceOver/TalkBack, physical device touch interactions, WCAG or production security.
- The shared demo state machine now independently rejects provider offer preparation from customer role, customer selection from provider role and repeated preparation/selection transitions.

## Changes in this package

- `scripts/check-marketplace-ownership-gates.mjs`: offline foreign-owner, role, origin and seven write-route gate checks.
- `scripts/check-launch-readiness.mjs`: checklist status integrity plus mobile markup/responsive CSS and demo isolation scans.
- `demo/startcheck/`: static five-language human-readable release gates; all production launch blockers marked unresolved.
- `.github/workflows/check-reporting.yml`: read-only CI; no production database migration or third-party paid services.

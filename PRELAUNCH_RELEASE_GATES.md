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

## Changes in this package

- `scripts/check-marketplace-ownership-gates.mjs`: offline foreign-owner, role, origin and seven write-route gate checks.
- `scripts/check-launch-readiness.mjs`: checklist status integrity plus mobile markup/responsive CSS and demo isolation scans.
- `demo/startcheck/`: static five-language human-readable release gates; all production launch blockers marked unresolved.
- `.github/workflows/check-reporting.yml`: read-only CI; no production database migration or third-party paid services.

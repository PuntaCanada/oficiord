# OficioRD – Lokaler Cloudflare-D1-Integrationstest

Diese Tests laufen **ausschließlich in GitHub Actions** mit einem lokalen Miniflare/Workers-`workerd`-Prozess und einer flüchtigen D1-Datenbank. Sie verwenden keinerlei Cloudflare-API-Zugang, keine echten Nutzerdaten und keine Produktionsdatenbank.

- `scripts/check-local-d1.mjs`: wendet die vorbereiteten SQL-Migrationen 0001–0007 auf eine neue lokale D1-Datenbank an und simuliert Einmal-Link-Einlösungen.
- Prüft sechs konkurrierende Anmeldeversuche mit exakt einem erlaubten Login, Replay-Sperre, einen Kunden, einen Handwerker, einen gesperrten Account, abgelaufene Links und Rücknahme eines absichtlich fehlgeschlagenen D1-Batches.
- `.github/workflows/check-local-d1.yml`: installiert Miniflare 4 kurzzeitig auf dem GitHub-Runner; kein neues dauerhaftes Hosting oder Konto nötig.
- Code unter `functions/_lib/atomic-login.js` wird **nicht** von produktiven Anmelde-APIs aufgerufen. Öffentliche Registrierung, Angebote, Aufträge und Meldungen bleiben ausdrücklich geschlossen.
- Wenn der lokale Test besteht, ist damit **noch kein echter E-Mail-Login freigegeben**. Fehlend: vertrauenswürdiger E-Mail-Zusteller, echte Authentifizierung und Endpoint-Schutz, Turnstile, Missbrauchsschutz, Datenschutz und Cloudflare-Production-Rollout.

Cloudflare-Dokumentation: https://developers.cloudflare.com/workers/testing/miniflare/storage/d1/

**Keinesfalls Migrationen 0003–0007 in Production ausführen, bevor ein gesonderter Sicherheits- und Datenschutzcheck abgeschlossen ist.**

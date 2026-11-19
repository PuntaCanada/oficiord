# OficioRD – E-Mail-Link-Anmeldung und persönliche Bereiche (noch gesperrt)

## Aktueller Stand
- **Öffentliche Registrierung, Magic-Link-Versand und Einmal-Link-Einlösung bleiben deaktiviert** (HTTP 503). Es gibt keinen Live-Sitzungsaussteller.
- `/account/`: fünfsprachige Vorschau für Kunden / Handwerker mit ausschließlich erfundenen Daten und **ohne API-Aufrufe**.
- `/account/verify/`: abgeschlossene Hinweisseite, verbraucht keinen Token; ein vorhandenes URL-Fragment wird entfernt.
- `/api/account/dashboard`: der serverseitige nur-lesen-Entwurf liefert vor Aktivierung HTTP 503; danach nur kontoeigene Daten über Session-Prüfung, keine vom Client gelieferten Benutzer-IDs; alle Schreibmethoden 503.
- `functions/_lib/magic-link.js` bereitet CSPRNG-Token, SHA-256-Tokenhash, 10-Minuten-Ablaufdauer und sichere Cookie-Attribute vor.
- `migrations/0005_magic_links.sql` definiert Einmal-Token- und Pseudonym-Rate-Limit-Tabellen; **noch nicht in D1 Production ausführen**.
- `0003_marketplace.sql`, `0004_accounts.sql`, `0005_magic_links.sql` sind aufeinander aufbauende Zukunftsmigrationen.

## Sicherheit vor echter Aktivierung
1. Gültigen, vertrauenswürdigen Absender und E-Mail-Zusteller ohne unerwartete laufende Gebühren auswählen; Zustellung/Rate Limits verifizieren.
2. Anforderung nur mit Turnstile + Rate-Limits; für existierende/unbekannte E-Mail immer identische Antwort (Anti-Enumeration).
3. Einmal-Link in D1 **atomar** verbrauchen (nur unused, nicht abgelaufen), Token im Browser vor Analytics/weiterer Navigation aus der URL entfernen.
4. Nach E-Mail-Verifikation eine neue Session mit zufälligem Token erstellen, ausschließlich Hash speichern, Secure/HttpOnly/SameSite-`__Host-`-Cookie setzen, Sessions rotieren und widerrufen.
5. Login und Konto-Erstellung müssen Rollenwechsel, Sperren, E-Mail-Wechsel, Konto-Löschung, CSRF, Wiederholung, Parallelzugriffe und Zustellmissbrauch sicher behandeln.
6. Datenschutz, Verantwortlichenkontakt, Aufbewahrung/Löschung und Nutzerbedingungen fertigstellen.
7. Rollen- und Eigentumsregeln mit echten kontrollierten Integrations- und End-to-End-Tests prüfen, bevor Profile/Aufträge/Angebote freigeschaltet werden.

**Nicht setzen:** `ACCOUNTS_ENABLED`, `SUBMISSIONS_ENABLED`, `REPORTS_ENABLED`, `MARKETPLACE_READS_ENABLED`.
**Keine Cloudflare-Migration oder kostenpflichtige Integration für die Vorschau erforderlich.**

# OficioRD – Datenschutzrechte und Sitzungsübersicht (Vorbereitung)

**Nicht aktiv:** Echte Konten, Registrierung, Anmeldelinks, Aufträge, Angebote, öffentliche Meldungen und Löschaufträge bleiben geschlossen.

## Technische Vorbereitung
- `/api/account/export`: zukünftiger, kontoeigener JSON-Datenexport, nur mit verifizierter Sitzung und ausdrücklicher Freigabe von `ACCOUNTS_ENABLED` nutzbar. Keine frei wählbare Benutzer-ID. Es werden keine fremden Kontaktdaten mitausgegeben.
- `/api/account/sessions`: ausschließlich Metadaten der eigenen Sitzungen (Zeitpunkte/Status), niemals Session-Tokens oder Token-Hashes. Widerruf bleibt bis zur Authentifizierungsfreigabe gesperrt.
- `/api/account/privacy`: Anfragen zur Löschung, Berichtigung oder Auskunft noch immer pauschal HTTP 503; keine neuen realen Personendaten werden gespeichert.
- `migrations/0006_privacy_requests.sql`: ein späterer Status-/Prüfprozess für Datenschutzanfragen, noch nicht in Cloudflare D1 angewendet. **Kein automatisches Löschen** oder Versenden.
- Konten- und Sicherheitsdaten dürfen nicht öffentlich indexiert, geloggt oder im Browser gespeichert werden.

## Noch erforderlich vor echtem Betrieb
1. Tatsächlich Verantwortlichen, Kontaktadresse, Dienstleister, Datenarten, Zwecke, Speicherfristen und Rechtsgrundlagen klären und rechtlich prüfen.
2. Verifizierbares Verfahren für Auskunft, Berichtigung, Löschung und Widerspruch mit Ausnahmeprüfung und sicheren Identitätsnachweisen.
3. Vollständigen Export über weitere Datenkategorien (z. B. Meldungen und spätere Nachrichten) und echte Datenschutz-/Lösch-Tests ergänzen.
4. Session-Verwaltung inklusive Rotation/Widerruf, CSRF-Schutz, sichere Mailzustellung, Rate Limits und E2E-Tests.
5. Vor echter Freigabe: Hosting-/Dienstleister-Datenschutzbedingungen und rechtlich notwendige Seiten veröffentlichen.

**Migrationen:** `0003` → `0004` → `0005` → `0006` erst nach gemeinsamer technischen/rechtlichen Freigabe ausführen. Alle aktuellen Featureflags bleiben aus.

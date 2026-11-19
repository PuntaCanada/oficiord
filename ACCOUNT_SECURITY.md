# OficioRD – Basis für Kunden- und Dienstleisterkonten

## Sicherheitsstatus
Das Kontenschema und die Sitzungsprüfung sind vorbereitet. **Es gibt keinen Registrierungs- oder Login-Endpunkt, der echte Konten anlegt oder Sitzungen ausstellt.** Es ist nicht möglich, den vorbereiteten Authentifizierungsdienst durch ein Passwort in der URL oder eine bloße E-Mail-Adresse zu umgehen.

- Migration: `migrations/0004_accounts.sql` (nach 0003, noch NICHT in Production ausführen).
- Öffentliche Login/Registrierung: dauerhaft HTTP 503 (noch keine Freigabeoption).
- Konto-Selbstabfrage `/api/account/me`: HTTP 503, solange `ACCOUNTS_ENABLED` nicht gesetzt ist. Danach nur für aktive und E-Mail-verifizierte Konten mit gültiger Sitzung.
- Accountrollen: `customer` oder `provider`; Admin-Moderation bleibt separat mit eigenem Schlüssel.
- Opaque Session: 32 zufällige Bytes als 64 Hexzeichen, D1 speichert nur den SHA-256-Hash, erwartet spätere Cookies mit `Secure`, `HttpOnly`, `SameSite=Lax/Strict`, `Path=/` und `__Host-`-Präfix.
- Serverseitiger Besitznachweis: Ein Kunde kann nur seine eigenen Aufträge verwalten, ein Dienstleister nur das ihm zugeordnete Profil. **Diese Regeln sind vorbereitet, aber es sind noch keine editierbaren Kunden-API-Routen aktiv.**
- Kein Zugriff auf die Kontaktinformationen fremder Nutzer, nur Daten des eigenen Kontos.
- Sicherheitsnachweis: Tests für ungültige, abgelaufene, widerrufene oder nicht verifizierte Sitzungen, Rollentrennung und Besitz.

## Unbedingt vor öffentlichem Login
1. Authentifizierungsverfahren festlegen: z.B. E-Mail-Magic-Link mit eindeutigem, kurz gültigem, einmalig verwendbarem Token und vertrauenswürdigem E-Mail-Anbieter. Keine Eigenentwicklung von Passwortspeicherung.
2. E-Mail-Zustellung, Rate-Limiting, Botabwehr und Token-Verbrauch serverseitig gegen Missbrauch schützen.
3. Sitzungsrotation, Abmeldung, Geräte-/Sitzungsübersicht, CSRF-Schutz und vollständige Berechtigungstests ergänzen.
4. Datenschutz, Einwilligung, Löschung, Aufbewahrung, Identitätswechsel, Kontowiederherstellung und Nutzungsbedingungen juristisch prüfen.
5. Migrationen 0003 + 0004 erst nach Sicherheitsprüfung in Cloudflare D1 anwenden.
6. **`ACCOUNTS_ENABLED` jetzt nicht hinzufügen.** `SUBMISSIONS_ENABLED`, `REPORTS_ENABLED` und `MARKETPLACE_READS_ENABLED` bleiben weiterhin deaktiviert.

## Test- und Kostenhinweise
Die Tests nutzen ausschließlich frei erfundene Testdatensätze in flüchtiger SQLite-Datenbank und lokale Node.js-Mocks. Keine echte Nutzerregistrierung, keine Mailversendung und keine neue kostenpflichtige Infrastruktur.

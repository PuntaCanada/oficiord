# OficioRD – atomare E-Mail-Link-Einlösung (noch nicht aktiv)

**Sperrstatus:** Alle öffentlichen Anmeldungen, E-Mail-Zustellungen, Registrierungen, Nutzeränderungen, Aufträge, Angebote und Meldungen bleiben deaktiviert.

## Vorbereitung
- Migration `0007_login_redemptions.sql` ergänzt eine eindeutige Zuordnung von gehashtem Einmal-Link zu gehashtem Sitzungstoken.
- `functions/_lib/atomic-login.js` bereitet die Ausgabe eines Login-Cookies ausschließlich nach einer **D1 batch()-Transaktion** vor: einmalige Link-Reservierung, Session-Eintrag, verbrauchten Link markieren.
- D1 garantiert laut Dokumentation, dass Batch-Statements sequenziell in einer SQL-Transaktion laufen und bei Fehlern zurückgerollt werden: https://developers.cloudflare.com/d1/worker-api/d1-database/#batch
- Bei Replay, fehlender Verifizierung, Sperre, Ablauf oder Datenbankfehler wird kein Cookie zurückgegeben.
- `0007` ist **noch nicht** in der Produktions-Datenbank ausgeführt. Keine Cloudflare-Konfiguration erforderlich.
- Der öffentliche `/api/account/verify`-Endpunkt bleibt bewusst HTTP 503. Es wird kein Token konsumiert und keine Sitzung erstellt.

## Vor einer Freigabe
- End-to-End-Integration auf einer isolierten D1-Testdatenbank inklusive echter Parallelität und injizierter Batch-Fehler testen.
- Login-Token-Versand (Turnstile + Pseudonym-Ratenlimits + E-Mail-Identität und sichere generische Antworten) vollständig implementieren.
- Absenderdomain, Zustellung und zulässige Nutzerdatenverarbeitung rechtlich/technisch prüfen.
- Fehler- und Wiederherstellungsabläufe, Session Rotation, Logout und CSRF vollständig evaluieren.
- Database cleanup & retention für alte Login-Token/Redemptions/Sessions planen.
- Migrationen `0003` bis `0007` nur nach ausdrücklicher Freigabe und in Reihenfolge ausführen.

**Keine neue kostenpflichtige Infrastruktur und kein Produktionsdaten-Schreibzugriff.**

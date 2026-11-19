# OficioRD – Mehrfachanmeldung, Rollen- und Zugriffstests

Diese Tests sind eine **isolierte technische Vorbereitung**, keine Freigabe für echte Nutzer.

## Ergänzte Prüfungen

- `scripts/check-concurrent-login.py` erzeugt für die Dauer des Tests eine lokale SQLite-Datei mit erfundenen Nutzern. **Zwölf gleichzeitige Anmeldeversuche** konkurrieren um denselben Einmal-Link; nur genau ein Versuch darf eine Sitzung anlegen.
- Die Prüfung umfasst auch verbrauchte Links, abgelaufene Tokens und ein gesperrtes Konto. Es wird weder Cloudflare D1 Production noch ein E-Mail-Dienst aufgerufen.
- `scripts/check-dashboard-ownership.mjs` überprüft mit künstlichen Nutzern die Rollen `customer` und `provider`, die serverseitige Besitzerbindung und das Ignorieren manipuliert mitgesendeter Nutzer-IDs.
- Die Skripte sind in `scripts/check-reporting.py` und damit im GitHub-CI-Workflow integriert.

## Noch offen vor echtem Pilotbetrieb

- Eine isolierte Cloudflare-D1-Testdatenbank und Laufzeittests echter `D1Database.batch()`-Aufrufe, insbesondere Parallelität, Fehler während der Transaktion und Ausfallwiederherstellung.
- E-Mail-Versand und vollständiger sicherer Start-/Ende-Login, Missbrauchsbegrenzung, CSRF-/Session-Schutz, datenschutzkonforme Kontolöschung und echte Berechtigungstests.
- Rechtliche Prüfung, Betreiberangaben und transparente Datenverarbeitung.
- Alle öffentlichen Registrierungen, Aufträge, Angebote, öffentlichen Meldungen und Login-Endpunkte bleiben geschlossen.

**Keine weiteren Migrationen in Production ausführen. Keine kostenpflichtigen Dienste einrichten.**

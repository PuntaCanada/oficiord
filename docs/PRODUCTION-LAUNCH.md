# OficioRD – sicherer, kostenloser Start ohne Benutzerkonten

Stand: 20.11.2026. Dies ist eine **Freischaltungs-Checkliste**, keine Bestätigung einer erfolgten Cloudflare-Konfiguration. Keine produktiven Datenbanken, Variablen oder Nutzerinformationen werden durch GitHub-Commits automatisch eingerichtet.

## Bereits im Code vorbereitet

- Moderierte kostenlose Auftrags- und Dienstleistereinträge; standardmäßig `pending`, nicht direkt öffentlich.
- Öffentliche API gibt **niemals** die gespeicherten E-Mail-Adressen von Inserenten aus.
- Kontaktnachrichten gehen nach ausdrücklicher Einwilligung zunächst **ausschließlich an die private Moderationswarteschlange**, nicht direkt an den Anbieter.
- Im privaten Moderatorbereich `/admin/` erscheint die Ansicht **Contactos**. Betreiber prüft und leitet zulässige Nachrichten **manuell per E-Mail** weiter, erst dann können Anbieter antworten.
- Turnstile (Serverprüfung), IP-basierte HMAC-Ratenbegrenzung, Text-/Größenvalidierung, Origin-Kontrolle und privates Admin-Token.
- Keine Benutzerkonten, keine Bezahlfunktionen, keine automatische Vermittlung, keine garantierten Antwortzeiten, keine zusätzlichen Dienste.

**WICHTIG:** Die Plattform sendet derzeit **keine automatischen E-Mails** bei neuen Kontaktanfragen. Das private Panel muss regelmäßig geprüft werden, andernfalls bekommen Nutzer keine Antwort. Keine vermeintlich automatische Vermittlung versprechen.

## Vor einem produktiven Start zwingend manuell zu klären

- Verantwortlichen Betreiber mit zutreffendem Namen und erforderlicher **ladungsfähiger Anschrift**, geltenden Kontaktdaten und Land des Betriebs feststellen. Keine fiktive Anschrift eintragen.
- Rechtsberatung zu dominikanischem Datenschutz (Ley 172-13), Verbraucherrecht, Nutzungsbedingungen, Haftungs- und Plattformpflichten, ggf. anwendbaren deutschen/EU-Pflichten einholen.
- Verständliche, rechtlich geprüfte Datenschutzinformation vor realer Datenerhebung veröffentlichen: Verantwortlicher, Zweck, Rechtsgrundlage/Einwilligung, D1/Cloudflare als Anbieter, Übermittlung an Inserenten, Speicherfristen, Löschung und Betroffenenrechte, Kontaktweg. Checkboxes allein sind keine vollwertige Datenschutzerklärung.
- Verfahren für Rechteanfragen, Beschwerden, Abmahnungen, Betrugsmeldungen, Datenschutzvorfälle und die Prüfung eingehender Anzeigen festlegen.
- Moderator muss erreichbar sein und neue Anfragen regelmäßig kontrollieren. Keine externen Verträge, Vorauszahlungen, Zahlungsabwicklung oder Verifizierung durch OficioRD behaupten.
- Löschkonzept, Backups und angemessene Aufbewahrungszeiten definieren und umsetzen. Es gibt **noch keine automatische Aufbewahrungsfrist** für gespeicherte Kontaktanfragen oder Einträge.

**Nur wenn alle Punkte wirklich erfüllt sind**, darf `LEGAL_READINESS_CONFIRMED` ausdrücklich auf `true` gesetzt werden. Dieser Schalter ersetzt keine Rechtsprüfung.

## Cloudflare Pages: einmalige Konfiguration

1. Cloudflare Dashboard → **Workers & Pages** → Projekt **oficiord** → **Settings** → **Bindings**.
2. Vorhandene D1-Datenbank prüfen oder eine D1-Datenbank anlegen (Free-Kontingente und Limits überwachen). **D1 database binding** mit Variablennamen exakt `DB` verbinden, für **Production** (und separat Preview nur falls gewünscht). Danach neu deployen.
3. Im D1-Dashboard unter der richtigen **Produktivdatenbank** in SQL Console einmalig die Migrationen der Reihe nach ausführen:
   - `migrations/0001_init.sql`
   - `migrations/0002_reports.sql`
   - `migrations/0003_contact_requests.sql`
   Bevor Migrationen einer bereits genutzten Datenbank ausgeführt werden: Bestand/Backup prüfen, niemals unbesehen löschen.
4. Schema prüfen, z. B. `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`, es müssen `submissions`, `rate_limits`, `reports`, `report_rate_limits`, `contact_requests` und `contact_rate_limits` vorhanden sein.
5. **Turnstile**: kostenloses Widget erstellen und Domain `oficiord.pages.dev` eintragen. Öffentlichen Site-Key und geheimen Secret-Key getrennt bereithalten.
6. Cloudflare Pages → **Settings** → **Variables and Secrets** für **Production**:
   - `TURNSTILE_SITE_KEY` = öffentlicher Widget-Site-Key
   - `TURNSTILE_SECRET` = geheimer Schlüssel (**Secret**, nie GitHub oder Chat)
   - `MODERATION_ADMIN_KEY` = langer zufälliger geheimer Schlüssel (mindestens 32 Zeichen, **Secret**); für `/admin/` benötigt
   - `SUBMISSIONS_ENABLED` = zunächst `false`
   - `CONTACT_REQUESTS_ENABLED` = zunächst `false`
   - `REPORTS_ENABLED` = zunächst `false`
   - `LEGAL_READINESS_CONFIRMED` = zunächst `false`
   - `MARKETPLACE_LAUNCH_APPROVED` = zunächst `false`
7. Erneut deployen. In `/api/config` müssen **alle** öffentlichen Aktivierungsbooleans zunächst `false` sein. Die Antwort darf **keine geheimen Schlüssel** enthalten.

## Technische Abnahme – vor Freischaltung

- GitHub Actions: statische SEO-Audits, Browser- und mobile Chromium-Tests, bisherige Backend-Sicherheitsprüfungen und **OficioRD no-account contact and launch gates** grün.
- Funktionstest in **isolierter Preview-/Testumgebung** mit Testdaten: Einreichung mit Turnstile, `pending` nicht öffentlich, Freigabe via Moderatorpanel, öffentliche Anzeige ohne E-Mail, Kontaktanfrage mit Einwilligung, Eingang im privaten Panel, manuelle Weiterleitung nach Prüfung, Beschwerde/Takedown, Löschung.
- Realistische Fehlerfälle: Turnstile kaputt, DB nicht gebunden, fehlende Tabellen, ungültiger Admin-Key, fremde Origin, fehlerhafte Formulare, viele Wiederholungsanfragen; fail closed.
- Echte Nutzer dürfen während dieser Tests nicht versehentlich Zugriff auf Testprofile bekommen.
- Kontaktanfragen können **nicht automatisch** weitergeleitet werden: der Betreiber muss die Queue prüfen und nach Prüfung manuell weiterleiten.

## Kontrollierte Freischaltung – erst nach bestandener Abnahme

1. `LEGAL_READINESS_CONFIRMED=true` **erst nach rechtlicher Prüfung und fertigen Betreiber-/Datenschutzangaben**.
2. `SUBMISSIONS_ENABLED=true` und `CONTACT_REQUESTS_ENABLED=true` setzen; `REPORTS_ENABLED=true` nur wenn Reporting-Abnahme bestanden.
3. **Zum Schluss** `MARKETPLACE_LAUNCH_APPROVED=true` setzen; Production **neu deployen**.
4. `https://oficiord.pages.dev/api/config` muss dann `submissionsEnabled:true` und `contactRequestsEnabled:true` melden. Fällt die DB-Schema-, Moderations- oder Turnstile-Voraussetzung aus, werden Formulare ausgeblendet.
5. Zunächst mit **einer** legitimen, ausdrücklich einwilligenden Anzeige und **einer** Testanfrage prüfen; keine fiktiven Anzeigen im öffentlichen Bereich veröffentlichen.
6. Bei Problemen sofort `MARKETPLACE_LAUNCH_APPROVED=false` setzen und redeployen. Bestehende Einträge nicht wahllos löschen.

Die APIs nehmen bei ausgeschalteten Schaltern keine realen Einreichungen/Kontaktanfragen an. GitHub-Commits allein schalten **nichts** live.

## Hinweis zum Datenschutz

Für Besucher sichtbare Kontakthinweise und die Einwilligung im Formular sind technische Vorbereitungen. Sie ersetzen **nicht** eine individuelle Datenschutzerklärung und vollständige Betreiberangaben. Die vorhandenen Datenschutzhinweise sind **vor echter Datenannahme** zu vervollständigen.

# OficioRD – Missbrauchsschutz für den späteren E-Mail-Login

**Stand:** Die echte Registrierung, der Versand und die Einlösung von Links sowie alle Aufträge, Angebote und öffentlichen Meldungen bleiben deaktiviert. Dieses Modul ist ausschließlich eine interne Vorbereitung. Keine Produktionsmigration und keine neuen kostenpflichtigen Dienste nötig.

## Neue interne Bausteine

- `functions/_lib/login-abuse.js` verwendet HMAC-SHA-256 mit getrennten Schlüsselräumen für E-Mail und IP. Die Tabelle `account_login_limits` speichert nur Hash, Zähler und Ablaufzeit. Es werden keine E-Mail-/IP-Klartexte als Rate-Limit-Schlüssel gespeichert.
- Der `INSERT ... ON CONFLICT ... WHERE ... RETURNING`-Zähler begrenzt eine spätere Stunde auf maximal **3 Link-Anforderungen je E-Mail-Adresse** und **10 je IP**. Beide Limits müssen erfüllt sein; Fehler in D1 führen zur Verweigerung, nicht zur Umgehung.
- Benötigt in einer späteren Aktivierung ein **privates `AUTH_RATE_LIMIT_SECRET` mit mindestens 32 Zeichen**, außerhalb von GitHub und Chat sicher erzeugt und als Cloudflare Secret gespeichert. **Jetzt nicht setzen**.
- `revokeAllOwnSessions` bereitet den serverseitigen Widerruf aller Sitzungen eines zuvor verifizierten, aktiven Kunden-/Dienstleisterkontos vor. Keine öffentliche Mutation ist erreichbar.
- `scripts/check-login-abuse.mjs` und bestehende CI-Tests verwenden ausschließlich erfundene Daten und SQLite in einer flüchtigen Datenbank.

## Vor der tatsächlichen Freischaltung

- E-Mail-Versand und Domain-Authentifizierung (SPF/DKIM/DMARC), Turnstile, WAF-Limits, generische Antworten für existierende/unbekannte Konten und Zustelllimits integrieren.
- Atomare Abwicklung aller erforderlichen Anmeldezustände samt Wiederherstellung nach Fehlern und parallelen Zugriffen planen.
- Normalisierung von Reverse-Proxy-IP-Adressen, Datenschutzinformation für Rate-Limit-Metadaten, Aufbewahrung und Löschung festlegen.
- Sicherheitsprüfung für CSRF, Session-Fixation, E-Mail-Wechsel, gelöschte/gesperrte Konten, Link-Leaks, Cookie-Scope, Standortwechsel und Logout.
- Alle öffentlichen Aktivierungsflags ausgeschaltet lassen; Migrationen `0003` bis `0006` bleiben vorbereitet, nicht in Production ausführen.

**Achtung:** Ein Rate Limit allein garantiert keinen Schutz gegen verteilte Angriffe und ersetzt weder Turnstile noch IP-Spoofing-Schutz durch Cloudflare. Auch die künftige E-Mail-Anmeldung ist noch nicht funktionsfähig.

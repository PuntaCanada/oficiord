# OficioRD – Handwerker-/Angebotsmodell (noch NICHT öffentlich)
## Bereits vorbereitet
- D1-Migration `migrations/0003_marketplace.sql`: Profile, Auftragsdetails, Angebote.
- `/api/marketplace/profiles`: zeigt ausschließlich manuell freigegebene Profile und keine Kontaktdaten.
- `/api/marketplace/jobs?id=...`: ausschließlich freigegebene und offene Aufträge ohne Kontaktdaten.
- Angebote und Registrierungen werden **immer** abgewiesen. Sie sind noch nicht implementiert.
- `/demo/`: interaktiver Offline-Prototyp mit ausdrücklich erfundenen Beispielen, ohne Datenbank-Schreibzugriff.

## Vor Freigabe erforderlich
1. Datenbankmigration 0003 erst später in D1 ausführen; für den Demo-Modus nicht notwendig.
2. Identitäten, authentifizierte Rollen und Eigentumsprüfung entwickeln (Kunde ↔ eigener Auftrag, Dienstleister ↔ eigenes Profil).
3. Sicheres privates Nachrichtensystem, Freigabe/Auftragsschluss, Löschung und Aufbewahrung.
4. Datenschutz-, Nutzungs-, Beschwerde-, Haftungs- und Moderationsprozesse juristisch prüfen.
5. Durchgehende Sicherheitstests, Einsicht in personenbezogene Daten ausschließlich für berechtigte Konten.
6. Erst dann den Leseschalter `MARKETPLACE_READS_ENABLED=true` prüfen. **Nicht jetzt einrichten.**

## Zustandsflags – NICHT aktivieren
- `SUBMISSIONS_ENABLED` bleibt nicht gesetzt.
- `REPORTS_ENABLED` bleibt nicht gesetzt.
- `MARKETPLACE_READS_ENABLED` bleibt nicht gesetzt.
- Auf Angebots- und Profil-POST gibt es absichtlich **keinen Freigabe-Schalter**, bis echte Authentifizierung existiert.

## DOP-Beträge
Alle Preise sind in dominikanischen Pesos gespeichert; Demo-Beispiele sind frei erfunden und keine realen Marktpreise.

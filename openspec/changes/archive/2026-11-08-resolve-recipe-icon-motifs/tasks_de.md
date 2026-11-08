# Aufgabenübersicht

**Abgeschlossen:** Alle neun Aufgaben der maßgeblichen [tasks.md](tasks.md) erledigt. 147 Tests einschließlich Typprüfung, Build und echtem Offline-Rendering erfolgreich. Reale gespeicherte Apfelkuchendaten ohne Provideraufruf geprüft: acht passende Knoten, sechs Motive. Änderungen an Produktionscode nur in motif.ts; GitNexus-Impact UNKNOWN (nicht indexiert), Gesamtprüfung HIGH für die bereits vorhandenen CLI-/Config-Änderungen. Keine neue Live-Generierung, kein Commit oder Archivieren; Sicherheitsabnahme des Eltern-Changes bleibt offen.

## 1. Regression und Grenzen

- [x] 1.1 Bestehende Änderungen und Eltern-Change prüfen; GitNexus-Impact vor Symboländerungen, hohe Risiken melden und Indexlücken dokumentieren.
- [x] 1.2 Bereinigte Apfelkuchen-Fixture und zuerst fehlschlagende Tests für Mengen, Einheiten, Brüche/Dezimalzahlen, Unicode/Mehrzahl, Zusätze, bisherige Aliasse und unveränderte Eingaben.
- [x] 1.3 Negative Tests für Alternativen, Mischungen, andere Zutatenidentitäten, unbekannte Zusätze, Verneinung, Pfade, Größenlimits und unverbundene IDs.

## 2. Erkennung

- [x] 2.1 Begrenzte vollständige Zutatengrammatik implementieren, bestehende Schlüssel erhalten und bei Mehrdeutigkeit verzichten.
- [x] 2.2 Vollständige Aktionen, Zeitpräfixe, action-Vorrang, leeres action-Feld, Geräte-/Temperaturangaben, Konflikte, Verneinung und Zwischenzustände zuerst testen, dann Regeln implementieren.

## 3. Offline-Abnahme

- [x] 3.1 Realistische Fixture mit eingespeistem PNG-Generator integrieren; Zuordnung/Nichtzuordnung, eine Beschaffung je Motiv, Original-/Cachewiederverwendung und unveränderte Faktenbytes prüfen.
- [x] 3.2 Sichtbare Icons und vollständige Details im echten SVG/PNG auch nach Verschieben ohne Bibliothekszugriff nachweisen; Aus-/lokale Modi und Timeline erhalten, keine Live-Provider.

## 4. Dokumentation und Prüfung

- [x] 4.1 Deutsche/englische Anleitung und deutsche next_step.md aktualisieren, unterstützte Grammatik und Grenzen benennen.
- [x] 4.2 Typprüfung, Build, alle Tests, OpenSpec, Diff und Änderungsumfang prüfen; vor autorisiertem Commit detect_changes ausführen und Change-Namen verwenden. Keine automatische kostenpflichtige Generierung oder Archivierung des Eltern-Changes.

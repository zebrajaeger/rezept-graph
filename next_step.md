# Projekt ausführen

Im Verzeichnis `backend`:

```powershell
npm start -- analyze --config ..\config.json --urls examples/recipe-urls.txt
```

Voraussetzungen: konfigurierte `.env` und installiertes Chrome; siehe [Einrichtung](docs/setup_de.md). Bilder liegen unter `backend/outputs/`.

Icons sind in der lokalen `config.json` auf `generate-missing` aktiviert: fehlende bekannte Motive können beim Analyselauf Codex-Kontingent verbrauchen. Zum Abschalten `icons.mode: off`, für reine Wiederverwendung `local-only`. Die `config.example.json` zeigt denselben Modus mit anzupassendem Codex-Pfad.

## Kleiner Einstieg

Motivgrammatik um eine weitere eindeutige Formulierung erweitern: zuerst positiven und negativen Test in `backend/test/icon-motif-resolution.test.ts` ergänzen. [Archivierter Change resolve-recipe-icon-motifs](openspec/changes/archive/2026-11-08-resolve-recipe-icon-motifs/proposal_de.md) enthält die Grenzen; für neue Codeänderungen einen neuen Change anlegen.

Mit `icons.mode: local-only` einen vorhandenen Bildkatalog testen oder das kleine Motivvokabular um eine interessante Zutat erweitern (zuerst Test und passenden OpenSpec-Change). Anleitung: [Rezept-Icons](docs/recipe_icons_de.md).

## Aktueller Zustand

- `add-generated-recipe-icons` am 08.11.2026 auf ausdrücklichen Wunsch trotz 3 offener Aufgaben archiviert; Hauptspecs synchronisiert. **Keine vollständige Sicherheitsfreigabe:** weitergehende Profil-/Windows-Reparse-Prüfung (1.3), optionaler Neun-Motive-Test (5.3) und formale Abschlussaufgabe (5.4) bleiben im Archiv unerledigt. Archiv: `openspec/changes/archive/2026-11-08-add-generated-recipe-icons/`. Frühere Angaben zum aktiven Change unten sind historisch. Keine neue Bildgenerierung.

- `resolve-recipe-icon-motifs`: 9/9 Aufgaben erledigt, Hauptspec synchronisiert und am 08.11.2026 archiviert. 147 Tests samt Typprüfung/Build erfolgreich. Auch das echte gespeicherte Apfelkuchen-JSON wird jetzt mit acht Motiveninblendungen aufgelöst (sechs verschiedene Motive), ohne Netz-/Provideraufruf geprüft. Auf Benutzerentscheidung wird der noch nicht abgeschlossene Icon-Unterbau mit versioniert; `add-generated-recipe-icons` bleibt mit 18/21 Aufgaben aktiv. GitNexus bleibt für neue Symbole unvollständig, Gesamtumfang HIGH.

- Apfelkuchen-Motivfehler testgetrieben behoben: realistische Offline-Fixture erkennt 8/21 Knoten (fünf Zutaten, drei Ofenaktionen, sechs Motive), Alternativen bleiben Text. Sichtbare SVG-/PNG-Icons nach Verschieben und Entfernen des Katalogs geprüft, Original-/Cachewiederverwendung ohne neue Generierung. Bisherige echte Ausgaben unter `backend/outputs` stammen weiterhin vom fehlgeschlagenen Null-Icon-Lauf; kein neuer kostenpflichtiger Lauf automatisch gestartet. Offene Sicherheitsabnahmen des Eltern-Changes bleiben separat.

- Originale samt Metadaten unter `assets/recipe-icons` für Git vorsehen; kleine Anzeigebilder werden persistent unter `backend/.cache/recipe-icons` wiederverwendet (konfigurierbar). Cache darf gelöscht werden: lokale Neuerzeugung ohne KI. Defekte Einträge reparieren, Schreibfehler tolerieren. Demand bleibt pro Lauf neu berechnete, ignorierte Ausgabe. 142 Tests erfolgreich; OpenSpec und Diff geprüft. Damit 17/20 Aufgaben erledigt; die bisherigen Sicherheits-/optionalen Abnahmeaufgaben bleiben offen. Kein Commit oder Import früherer Testbilder.

- Aktuelle Prüfung: 137 Tests, Typprüfung, Build, Offline-Rendering und Paketinhalt erfolgreich. Finaler Produktionsadapter ohne optionales Profil live erfolgreich: PNG 1261×1247, Derivat 64×63, korrektes Graphbild mit roten Heißprozess-Hinweisen. Belege `C:\Users\l\AppData\Local\Temp\opencode\icon-final-adapter-iBh2xI\`. 16/19 Aufgaben erledigt. Offen: weitergehende Profil-/Werkzeug-/Windows-Reparse-Sicherheitsabnahme (1.3), optionaler Neun-Motive-Probelauf und Abschlussprüfung. Nicht archivierungsbereit. GitNexus meldet HIGH für CLI/Config-Gesamtumfang, neue unversionierte Symbole unvollständig erfasst. Kein Commit.

- Implementierung der Icon-Konfiguration, vorsichtigen Motivauflösung, versionierten Prompts, PNG-/Prüfsummenprüfung, revisionssicherer Bildbibliothek, Bedarfsberichte, Codex-Adapter und Graphanreicherung vorhanden. Ohne Icon-Konfiguration bleibt Ausgabe identisch; Timeline unverändert. Codex-Generierung explizit aktivieren, native geprüfte Version 0.167.0; lokale Modi starten keinen Generator. Weiterhin keine automatische Rechte-/Erkennbarkeitsfreigabe.

- Anzeigederivate maximal 96 Pixel/8 KiB, gesamter Mermaid-Text maximal 48.000 Zeichen; zu große Quellen und Fehlerkarten trotz Exit 0 werden abgelehnt. Fehler der Bildbeschaffung bleiben nichtfatal, echte Rendererfehler fatal.
- Freigegebener Ein-Ei-Test erfolgreich, Original erhalten; `egg-bounded.png` unter `C:\Users\l\AppData\Local\Temp\opencode\recipe-icon-live-eJtHHC\`. Keine weiteren kostenpflichtigen Aufrufe. Neun-Motive-Kontaktbogen bleibt optional und nicht durchgeführt.
- Bewusste Grenzen: maximal eine begrenzte Codex-Sitzung je Motiv/Lauf, keine Garantie nur einer internen Bildanfrage oder eines Geldbetrags. Codex-Cache-Schreiber ausdrücklich vertraut; Befehle zusätzlich read-only. Einzel-Schreiber-Betrieb erforderlich, keine Sicherheitsgarantie gegen feindliche lokale Parallelprozesse. Details: [Betriebsdokumentation](docs/recipe_icons_de.md).
- Zusatzansicht für eine Person implementiert: aktive Schritte nacheinander, passive Phasen parallel, markierte Zeitschätzungen, ungefähre Gesamtzeit und rechtzeitiges Vorheizen. Bestehender Graph bleibt erhalten. Change `add-single-person-cooking-timeline` synchronisiert und unter `openspec/changes/archive/2026-11-08-add-single-person-cooking-timeline/` archiviert.
- CLI erzeugt neun Dateien: bisherige fünf Ausgaben plus Timeline-JSON, Mermaid, SVG und PNG; zusätzlich bei aktivierten Icons ein separater Bedarfsbericht. Beispiele unter `docs/images/`. Echter CLI-Probelauf mit konfiguriertem LLM am 08.11.2026 erfolgreich; Timeline bleibt von Icon-Anreicherung unabhängig.
- Kochansicht verwendet jetzt den vorhandenen Graph-Renderer für dieselben Farben, Formen und Linien: chronologische Zeilen statt großer Hintergrundflächen und Querverbindungsnetz. Gleichzeitige Starts nebeneinander; keine maßstabsgetreue Gantt-Achse. Apfelkuchen unter `backend/outputs/` aktualisiert, Originalgraph unverändert.
- Bildausgabe und ausschließlich OpenAI-kompatible Anbindung implementiert und archiviert. Apfelkuchen-Probelauf erfolgreich; früherer HTTP-401-Fehler behoben.
- Offen: zuletzt 20 gemeldete npm-Abhängigkeitsschwachstellen gesondert prüfen; keine automatische potenziell inkompatible Behebung.
- Bereits vorhandene Änderungen an `AGENTS.md` und `backend/package.json` nicht überschreiben.

# Projekt ausführen

Im Verzeichnis `backend`:

```powershell
npm start -- analyze --config ..\config.json --urls examples/recipe-urls.txt
```

Voraussetzungen: konfigurierte `.env` und installiertes Chrome; siehe [Einrichtung](docs/setup_de.md). Bilder liegen unter `backend/outputs/`.

## Kleiner Einstieg

Die [Hefeteig-Kochansicht](docs/images/bread.timeline.png) ansehen und als kleine Verbesserung einen besonders wichtigen Wiedereinstiegspunkt optisch deutlicher machen. Vor Codeänderungen einen passenden OpenSpec-Change anlegen beziehungsweise den laufenden Change fortführen.

## Aktueller Zustand

- Bildbibliothek als OpenSpec-Entwurf vorbereitet, nicht implementiert: [add-generated-recipe-icons](openspec/changes/add-generated-recipe-icons/proposal_de.md). Codex-CLI als erster Generator, lokale Wiederverwendung und Reparatur fehlender Bilddateien; zuerst nichtinteraktive PNG-Erzeugung mit sicherer Sandbox und portable Mermaid-Einbettung prüfen. Lokale Bild-KI in Docker bleibt ein eigener späterer Change. Deutsche [Aufgabenübersicht](openspec/changes/add-generated-recipe-icons/tasks_de.md).
- Zusatzansicht für eine Person implementiert: aktive Schritte nacheinander, passive Phasen parallel, markierte Zeitschätzungen, ungefähre Gesamtzeit und rechtzeitiges Vorheizen. Bestehender Graph bleibt erhalten. Change `add-single-person-cooking-timeline` synchronisiert und unter `openspec/changes/archive/2026-11-08-add-single-person-cooking-timeline/` archiviert.
- CLI erzeugt neun Dateien: bisherige fünf Ausgaben plus Timeline-JSON, Mermaid, SVG und PNG. 92 Tests, Typprüfung, Build und echtes Rendering erfolgreich; Beispiele unter `docs/images/`. Echter CLI-Probelauf mit konfiguriertem LLM am 08.11.2026 erfolgreich; nach visueller Kritik Timeline-Bilder aus denselben Planungsdaten neu gerendert.
- Kochansicht verwendet jetzt den vorhandenen Graph-Renderer für dieselben Farben, Formen und Linien: chronologische Zeilen statt großer Hintergrundflächen und Querverbindungsnetz. Gleichzeitige Starts nebeneinander; keine maßstabsgetreue Gantt-Achse. Apfelkuchen unter `backend/outputs/` aktualisiert, Originalgraph unverändert.
- Bildausgabe und ausschließlich OpenAI-kompatible Anbindung implementiert und archiviert. Apfelkuchen-Probelauf erfolgreich; früherer HTTP-401-Fehler behoben.
- Offen: zuletzt 20 gemeldete npm-Abhängigkeitsschwachstellen gesondert prüfen; keine automatische potenziell inkompatible Behebung.
- Bereits vorhandene Änderungen an `AGENTS.md` und `backend/package.json` nicht überschreiben.

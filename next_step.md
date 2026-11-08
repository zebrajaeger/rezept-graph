# Nächster Einstieg / Next entry point

**DE:** Prüfe als nächsten kleinen Schritt die gemeldeten npm-Abhängigkeitsschwachstellen und plane notwendige Updates als eigenen OpenSpec-Change. Die Graphbilder unter `backend/outputs/` sind bereits erzeugt.

**EN:** As a small next step, investigate the reported npm dependency vulnerabilities and plan necessary updates as a separate OpenSpec change. Graph images have already been generated under `backend/outputs/`.

## Aktueller Zustand / Current state

- **DE:** Change `add-automatic-graph-image-outputs` implementiert und unter `openspec/changes/archive/2026-11-08-add-automatic-graph-image-outputs/` archiviert; drei Anforderungen in die Hauptspec übernommen. Fünf Outputs, abgewartetes Rendering, temporäre Bildpaare und Fehlerbereinigung. 76 Tests inklusive echtem Mermaid-/Chrome-Test, Typprüfung und Build erfolgreich. Runtime-Abhängigkeit und Paketinhalt geprüft.
- **EN:** Change `add-automatic-graph-image-outputs` implemented and archived under `openspec/changes/archive/2026-11-08-add-automatic-graph-image-outputs/`; three requirements synced to the main specification. Five outputs, awaited rendering, staged image pairs, and failure cleanup. All 76 tests including real Mermaid/Chrome rendering, type checks, and build pass. Runtime dependency and package contents checked.
- **DE:** Chefkoch-Probelauf mit Offline-HTML und vorhandenem Antwortcache erfolgreich; SVG und PNG erzeugt. SVG-ViewBox ca. 1407×2463, PNG 1408×2463, passende Beschriftungen und weißer Hintergrund. npm meldet 20 Abhängigkeitsschwachstellen (1 niedrig, 2 mittel, 16 hoch, 1 kritisch); keine automatische potenziell inkompatible Behebung durchgeführt.
- **EN:** Chefkoch smoke run using offline HTML and the existing response cache succeeded; SVG and PNG generated. SVG viewBox about 1407×2463, PNG 1408×2463, matching labels and white background. npm reports 20 dependency vulnerabilities (1 low, 2 moderate, 16 high, 1 critical); no potentially breaking automatic fixes applied.

- **DE:** Nur OpenAI-kompatible Chat-Completions; Provider-Auswahl vollständig entfernt. 70 automatisierte Tests einschließlich Typprüfung und Build erfolgreich. OpenSpec-Change `support-only-openai-compatible-providers` implementiert, Hauptspec synchronisiert und unter `openspec/changes/archive/2026-11-08-support-only-openai-compatible-providers/` archiviert.
- **EN:** OpenAI-compatible chat completions only; provider selector fully removed. All 70 automated tests, type checking, and build pass. OpenSpec change `support-only-openai-compatible-providers` implemented, synced to the main specification, and archived under `openspec/changes/archive/2026-11-08-support-only-openai-compatible-providers/`.
- **DE:** Echter Probelauf mit der Chefkoch-URL aus den Examples nach Anpassung der `.env` durch den Nutzer erfolgreich (Exitcode 0). Build, LLM-Aufruf und validierte Ausgabe erfolgreich; Rezept-HTML aus dem zuvor gefüllten Cache verwendet. JSON, Zutatenliste und Mermaid-Datei unter `backend/outputs/` erzeugt, mit dem gemeinsamen Stamm `supersaftiger-apfelkuchen-rezept-von-oma-7c3b189b`. Der frühere HTTP-401-Fehler ist behoben.
- **EN:** Live smoke test using the Chefkoch example URL succeeded after the user updated `.env` (exit code 0). Build, LLM request, and validated output succeeded; recipe HTML came from the previously populated cache. JSON, ingredient list, and Mermaid source were generated under `backend/outputs/`, sharing the stem `supersaftiger-apfelkuchen-rezept-von-oma-7c3b189b`. The earlier HTTP 401 error is resolved.

## Probelauf / Smoke test

Im Verzeichnis `backend` ausführen / Run from `backend`:

```powershell
npm start -- analyze --config ..\config.json --urls examples/recipe-urls.txt
```

**DE:** Die CLI erzeugt automatisch JSON, Zutatenliste, Mermaid, SVG und PNG. Chrome muss installiert sein; siehe `docs/setup_de.md`. Bestehende fremde Änderungen nicht überschreiben.

**EN:** The CLI automatically generates JSON, an ingredient list, Mermaid, SVG, and PNG. Chrome must be installed; see `docs/setup_en.md`. Do not overwrite unrelated existing work.

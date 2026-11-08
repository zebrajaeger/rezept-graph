# Nächster Einstieg / Next entry point

**DE:** Lies den neuen Change `openspec/changes/add-automatic-graph-image-outputs/` und starte die Umsetzung mit `/opsx-apply add-automatic-graph-image-outputs`: SVG und PNG sollen automatisch im normalen CLI-Lauf entstehen.

**EN:** Review `openspec/changes/add-automatic-graph-image-outputs/` and start implementation with `/opsx-apply add-automatic-graph-image-outputs`: SVG and PNG should be generated automatically by normal CLI runs.

## Aktueller Zustand / Current state

- **DE:** Neuer Change `add-automatic-graph-image-outputs` geplant (Proposal, Design, Delta-Spec und Tasks); noch nicht implementiert. Ziel: fünf zusammengehörige Outputs, abgewartetes Rendering und kein veraltetes Bildpaar bei Fehlern.
- **EN:** New change `add-automatic-graph-image-outputs` planned (proposal, design, delta spec, and tasks), not implemented. Goal: five synchronized outputs, awaited rendering, and no stale image pair after failures.

- **DE:** Nur OpenAI-kompatible Chat-Completions; Provider-Auswahl vollständig entfernt. 70 automatisierte Tests einschließlich Typprüfung und Build erfolgreich. OpenSpec-Change `support-only-openai-compatible-providers` implementiert, Hauptspec synchronisiert und unter `openspec/changes/archive/2026-11-08-support-only-openai-compatible-providers/` archiviert.
- **EN:** OpenAI-compatible chat completions only; provider selector fully removed. All 70 automated tests, type checking, and build pass. OpenSpec change `support-only-openai-compatible-providers` implemented, synced to the main specification, and archived under `openspec/changes/archive/2026-11-08-support-only-openai-compatible-providers/`.
- **DE:** Echter Probelauf mit der Chefkoch-URL aus den Examples nach Anpassung der `.env` durch den Nutzer erfolgreich (Exitcode 0). Build, LLM-Aufruf und validierte Ausgabe erfolgreich; Rezept-HTML aus dem zuvor gefüllten Cache verwendet. JSON, Zutatenliste und Mermaid-Datei unter `backend/outputs/` erzeugt, mit dem gemeinsamen Stamm `supersaftiger-apfelkuchen-rezept-von-oma-7c3b189b`. Der frühere HTTP-401-Fehler ist behoben.
- **EN:** Live smoke test using the Chefkoch example URL succeeded after the user updated `.env` (exit code 0). Build, LLM request, and validated output succeeded; recipe HTML came from the previously populated cache. JSON, ingredient list, and Mermaid source were generated under `backend/outputs/`, sharing the stem `supersaftiger-apfelkuchen-rezept-von-oma-7c3b189b`. The earlier HTTP 401 error is resolved.

## Probelauf / Smoke test

Im Verzeichnis `backend` ausführen / Run from `backend`:

```powershell
npm start -- analyze --config ..\config.json --urls examples/recipe-urls.txt
```

**DE:** Die CLI erzeugt JSON, Zutatenliste und Mermaid-Datei; PNG/SVG werden nicht automatisch gerendert. Nach erfolgreichem Live-Test den Change prüfen und gegebenenfalls archivieren. Bestehende fremde Änderungen nicht überschreiben.

**EN:** The CLI generates JSON, an ingredient list, and Mermaid source; PNG/SVG are not rendered automatically. After a successful live test, review and optionally archive the change. Do not overwrite unrelated existing work.

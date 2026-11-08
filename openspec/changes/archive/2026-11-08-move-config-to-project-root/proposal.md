## Why

Configuration files are hidden inside the backend directory, making initial setup harder to discover. Moving the local configuration and its example to the project root makes them visible alongside the README.

Die Konfiguration und ihre Vorlage sind im Backend-Verzeichnis schwer zu finden. Im Projekt-Hauptverzeichnis stehen beide sichtbar neben der README.

## What Changes

- Move the tracked `backend/config.example.json` to `/config.example.json`.
- Move the ignored local `backend/config.json` to `/config.json`, preserving its contents and keeping it untracked; never overwrite an existing root configuration.
- Update CLI defaults, help, launcher and README examples to use the root configuration from root and backend working directories.
- Preserve explicit `--config` paths and configuration-relative cache/output resolution.
- Update ignore rules to protect both the root configuration and any leftover backend configuration.
- **BREAKING**: The bundled example configuration changes location; commands explicitly referencing `backend/config.example.json` must use the new path.

Deutsch: Beide Config-Dateien ziehen ins Hauptverzeichnis. CLI, Starter, Ignore-Regeln und Dokumentation werden angepasst; lokale Werte bleiben erhalten. Explizite Pfade zur bisherigen Beispiel-Config müssen angepasst werden.

## Capabilities

### New Capabilities

- None / Keine.

### Modified Capabilities

- `recipe-url-ingestion`: Define root-level configuration discovery, explicit path compatibility and safe local configuration handling. / Config-Erkennung im Hauptverzeichnis, explizite Pfade und sicherer Umgang mit der lokalen Config.

## Impact

- `backend/src/args.js`, CLI configuration loading, `backend/go.cmd`, configuration fixtures/tests, `.gitignore`, and bilingual README instructions.
- No new dependencies or LLM/schema changes. URL examples stay under `backend/examples/`.
- Keine neuen Abhängigkeiten oder Änderungen an LLM und Datenformaten. URL-Beispiele bleiben unter `backend/examples/`.

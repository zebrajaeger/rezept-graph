## Context

The CLI defaults to `config.json` relative to its working directory. README commands run inside `backend/`, which contains both the tracked example and an ignored local configuration. Cache and output paths are resolved relative to the configuration directory. `backend/go.cmd` also assumes backend-relative paths.

Deutsch: CLI und Starter setzen bisher das Backend als Arbeitsverzeichnis voraus. Cache- und Ausgabepfade beziehen sich auf den Ordner der Config; beim Umzug muss diese Semantik beachtet werden.

## Goals / Non-Goals

**Goals:** Root-level configuration and example; working default configuration from the project root and backend; preserved explicit path semantics; safe local migration; bilingual setup documentation.

**Ziele:** Sichtbare Config-Dateien im Hauptverzeichnis, funktionierende Standardaufrufe, geschützte lokale Werte und zweisprachige Anleitung.

**Non-Goals:** Moving URL examples, changing provider validation or the configuration schema, introducing root package tooling, automatic runtime migration, or rewriting Git history.

**Nicht-Ziele:** URL-Beispiele verschieben, Provider oder Config-Schema ändern, neues Root-Paket, automatische Migration beim CLI-Start oder Änderung der Git-Historie.

## Decisions

1. **Use the repository root as the default configuration location.** Derive that location from the CLI module location, not the caller's current directory. Omitted `--config` selects root `config.json`; explicit `--config` stays relative to the caller's working directory (or absolute when supplied as such). Do not fall back to a backend config or the example. This is more predictable than searching parent directories and avoids selecting an unrelated file.
   **Deutsch:** Standard-Config über den Modulpfad im Hauptverzeichnis finden; explizite Pfade unverändert relativ zum Aufrufverzeichnis behandeln. Keine versteckte Fallback-Config.

2. **Keep configuration-relative directory resolution.** The root example uses `backend/.cache/recipe-pages` and `backend/outputs` to retain the previous bundled runtime locations. During the one-time local move, preserve all settings and rebase relative cache/output paths to their previous absolute destinations. Absolute paths remain unchanged. Do not migrate existing cache/output data.
   **Deutsch:** Relative Pfade bleiben relativ zur Config. Vorlage und lokale Migration berücksichtigen den neuen Standort, sodass bisherige Cache- und Ausgabeziele erhalten bleiben.

3. **Migrate the local file only during implementation, without exposing secrets.** Add `/config.json` to `.gitignore`, retain `/backend/config.json` protection, and move the local file only when the destination is absent. If both exist, stop migration and ask which to retain; do not merge, print, commit or overwrite their contents. Commit only the secret-free root example.
   **Deutsch:** Beide lokalen Pfade ignorieren. Bei zwei vorhandenen Configs nachfragen statt überschreiben; Geheimnisse weder ausgeben noch committen.

4. **Keep the existing backend package and URL example location.** Update README commands for root invocation using `node backend/src/cli.js` and backend invocation using `npm start`. Explicitly supply the appropriate URL file path in root examples. Make `go.cmd` establish its own backend working directory before invoking the CLI and forward the root config location. Update CLI help accordingly.
   **Deutsch:** Paket und URL-Datei bleiben im Backend; dokumentierte Root-Aufrufe geben den URL-Pfad explizit an. Der Windows-Starter setzt sein Arbeitsverzeichnis verlässlich.

## Risks / Trade-offs

- [Moving config changes relative paths] → Rebase migrated local directory values and test root example resolution. / Relative Pfade beim Umzug anpassen und testen.
- [Secrets accidentally tracked] → Verify both ignore rules and the staged diff; never include local contents in artifacts or fixtures. / Ignore-Regeln und Index prüfen, nur Dummy-Testwerte verwenden.
- [Old explicit example paths break] → Document the new root location and update live references, but leave archived OpenSpec documents historical. / Aktuelle Beispiele aktualisieren, Archiv unverändert lassen.
- [Local destination already exists] → Pause for user choice; no automatic overwrite. / Bei Konflikt Rückfrage.

## Migration Plan

1. Update ignore rules before touching the local configuration.
2. Move the tracked example and safely migrate the local configuration with rebased relative directory values.
3. Adjust default config discovery, launcher, help, tests and bilingual README.
4. Run backend verification and strict OpenSpec validation; verify local configs remain untracked.
5. Rollback: restore the old tracked example and defaults; move the ignored local config back only if its old destination is absent, reversing the directory rebasing. Never discard local values.

Deutsch: Erst Ignore-Regeln, dann sichere Dateimigration, anschließend CLI/Dokumentation/Tests. Rücknahme ebenfalls ohne Überschreiben lokaler Werte.

## Open Questions

None for planning. A conflict between two local configurations requires user input during implementation.

Deutsch: Keine offenen Planungsfragen. Zwei vorhandene lokale Configs erfordern bei der Umsetzung eine Rückfrage.

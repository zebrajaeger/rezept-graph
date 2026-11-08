## 1. Safe configuration relocation / Sichere Config-Migration

- [x] 1.1 Add `/config.json` to `.gitignore`, retain `/backend/config.json`, and verify both local paths are ignored. / Beide lokalen Config-Pfade schützen und prüfen.
- [x] 1.2 Move `backend/config.example.json` to root `config.example.json`; set relative cache/output paths to preserve backend runtime destinations. / Vorlage verschieben und Laufzeitziele erhalten.
- [x] 1.3 Migrate the existing ignored local config to the root without exposing its contents; rebase relative cache/output values and stop for user input if both files exist. / Lokale Werte sicher verschieben, bei Konflikt nachfragen.

## 2. CLI integration / CLI-Anpassung

- [x] 2.1 Run GitNexus upstream impact analysis for every existing symbol to be edited and report its blast radius before editing. / Vor Symboländerungen Auswirkungen prüfen und melden.
- [x] 2.2 Make omitted `--config` select module-relative project-root `config.json`, preserve explicit relative/absolute paths, and report the root path when missing without fallback. / Standard-Config im Root finden, explizite Pfade erhalten.
- [x] 2.3 Update CLI help and make `backend/go.cmd` reliably use the root config and backend URL example regardless of invocation directory. / Hilfe und Windows-Starter anpassen.

## 3. Documentation and verification / Dokumentation und Prüfung

- [x] 3.1 Update README setup, analysis and example-config references in English and German, with commands from both root and backend; leave archived artifacts unchanged. / Zweisprachige Anleitung für beide Aufruforte ergänzen.
- [x] 3.2 Add regression tests for default config selection from root/backend, explicit paths, missing config without fallback, config-relative paths and relocated example destinations; use dummy values only. / Pfadverhalten und neue Vorlage ohne Geheimnisse testen.
- [x] 3.3 Verify launcher behavior and documented commands without live provider calls or recipe fetching. / Starter und Befehle ohne Netzwerkzugriffe prüfen.
- [x] 3.4 Run backend tests and `openspec validate move-config-to-project-root --strict`; verify the root example is tracked, the backend example is gone and local configs remain ignored/untracked. / Tests, Spec-Validierung und Git-Status prüfen.
- [x] 3.5 Before any commit, run GitNexus change detection and review staged files for unintended changes or secrets; base the commit message on `move-config-to-project-root`. / Vor Commit Umfang und Geheimnisse prüfen; Change-Namen verwenden.

Verification: 49 backend tests passed; strict OpenSpec validation and git diff --check passed. GitNexus change detection completed (medium risk, CLI argument flow). Local configurations are ignored and untracked. No commit requested in this apply step; staged-diff review and change-based commit naming remain mandatory if committing later.

Prüfung: 49 Backend-Tests erfolgreich; strikte OpenSpec-Validierung und Diff-Prüfung erfolgreich. Lokale Configs bleiben ignoriert. In diesem Apply-Schritt wird kein Commit erstellt; vor einem späteren Commit Index erneut prüfen und Change-Namen verwenden.

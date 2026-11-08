## ADDED Requirements

### Requirement: Root-level configuration files
The project SHALL provide the tracked, secret-free example configuration at `config.example.json` in the project root and SHALL use an untracked root `config.json` for local settings. Both the root and legacy backend local configuration paths MUST be ignored by Git.

Deutsch: Vorlage und lokale Config liegen im Hauptverzeichnis. Die Vorlage ist versioniert und frei von Geheimnissen; lokale Configs an beiden Standorten bleiben ignoriert.

#### Scenario: Fresh checkout configuration setup
- **WHEN** a user sets up a fresh checkout
- **THEN** `config.example.json` exists at the project root rather than under `backend/`
- **AND** the user can copy it to root `config.json` without making local settings trackable by Git

#### Scenario: Local configuration migration
- **WHEN** an ignored `backend/config.json` exists and root `config.json` does not
- **THEN** the implementation migration moves the local configuration to the root without losing settings
- **AND** relative cache/output values are rebased to preserve their previous destinations
- **AND** the resulting local configuration remains untracked

#### Scenario: Conflicting local configurations
- **WHEN** both root and backend local configuration files exist during migration
- **THEN** neither file is overwritten or deleted automatically
- **AND** migration waits for the user's choice

### Requirement: Default configuration is independent of invocation directory
The CLI SHALL use project-root `config.json` when `--config` is omitted, including invocations from the project root or backend directory. Explicit relative configuration paths SHALL remain relative to the caller's working directory; absolute paths SHALL be used as supplied. Cache and output directory values SHALL remain relative to the selected configuration's directory unless absolute.

Deutsch: Ohne `--config` wird immer die Root-Config verwendet; explizite Pfade behalten ihre bisherige Bedeutung. Cache- und Ausgabepfade bleiben relativ zur gewählten Config.

#### Scenario: Default invocation from root or backend
- **WHEN** the CLI is invoked from the project root or backend directory without `--config`
- **THEN** it selects the same project-root `config.json`

#### Scenario: Explicit relative or absolute configuration path
- **WHEN** the user supplies `--config` with a relative or absolute path
- **THEN** the CLI loads the requested path using the existing explicit path semantics
- **AND** cache/output paths are resolved relative to that file's directory

#### Scenario: Default configuration is absent
- **WHEN** project-root `config.json` does not exist and `--config` is omitted
- **THEN** the CLI reports a missing configuration error identifying the root path
- **AND** it does not silently load the example or legacy backend configuration

### Requirement: Configuration setup instructions match the root layout
The README SHALL document root-level configuration setup in English and German, with usable root and backend CLI invocation examples. The backend Windows launcher and CLI help SHALL reference the new configuration layout. The bundled example SHALL retain the previous backend cache and output destinations.

Deutsch: README, CLI-Hilfe und Starter berücksichtigen das neue Layout. Die zweisprachige Anleitung erklärt Root- und Backend-Aufrufe; bisherige Laufzeitziele der Vorlage bleiben erhalten.

#### Scenario: Documented setup and analysis
- **WHEN** a user follows either language's setup instructions and analysis commands
- **THEN** configuration is copied from the root example to root `config.json`
- **AND** commands from root and backend select the root configuration and the existing backend URL example file

#### Scenario: Windows launcher execution
- **WHEN** the backend launcher is invoked from a different working directory
- **THEN** it selects the root configuration and the backend URL example independently of that working directory

#### Scenario: Example cache and output destinations
- **WHEN** the relocated root example configuration is loaded
- **THEN** its cache resolves to `backend/.cache/recipe-pages` and its output resolves to `backend/outputs` under the project root

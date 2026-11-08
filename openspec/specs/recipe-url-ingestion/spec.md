# recipe-url-ingestion Specification

## Purpose
TBD - created by archiving change add-recipe-url-graph-cli. Update Purpose after archive.
## Requirements
### Requirement: CLI reads recipe URLs from a file
The system SHALL provide a CLI workflow that reads one or more recipe URLs from a configurable text file.

#### Scenario: URL file contains recipe URLs
- **WHEN** the CLI is run with a URL file containing non-empty URL lines
- **THEN** the system processes each URL as a recipe source

#### Scenario: URL file contains comments and blank lines
- **WHEN** the URL file contains blank lines or lines starting with `#`
- **THEN** the system ignores those lines

#### Scenario: URL file is missing
- **WHEN** the CLI is run with a URL file path that does not exist
- **THEN** the system reports a clear error and does not fetch any pages

### Requirement: CLI can seed sample URLs from Chefkoch random recipes
The system SHALL provide an explicit CLI workflow that can populate the sample URL file from Chefkoch random recipe results.

#### Scenario: Seeding is invoked explicitly
- **WHEN** the user runs the sample URL seeding workflow
- **THEN** the system requests Chefkoch random recipe results from `https://www.chefkoch.de/rs/s0/zufall/Rezepte.html`

#### Scenario: Random recipe meets quality thresholds
- **WHEN** a discovered Chefkoch recipe has a rating greater than `4` and more than `10` ratings
- **THEN** the system may add the recipe URL to the sample URL file

#### Scenario: Random recipe does not meet quality thresholds
- **WHEN** a discovered Chefkoch recipe has a rating of `4` or lower or has `10` ratings or fewer
- **THEN** the system does not add the recipe URL to the sample URL file

#### Scenario: Recipe URL is already present
- **WHEN** a discovered Chefkoch recipe URL already exists in the sample URL file
- **THEN** the system does not add a duplicate entry

#### Scenario: Normal analysis is run
- **WHEN** the user runs the normal recipe analysis workflow
- **THEN** the system does not request Chefkoch random recipe results

### Requirement: HTML fetcher retrieves recipe pages
The system SHALL fetch HTML pages for recipe URLs that are not satisfied by the local cache.

#### Scenario: Fetch succeeds
- **WHEN** the system fetches a URL and receives an HTML response
- **THEN** the system stores the response body and response metadata for downstream processing

#### Scenario: Fetch fails
- **WHEN** the system cannot fetch a URL because of a network error or non-success HTTP status
- **THEN** the system reports the URL, failure reason, and status when available

### Requirement: HTML cache supports development-safe modes
The system SHALL cache fetched HTML pages locally and provide cache modes that reduce repeated requests to recipe websites.

#### Scenario: Cache-first uses existing cached content
- **WHEN** cache mode is `cache-first` and a cached entry exists for the URL
- **THEN** the system uses the cached HTML without making a network request

#### Scenario: Cache-first fetches missing content
- **WHEN** cache mode is `cache-first` and no cached entry exists for the URL
- **THEN** the system fetches the URL and stores the fetched HTML in the cache

#### Scenario: Refresh overwrites cached content
- **WHEN** cache mode is `refresh`
- **THEN** the system fetches the URL and replaces the cached entry with the latest response

#### Scenario: Offline mode avoids network access
- **WHEN** cache mode is `offline`
- **THEN** the system never makes a network request

#### Scenario: Offline mode requires cached content
- **WHEN** cache mode is `offline` and no cached entry exists for the URL
- **THEN** the system reports that the URL is missing from the cache

### Requirement: Cache entries include metadata
The system SHALL store cache metadata with each fetched recipe page.

#### Scenario: Metadata is written
- **WHEN** a page is fetched and cached
- **THEN** the cache metadata includes the original URL, fetched timestamp, HTTP status, content type when available, and final URL when available

### Requirement: Recipe content is extracted before analysis
The system SHALL derive recipe-focused content from cached or fetched HTML before LLM analysis.

#### Scenario: Structured recipe data exists
- **WHEN** the HTML contains schema.org Recipe JSON-LD
- **THEN** the extractor includes the structured recipe fields in the analysis input

#### Scenario: Structured recipe data is unavailable
- **WHEN** the HTML does not contain usable structured recipe data
- **THEN** the extractor provides cleaned page text as the analysis input

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

## ADDED Requirements

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

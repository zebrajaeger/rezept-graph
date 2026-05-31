## 1. CLI Foundation

- [x] 1.1 Decide and document the backend CLI entry point and command shape.
- [x] 1.2 Add CLI argument parsing for config path, URL file path, cache mode, output directory, intermediate-state rendering, and sample URL seeding.
- [x] 1.3 Add a sample URL file with commented examples and at least one placeholder recipe URL.
- [x] 1.4 Add config loading for LLM provider settings, cache directory, and output defaults.
- [x] 1.5 Add validation and clear error messages for missing URL files, invalid config files, and unsupported cache modes.

## 2. Sample URL Seeding

- [x] 2.1 Implement an explicit Chefkoch sample URL seeding command that is separate from normal analysis.
- [x] 2.2 Fetch Chefkoch random recipe results from `https://www.chefkoch.de/rs/s0/zufall/Rezepte.html` only when the seeding command is invoked.
- [x] 2.3 Parse discovered recipe URLs, ratings, and rating counts from Chefkoch result content.
- [x] 2.4 Add only recipes with rating greater than `4` and more than `10` ratings to the sample URL file.
- [x] 2.5 Deduplicate seeded URLs against existing sample URL file entries.
- [x] 2.6 Add tests proving normal analysis does not invoke Chefkoch random recipe discovery.

## 3. URL Fetching and Cache

- [x] 3.1 Implement URL file parsing with support for comments and blank lines.
- [x] 3.2 Implement deterministic cache keys for recipe URLs.
- [x] 3.3 Implement cache entry storage for raw HTML and metadata.
- [x] 3.4 Implement `cache-first`, `refresh`, and `offline` cache modes.
- [x] 3.5 Implement HTTP fetching with timeout, user agent, status handling, and content-type metadata.
- [x] 3.6 Add tests for URL parsing and cache-mode behavior.

## 4. Recipe Content Extraction

- [ ] 4.1 Implement extraction of schema.org Recipe JSON-LD when present.
- [ ] 4.2 Implement cleaned text fallback extraction when structured recipe data is not available.
- [ ] 4.3 Define the analysis input format passed from extraction to the LLM analyzer.
- [ ] 4.4 Add fixture tests for structured-data extraction and fallback text extraction.

## 5. Recipe Analysis Schema

- [ ] 5.1 Define the recipe analysis JSON schema for metadata, ingredients, nodes, edges, and ingredient list.
- [ ] 5.2 Add schema validation for LLM responses.
- [ ] 5.3 Add normalized ingredient fields while preserving original ingredient text.
- [ ] 5.4 Add graph node types for ingredients, processing steps, and intermediate states.
- [ ] 5.5 Add edge types for ingredient usage, step order, and produced intermediate states.
- [ ] 5.6 Add tests for valid and invalid recipe analysis payloads.

## 6. OpenAI-Compatible LLM Integration

- [ ] 6.1 Implement an OpenAI-compatible chat/completions client using configured base URL, model, API key source, and timeout.
- [ ] 6.2 Create the recipe analysis prompt with explicit JSON-only output instructions.
- [ ] 6.3 Add analysis error handling for network failures, provider errors, invalid JSON, and schema validation failures.
- [ ] 6.4 Add a provider abstraction so tests can use a fake LLM response without network access.
- [ ] 6.5 Add tests for successful fake analysis and invalid fake analysis.

## 7. Output Generation

- [ ] 7.1 Write structured recipe JSON output per analyzed URL.
- [ ] 7.2 Generate a human-readable ingredient list from analyzed ingredients.
- [ ] 7.3 Generate Mermaid flowchart output from recipe graph nodes and edges.
- [ ] 7.4 Add rendering option to include intermediate state nodes.
- [ ] 7.5 Add rendering option to hide intermediate state nodes while preserving readable flow where possible.
- [ ] 7.6 Add tests for deterministic JSON and Mermaid output from fixed analysis fixtures.

## 8. End-to-End Workflow

- [ ] 8.1 Wire the CLI pipeline from URL file to cache, extraction, LLM analysis, validation, and output generation.
- [ ] 8.2 Add an offline end-to-end fixture test using cached HTML and fake LLM output.
- [ ] 8.3 Add README usage notes for the CLI, config file, sample URL file, cache modes, output files, and Chefkoch sample URL seeding.
- [ ] 8.4 Run the full verification command for the backend package and fix any failures.

## Context

The project currently has separate `backend` and `frontend` packages with minimal scaffolding. The MVP should start in the backend as a CLI because the first useful loop is developer-oriented: provide known recipe URLs, fetch or reuse cached HTML, analyze the recipe with an OpenAI-compatible LLM, and emit structured output plus a graph representation.

The primary user need is not just extraction accuracy. The output should make recipes easier to execute for people with ADHD by turning long recipe pages into clear ingredients, ordered steps, dependencies, optional intermediate states, and a visual flow.

Future input types such as PDFs, photos, and pasted text are intentionally out of scope for the MVP, but the pipeline should be shaped so new source adapters can be added later.

## Goals / Non-Goals

**Goals:**

- Provide a CLI command that reads recipe URLs from a sample URL file.
- Provide an explicit helper command to seed the sample URL file from Chefkoch random recipes that pass rating thresholds.
- Cache fetched HTML locally and support cache-first development.
- Extract recipe-relevant content before sending it to the LLM.
- Configure an OpenAI-compatible LLM endpoint, model, and credentials through a config file.
- Validate LLM output against a structured recipe graph schema.
- Emit a normalized ingredient list, graph nodes, graph edges, and Mermaid graph text.
- Allow graph rendering to include or hide intermediate state nodes.
- Keep the first implementation small enough to work end-to-end before optimizing extraction quality.

**Non-Goals:**

- No frontend UI in the MVP.
- No photo, PDF, or pasted text ingestion in the MVP.
- No automatic browser automation for JavaScript-heavy recipe sites in the first pass.
- No automatic sample URL discovery during normal recipe analysis runs.
- No full nutrition calculation or shopping-list optimization.
- No guaranteed perfect unit conversion in the first pass; preserve parse confidence and original text when normalization is uncertain.

## Decisions

### Build the MVP as a backend CLI pipeline

The first implementation should live in the backend package and expose a CLI entry point. The pipeline should be composed as independent modules:

1. URL file loader
2. config loader
3. fetcher
4. cache
5. content extractor
6. LLM analyzer
7. schema validator
8. output writer
9. Mermaid renderer

Alternative considered: build the frontend first. That would be more visual earlier, but it would delay the more uncertain parts: caching, extraction, LLM schema design, and repeatable test fixtures.

### Use a cache-first HTML cache during development

The cache should store raw HTML plus metadata keyed by a deterministic URL hash. Metadata should include original URL, fetched timestamp, status code, content type, and final URL if redirects occur.

The CLI should support at least these cache modes:

- `cache-first`: use cached HTML when present, otherwise fetch
- `refresh`: fetch and overwrite cached HTML
- `offline`: never fetch; fail if the URL is not cached

Alternative considered: always fetch. This is simpler but would create unnecessary traffic against recipe websites and make development less repeatable.

### Keep sample URL seeding separate from normal analysis

The sample URL file should be a normal input to the CLI, not something that is rebuilt during every run. A separate command should populate or append to that file from `https://www.chefkoch.de/rs/s0/zufall/Rezepte.html` only when explicitly invoked.

The seeding command should keep only recipes with rating greater than `4` and more than `10` ratings. It should also deduplicate URLs before writing them to the sample file.

Alternative considered: discover random recipes automatically whenever the URL file is missing or empty. That would be convenient at first, but it would create surprising network activity and make development runs less reproducible.

### Reduce HTML before LLM analysis

The extractor should first look for structured recipe data such as schema.org `Recipe` JSON-LD. It should also retain a cleaned text fallback from the page body. The LLM prompt should receive the best available recipe content, not the full raw HTML by default.

Alternative considered: send raw HTML to the LLM. That is faster to implement but increases token usage, cost, latency, and extraction noise.

### Require structured LLM JSON and validate it locally

The LLM should return JSON matching an application-owned schema. Validation should happen before rendering. Invalid results should produce a useful error with enough context to improve the prompt or source extraction.

The core schema should include:

- recipe metadata: title, source URL, servings when available
- ingredients: id, name, quantity, unit, preparation, optional original text, optional confidence
- nodes: id, type, label, action, duration, temperature, notes, visibility
- edges: from, to, type, label
- ingredient list: human-readable lines derived from normalized ingredients

Alternative considered: accept free-form LLM text and parse it later. This would be brittle and would make scaling portions or rendering graphs harder.

### Model intermediate states explicitly but make them optional in visualization

Intermediate states such as `dough`, `peeled apples`, or `sauce` should be represented as graph nodes when the LLM can identify them. Rendering should be configurable so a compact view can hide these nodes and connect surrounding steps directly where possible.

Alternative considered: only connect ingredients to steps. That is simpler, but it loses important dependencies in cooking and baking workflows.

### Start with Mermaid, leave room for React Flow later

The CLI should generate Mermaid flowchart text because it is portable, easy to diff, and works well as a first graph output. A later frontend can reuse the validated graph JSON and render it with React Flow or Cytoscape.js if interaction becomes important.

Alternative considered: use React Flow immediately. That is better for interactive editing, but it is unnecessary for proving the URL-to-graph pipeline.

## Risks / Trade-offs

- Recipe websites vary widely -> Prefer JSON-LD when present, keep original text snippets, and add fixture-based tests around representative pages.
- Chefkoch random results may change or be unavailable -> Keep seeding explicit, threshold-based, deduplicated, and separate from the normal analysis pipeline.
- LLM output may be inconsistent -> Use strict JSON schema validation, clear prompts, retries only when useful, and store raw analysis responses for debugging when configured.
- Unit normalization is difficult -> Preserve original ingredient text and mark uncertain normalization instead of inventing precision.
- Caching can hide website changes -> Provide `refresh` mode and include fetch timestamps in metadata.
- Mermaid may become crowded for complex recipes -> Support hiding intermediate states and keep the graph JSON independent from Mermaid rendering.
- OpenAI-compatible providers differ slightly -> Keep provider config generic: base URL, API key env var, model, timeout, and optional compatibility flags.

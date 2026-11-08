## Why

Recipes on typical websites are often hard to follow because the relevant ingredients, timings, intermediate states, and dependencies are mixed with long prose and page clutter. This change introduces a CLI-first workflow that turns recipe URLs into a cached, structured recipe graph so the cooking or baking process can be easier to understand, especially for people with ADHD.

## What Changes

- Add a CLI workflow that reads one or more recipe URLs from a sample URL file.
- Add an explicit, one-shot helper to populate the sample URL file from Chefkoch random recipes when recipes have a rating greater than 4 and more than 10 ratings.
- Fetch recipe HTML from the web with a development-friendly cache to avoid repeatedly requesting the same pages.
- Extract recipe-relevant content from fetched HTML before sending it to an OpenAI-compatible LLM.
- Add configurable LLM settings via a config file so providers such as OpenAI-compatible hosted APIs, LM Studio, Ollama-compatible gateways, LocalAI, or vLLM-style endpoints can be used.
- Analyze recipe content into structured JSON containing normalized ingredients, graph nodes, graph edges, and a human-readable ingredient list.
- Model recipe graph nodes for ingredients, processing steps, and optional intermediate states.
- Generate a Mermaid-based visual representation of the recipe graph, with a view option to include or hide intermediate states.
- Keep future input types such as pasted text, PDFs, and photos out of the MVP implementation, but avoid design choices that would block them later.

## Capabilities

### New Capabilities

- `recipe-url-ingestion`: CLI-driven URL input, optional sample URL seeding, HTML fetching, and local cache behavior for recipe pages.
- `recipe-llm-analysis`: LLM-based transformation of recipe content into ingredients, processing nodes, edges, and structured outputs.
- `recipe-graph-visualization`: Mermaid graph generation and ingredient list output, including a toggle for intermediate states.

### Modified Capabilities

- None.

## Impact

- Adds CLI commands and supporting modules for URL file loading, HTTP fetching, cache storage, content extraction, LLM calls, schema validation, and output rendering.
- Adds project configuration for cache behavior and OpenAI-compatible LLM endpoints.
- Adds sample URL file support for repeatable development and testing, including an explicit helper for populating examples from Chefkoch random recipes.
- May add dependencies for HTTP fetching, HTML parsing/readability extraction, JSON schema validation, and Mermaid text generation.
- No breaking changes are expected because this is a new application capability.

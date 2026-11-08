## Why

Image acquisition already has an `IconGenerator` seam, but configuration, provenance, and workflow construction still assume Codex CLI. A stable prompt-to-image boundary will let the application use the existing agent workflow or a local/remote image engine without exposing transport, model loading, or deployment details to recipe logic.

## What Changes

- Introduce an asynchronous, provider-neutral prompt-to-image contract, typed failures, capabilities, and verifiable provenance.
- Preserve the existing Codex integration and its bounded execution/security contract behind an adapter.
- Add a ComfyUI adapter for an explicitly configured local or remote endpoint using an operator-owned, versioned API workflow template.
- Keep recipe motif resolution, prompt composition, asset validation, caching, and rendering outside provider adapters.
- Preserve existing configuration and asset reuse; add provider-discriminated configuration and backward-compatible metadata.
- Bound submission, polling, downloads, cancellation, and concurrency; never silently retry or switch providers.
- Document native versus container deployment, model/runtime/GPU prerequisites, and a manually authorized RTX 5060 Ti 16 GB smoke test.

## Capabilities

### New Capabilities
- `image-generation`: Provider-neutral request/result contract, capabilities, provider selection, and Codex/ComfyUI adapters.

### Modified Capabilities
- `recipe-icon-library`: Replace Codex-only configuration/provenance assumptions with backward-compatible provider selection while retaining asset integrity, no-generation modes, and per-motif attempt limits.

## Impact

Expected areas: `backend/src/icons`, a provider-neutral backend module, configuration normalization, workflow construction, asset metadata, offline tests, example configuration, and bilingual documentation. Coordinate with the uncommitted `add-semantic-ingredient-icons` work instead of overwriting it. Implementation requires GitNexus impact analysis before symbol edits and tests before production changes. This proposal changes no application code or local runtime settings and starts no services or generation.

Non-goals: model training, a public image service/UI, persistent cross-process jobs, automatic Docker/server provisioning, an arbitrary shell-command adapter, a Diffusers backend, automatic paid fallback, image quality/legal approval, or closing outstanding Codex security acceptance work. ComfyUI remains an external service; containers are packaging, not a provider type.

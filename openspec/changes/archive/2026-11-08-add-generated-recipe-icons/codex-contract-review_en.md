# Codex artifact contract: findings and proposed revision

Status: proposal for review, not an approved replacement for the current requirements. No further live model/image request or production change was performed during this investigation. Tasks remain 2/18 complete.

German: [codex-contract-review_de.md](codex-contract-review_de.md).

## Evidence pinned to the installed version

Upstream tag `rust-v0.167.0` resolves to commit `086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a`. This source review explains the matching release's intended behavior; it is not binary attestation or a successful live image-generation test.

| Finding | Version-pinned source |
| --- | --- |
| `ImagegenArgs` has prompt, transparency and edit-reference arguments, but no destination argument. | [tool.rs](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/ext/image-generation/src/tool.rs) |
| App-server installs the extension with `Some(config.codex_home.clone())` as save root. `exec` uses an embedded app-server client. | [extensions.rs](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/app-server/src/extensions.rs), [exec/lib.rs](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/exec/src/lib.rs) |
| Artifact path is `<save_root>/generated_images/<sanitized thread id>/<sanitized call id>.png`. | [artifact.rs](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/ext/image-generation/src/artifact.rs) |
| With a save root, directories and files are written through `LOCAL_FS` with `sandbox: None`; directory creation follows symlinks. This is not constrained by the command sandbox. | [save_image_generation_result in tool.rs](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/ext/image-generation/src/tool.rs) |
| Completed image items include status, call identity and `saved_path`. Save failure can leave `saved_path` absent despite generated image data. | [tool.rs](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/ext/image-generation/src/tool.rs), [upstream fixture tests](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/app-server/tests/suite/v2/imagegen_extension.rs) |
| `exec --json` maps selected item variants and drops unhandled variants via `_ => None`; there is no image-generation variant mapping. | [event_processor_with_jsonl_output.rs](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/exec/src/event_processor_with_jsonl_output.rs) |
| The tool requests `gpt-image-2` in this release. A request constant is not a verifiably reported underlying model identity. | [tool.rs](https://github.com/openai/codex/blob/086ccc833bc9cf01024ad2dd6af7dbd421b6bf9a/codex-rs/ext/image-generation/src/tool.rs) |

Consequences: the agent's earlier report about the missing output parameter is independently corroborated. Shell sandbox success does not establish internal-tool confinement. A path extracted from final prose or selected by newest-file scanning is not an acceptable artifact contract. The source's executor-local fallback must not be assumed available: the reviewed app-server explicitly supplies a save root.

## Proposed design delta

Replace “Codex itself writes only the designated staging PNG” with two explicit trust boundaries:

1. **Agent command boundary:** enforce staging-only command writes using a tested custom permission profile; no project writes, blanket bypass, or additional general-purpose tool surfaces.
2. **Trusted Codex artifact writer:** explicitly disclose and opt into the version-reviewed writer's limited cache convention. This is a narrowly scoped trust exception for the Codex client, NOT an OS-enforced staging sandbox for its internal writes. It is acceptable only if that trust model is explicitly approved. If OS-enforced confinement of all writes remains mandatory, this approach is rejected and the Codex backend stays blocked.

Acquire structured completed image events through the existing Codex CLI's app-server protocol, subject to a separate compatibility check. Do not introduce a persistent application service. `exec --json` is not sufficient for this release. Use thread/call identity to derive the expected cache path independently and require the event's path to match; then read and validate the artifact into an application-owned designated staging PNG. The generator interface can retain its designated-PNG contract at the adapter output, rather than imposing it on Codex's tool arguments.

Before reading, validate the configured cache root and every existing path component for real-path confinement and symlinks/junctions/reparse points; require a regular bounded PNG and reject suspicious links. Open and validate bytes from the same file handle, with identity checks where supported. Define hardlink/race handling explicitly; if the platform cannot meet it, fail closed. Shared-cache single-writer use is a prerequisite, not a solution to hostile concurrent local processes. Never traverse arbitrary agent paths or discover assets by timestamps.

Leave Codex-owned originals untouched, including on failure. Clean only operation-owned staging. Do not redirect `CODEX_HOME` by copying/linking credential stores: it couples cache and authentication and violates the existing credential-handling constraints. Record the cache retention consequence in user documentation.

## Required changes if this proposal is approved

- Revise proposal/design and the `recipe-icon-library` process-contract requirement to name both boundaries and the explicit trusted-client exception.
- Revise tasks 1.3/3.3 and their German descriptions for structured event handling, exact thread/call path correlation, absent paths, protocol/version mismatch, shared-cache conflicts, junctions/symlinks/hardlinks, races, and preservation of originals. Keep task 1.3 incomplete until fixtures and a bounded authorized live image test pass.
- Prove noninteractive app-server initialization/authentication, effective tool restrictions, event schema, cancellation/process-tree termination, bounded stream parsing and diagnostics before backend integration.
- Verify authentication remains Codex-managed and configuration is not globally mutated. Do not equate image endpoint request-model constants with reported provenance.
- Bound image-tool invocations, not merely adapter launches: the agent could request multiple generations within one turn. Establish an enforceable per-operation tool-call budget or explicitly revise the cost guarantee; a prompt alone cannot enforce one image attempt.
- Keep automated tests offline and retain text-only fallback; no direct API or alternative backend substitution.

## Recommendation and remaining decision

Review and approve/reject the narrowly scoped trusted-client cache exception first. If approved, investigate the app-server protocol without live generation, then request a separate bounded single-image trial once its artifact checks are ready. If rejected or technically infeasible, propose local-only library/rendering as a smaller change, with generation deferred. Neither fallback scope reduction nor protocol integration is implemented by this review.

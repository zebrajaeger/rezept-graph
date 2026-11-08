## 1. Baseline and impact

- [ ] 1.1 Re-read current semantic-ingredient changes, establish offline test baseline, and run/report GitNexus upstream impact for every existing symbol to be edited; warn before HIGH/CRITICAL edits.
- [ ] 1.2 Verify the intended ComfyUI API contract and commit sanitized workflow/history/output fixtures with a documented version; install no runtime or model implicitly.

## 2. Contract and backward-compatible configuration (tests first)

- [ ] 2.1 Add failing tests for provider-neutral results, unsupported controls, provider selection, old Codex configuration, invalid ComfyUI settings, and zero provider activity in off/local-only modes.
- [ ] 2.2 Implement the generic image-generation contract, provider factory, capability validation and discriminated configuration without changing active user configuration.
- [ ] 2.3 Add failing bridge/Codex regression tests, then connect the existing icon interface to the generic contract while preserving Codex process/cache restrictions and attempt limits.

## 3. ComfyUI adapter (tests first)

- [ ] 3.1 Add failing fake-transport tests for workflow bindings, typed prompt substitution, job correlation, designated outputs, explicit execution failure and ambiguous/missing images; implement validated workflow loading and submit/poll behavior.
- [ ] 3.2 Add failing tests for endpoint validation, environment credentials, secret redaction, redirects, unsafe selectors, byte/pixel limits and malformed PNG; implement bounded origin-confined download and staging validation.
- [ ] 3.3 Add failing tests for serial admission, deadline including queue wait, cancellation during each phase, partial cleanup and lost submission responses; implement bounded lifecycle without retries or global interrupt.

## 4. Library integration and provenance (tests first)

- [ ] 4.1 Add failing tests for legacy metadata reuse without rewriting, new provider-neutral metadata, unknown reported models, workflow digest, safe new revisions and reuse after provider changes; implement metadata compatibility.
- [ ] 4.2 Add failing end-to-end offline tests for same-motif deduplication, one provider attempt per run, failure-to-text fallback, unchanged timeline and real renderer error propagation; complete integration.

## 5. Documentation and acceptance

- [ ] 5.1 Add bilingual operating/concept documentation and example configuration for Codex and native/container/remote ComfyUI; explain model/runtime/GPU setup, endpoint trust, cancellation limits and non-guaranteed visual quality. Keep the README concise and update `next_step.md` in German.
- [ ] 5.2 Run full offline tests, typecheck/build, OpenSpec validation and diff review; run GitNexus `detect_changes` before any commit, with commit message based on `add-pluggable-image-generation`.
- [ ] 5.3 Resolve or explicitly waive the optional live smoke test: only after separate authorization, select compatible model/license/workflow and endpoint for RTX 5060 Ti 16 GB, generate at most one image, record measured results/limitations, and perform no automatic additional attempts. A waiver must not claim live verification.

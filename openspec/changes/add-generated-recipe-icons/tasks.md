German translation: [tasks_de.md](tasks_de.md). Implement only after leaving explore mode. For every existing symbol edit, first run GitNexus upstream impact analysis and report direct callers, affected processes, and risk; warn before HIGH/CRITICAL changes. Each implementation step follows its failing tests.

## 1. Establish feasibility and integration boundaries

- [ ] 1.1 Review current working-tree changes and the timeline change; identify shared configuration/presentation/output symbols without modifying unrelated work. Record upstream impact before any symbol edits.
- [ ] 1.2 Add an offline real-rendering test with a known local PNG, asserting visibly embedded icons and retained text in both SVG and PNG after moving outputs away from the library; record a supported Mermaid mechanism or revise the design if portability cannot be achieved.
- [ ] 1.3 Define the replaceable generator interface and establish the installed Codex CLI's noninteractive image-generation, authentication, sandbox, and designated-PNG contract. Write fixture process-runner tests for success, missing CLI/capability/auth, text-only success, invalid/outside artifacts, safe Windows launch/arguments, timeout/process-tree termination, and secret redaction. Do not run live generation without explicit authorization; stop integration if the capability/sandbox contract cannot be proven. Local Docker/model generation remains a separate change.

## 2. Configure and resolve motifs

- [ ] 2.1 Write failing config tests for omitted/off/local-only/generate-missing modes, config-relative paths, Codex executable/profile/optional agent-model settings and finite limits, external Codex-managed authentication, and invalid settings; implement validation/normalization without requiring a direct image API or changing Codex global settings.
- [ ] 2.2 Write failing motif-resolution tests for Ei/Eier, common ingredients, explicit baking/boiling/frying, ambiguous compounds, unrelated IDs, temperature-only nodes, intermediate exclusions, and path traversal; implement conservative canonical resolution.
- [ ] 2.3 Write failing prompt tests for shared style criteria, delimited concepts, and recorded versions; implement the versioned recognition-oriented prompt builder.

## 3. Persist and acquire reusable images

- [ ] 3.1 Write failing bundle tests for valid reuse, changed prompts, relocated libraries, metadata-only clones, absent/malformed metadata, missing/corrupt/oversized images, checksum mismatches, and unmanaged files; implement bounded PNG validation and safe relative storage with documented numeric limits.
- [ ] 3.2 Write failing tests for staged publication, interrupted writes, preserved user files, replacement revisions, and deterministic valid-revision selection; implement recoverable publication and operation-scoped cleanup.
- [ ] 3.3 Implement the Codex CLI process adapter against 1.3, restricting writes to staging, using safe platform-specific launch and bounded diagnostics, terminating the process tree on timeout/cancellation, and validating only the designated PNG. Record CLI/backend and agent identity separately from an image model reported by the tool (otherwise unknown); never silently substitute a direct API or another generator.
- [ ] 3.4 Write failing acquisition tests for generate-once/current-request use, later reuse, missing-image repair, local-only no-network behavior, concurrent same-key requests, and one attempt per motif per run; implement the library orchestration with injected dependencies.
- [ ] 3.5 Write failing tests for provider/storage failures, deduplicated per-run demand with counts/references/reasons, successful repairs, report-write warnings, and credential redaction; implement nonfatal acquisition/reporting.

## 4. Integrate graph illustrations

- [ ] 4.1 Write failing presentation/output tests for optional single icons, unchanged recipe JSON and ingredient text, retained labels/details/cues/edges, hidden intermediates, and icon-off baseline compatibility; implement asynchronous acquisition composition and pure semantic enrichment.
- [ ] 4.2 Extend serialization and real-renderer tests using the mechanism proven in 1.2; implement self-contained image embedding with safe serialization and fixed-input determinism.
- [ ] 4.3 Write failing workflow tests for icon-generation failure with successful five-artifact output, and graph-renderer failure after successful acquisition with existing fatal cleanup; integrate narrowly scoped error handling and warnings.

## 5. Document and verify

- [ ] 5.1 Add German/English documentation and config examples for modes, Codex installation/authentication/image-capability prerequisites and restricted execution, resource limits, image style, provenance/terms caveats, Git image-plus-metadata selection, manual edits/revisions, deletion/regeneration, metadata-only clone recovery, offline behavior, and single-writer limitations. Document local container generation as a separate future change. Update README links and German next_step.md.
- [ ] 5.2 Run typecheck, build, all automated tests, real offline rendering, and package-content/path checks; verify new automated tests need neither live Codex nor paid generation nor recipe network access.
- [ ] 5.3 With explicit user authorization and installed/authenticated image-capable Codex, optionally run a small live trial and inspect a contact sheet of apple, butter, sugar, flour, salt, egg, oven, pot, and pan at target size. Record recognition problems without claiming automatic approval or legal clearance.
- [ ] 5.4 Validate the OpenSpec change, review actual changed scope and timeline compatibility, and run GitNexus detect_changes before any commit. If committing, base the message on `add-generated-recipe-icons`.

## 1. Planning contracts and enrichment (tests first)

- [x] 1.1 Inspect current worktree and run GitNexus impact analysis before modifying each existing symbol; report direct callers, affected flows, and risk, and preserve unrelated edits.
- [x] 1.2 Add failing tests for duration provenance/ranges, unknown durations, process coverage, invalid references/cycles, source readiness conditions, and compatibility with existing analysis fixtures.
- [x] 1.3 Implement separate validated planning-input types and schema without requiring new fields in RecipeAnalysis.
- [x] 1.4 Add failing completion-client tests for enrichment context, estimated labels, separate caching, and invalid-response behavior; then implement enrichment using extracted content and accepted analysis.

## 2. Deterministic single-cook scheduling (tests first)

- [x] 2.1 Add failing dough-and-topping tests proving passive overlap, serialized attention work, intermediate-state dependencies, and deterministic tie-breaking; then implement the pure scheduler.
- [x] 2.2 Add failing tests for attended processes, recurring checks, and a timed intervention after 45 minutes; then reserve attention and prevent conflicting noninterruptible work.
- [x] 2.3 Add failing tests for overlapping preheating, activation during available attention, insufficient warm-up time, and actual-readiness cues; then implement the preheating heuristic.
- [x] 2.4 Add failing tests for approximate elapsed ranges, hands-on/attended totals, endpoint disclosure, and unknown-duration propagation; then implement schedule summaries and assumptions.

## 3. Glanceable cooking view (tests first)

- [x] 3.1 Add failing Mermaid tests for two visual groups, relative times, estimated/source labels, concise actions and amounts, temperatures, readiness conditions, return cues, and no visible calendar dates.
- [x] 3.2 Implement the separate timeline presenter and Mermaid renderer without changing existing graph presentation.
- [x] 3.3 Add a real-render fixture test and generate bread-dough and apple-cake sample SVG/PNG files; inspect readability and adjust layout without expanding into project-management features.

## 4. Additional outputs and workflow integration (tests first)

- [x] 4.1 Add failing writer/workflow tests for all nine artifacts, configured output directories, matching stems, awaited success reporting, and unchanged original five outputs.
- [x] 4.2 Integrate original-output generation followed by enrichment, scheduling, JSON/Mermaid writing, safe image-pair rendering, and CLI path reporting.
- [x] 4.3 Add failing tests for enrichment/validation/image failures with old timeline images; then implement targeted cleanup, preservation of current original outputs and available timeline data, nonzero errors, and no false success.
- [x] 4.4 Verify planning is independent of hidden intermediate graph states and repeated cached inputs produce stable planning exports.

## 5. Documentation and verification

- [x] 5.1 Document the single-person assumptions, extra completion cost/cache, estimate markers, unknown durations, output files, and failure behavior in paired `docs/*_de.md` and `docs/*_en.md`; add concise README links and useful sample images.
- [x] 5.2 Run all automated tests, type checking, build, real Mermaid rendering, and OpenSpec validation; compare the existing cake graph before/after.
- [x] 5.3 Update the German-only next_step.md with run instructions first, a small interesting re-entry task second, and concise current state afterward.
- [x] 5.4 Before any requested commit, run GitNexus detect_changes and review scope; base the commit message on add-single-person-cooking-timeline.

Verification: 91 tests pass, including typecheck, build, real graph/timeline rendering, unchanged original-output characterization, and isolated timeline failures. Bread and existing apple-cake planning images were generated and inspected; original graph renderer and original cake output files were not changed. OpenSpec strict validation and git diff --check pass. GitNexus detect_changes reports medium overall CLI impact; new untracked planning symbols are absent from the existing index, so graph-based scope coverage is incomplete. No commit was requested or created; repeat detect_changes before a future commit. No live LLM smoke run was performed. Pre-existing AGENTS.md/package.json edits and the independently appearing add-generated-recipe-icons change were left untouched.

Visual correction after user review: reuse preparePresentation/renderMermaid for exact existing shapes and palette; replace colored containers, summary node, and dependency web with transparent chronological rows, same-start parallel nodes, and a plain title. A regression test was added first and failed against the old rendering. All 92 tests now pass. Actual apple-cake timeline and both documentation examples were regenerated from existing planning data without another LLM request; original graph files were left unchanged. The earlier verification paragraph records the initial implementation; a successful live CLI run has since produced the actual cake planning data.

# Recipe icons

## Egg states

With the new interpretation/presentation enabled, eggs carry a validated `raw`, `boiled` or `fried` state. Plain eggs default to whole raw eggs with intact shells; explicit boiled/fried eggs remain separate. Supported examples include `3 Eier, Größe M`, `2 rohe Eier`, `2 gekochte Eier`, `hart gekochtes Ei`, `Spiegelei`, `2 gebratene Eier`, `boiled egg` and `fried egg`. Conflicting states, cracked eggs, scrambled/poached eggs, whites and yolks currently retain text rather than incorrectly selecting a whole egg.

New keys: `ingredients/egg-raw`, `ingredients/egg-boiled`, `ingredients/egg-fried`, with matching groups such as `egg-raw-count-3`. Base/group prompts explicitly specify state and depicted form. Badges and group fallback use only the matching state. Interpretation/derivative cache versions include this change. Legacy unspecified `egg` and `egg-count-3` bundles remain preserved but never automatically become state-specific assets. Missing new bundles retain text in local-only; no additional state images were generated. With new features disabled the legacy resolver remains unchanged for compatibility.

Icons supplement existing node containers rather than replace them: ingredient nodes retain their green stadium outline with the icon inside on the left and full text on the right. The application renderer reserves Mermaid layout space, inserts native SVG images/text, and rasterizes that completed SVG to PNG. The `.mmd` contains `inline-icon` comments and placeholders and requires the application renderer; an unrelated Mermaid viewer displays the placeholders only. Text-only graphs preserve their previous output.

## Optional semantic interpretation and quantity variants

Both features default off. Optional fields under `icons` (adjust example values):

```json
"presentation": true,
"interpretation": {
  "enabled": true,
  "baseUrl": "http://localhost:1234/v1",
  "model": "your-small-model",
  "apiKeyEnv": "ICON_LLM_API_KEY",
  "timeoutMs": 10000,
  "maxOutputBytes": 4096,
  "cacheDirectory": "backend/.cache/ingredient-interpretation"
}
```

`presentation` enables quantity/alternative layouts. Independently, `interpretation` enables a separately configured OpenAI-compatible model for unresolved phrases; it never silently borrows the analysis model. Without interpretation, existing recognition remains. Without presentation, interpreted single ingredients can use base motifs, but alternatives remain text.

- Deterministic recognition first. Curated identities: egg, apple, butter, margarine, sugar, flour, salt. Unknowns, mixtures, negations and malformed responses retain text. This is not a general food ontology or a guarantee of correct model interpretation.
- Ingredient/node IDs have no explicit linkage: only node labels supply evidence; no guessed associations borrow quantities. Source facts and labels stay unchanged.
- off bypasses interpretation. local-only uses rules and, when enabled, validated cached interpretations, **never new semantic network calls**. Only generate-missing can issue new explicitly enabled interpretation requests.
- At most one request per distinct input per run, including failures; no automatic retries. Timeout: 1–60000 ms; content limit: 1–65536 bytes, with 4096 additional transport bytes for the protocol envelope. Cache identity includes schema/prompt version, original input, endpoint, model and credential variable name, never its secret. Keep the cache outside originals; its default location is Git-ignored and disposable.
- One egg reuses the base. Two through five permit only requested `egg-count-2` through `egg-count-5` group variants. Larger counts use the base with a locally drawn exact number. Missing groups fall back to base plus number, then text. No speculative variants. Weights, fractions and missing counts remain textual without invented counts.
- Validated butter/margarine alternatives compose individual motifs locally with “oder”, without a generated alternative asset. A missing component retains complete text instead of showing one misleading choice. Badges/compositions are disposable derivatives keyed by versions, counts and component checksums.

Failures remain nonfatal; existing generator limits and display budgets still apply. Local configuration has **not been automatically enabled**. Model quality and visual usability remain pending: [offline trial and separate live authorization](ingredient_icon_trial_en.md).

## Originals, derivatives and demand

Commit original PNGs **together with metadata** under `assets/recipe-icons/`. Small display PNGs are disposable: `icons.displayCacheDirectory` defaults to `backend/.cache/recipe-icons` relative to the config file. Cache and library directories must not overlap. Cache keys combine original SHA-256, resize-rule version, Puppeteer package version and platform/architecture (use the bundled browser; custom browser overrides require clearing the cache). Unchanged inputs reuse validated PNGs across nodes and runs. Changed originals/rules use new keys; deleted/corrupt cache entries rebuild offline with no AI request. Write failures still allow use of the in-memory derivative. Old keys are not automatically removed; deleting this cache is safe.

Demand is recalculated per run from recipe requests and usable original bundles, not solely from artwork or cached derivatives. `backend/outputs/icon-demand.json` and the default cache are already Git-ignored. Keep custom cache/report locations ignored too; do not place them inside the original library. No automatic Git commit or import of historical live-test artwork is performed.

[Deutsch](recipe_icons_de.md) · [Overview](../README.md)

## Choose a mode

Omitted `icons` means off. Existing configuration and text-only recipe outputs remain unchanged. Example block (paths are relative to the configuration file):

```json
{
  "icons": {
    "mode": "local-only",
    "libraryDirectory": "assets/recipe-icons",
    "displayCacheDirectory": "backend/.cache/recipe-icons",
    "reportPath": "backend/outputs/icon-demand.json"
  }
}
```

`off`: no catalog access or generation. `local-only`: reuse validated bundles, never launch Codex. `generate-missing`: explicitly opt into external services/account usage. Add:

```json
"generator": {
  "backend": "codex-cli",
  "executable": "C:/path/to/native/codex.exe",
  "termsReference": "https://openai.com/policies/terms-of-use/",
  "timeoutMs": 120000,
  "maxOutputBytes": 262144
}
```

Optional `profile` and `agentModel` select Codex settings independently of recipe analysis. Profile names must use letters, digits, `_` or `-`. The executable must be native on Windows: `.cmd`, `.bat`, and `.ps1` wrappers are refused. Use the installed package's native `codex.exe`. Only reviewed CLI **0.167.0** is enabled; other versions return text fallback pending contract review. Install/authenticate Codex yourself (`codex login`); this application never logs in, copies credential files, or changes global config. No direct image API configuration is required.

## Safety and limits

The adapter additionally forces `--sandbox read-only`: agent commands need no write access because the application copies the cache image. This stricter bound takes precedence over profile sandbox selection; staging writes belong to the application, not agent commands.

- At most one bounded Codex **session** per motif/program run, sequentially; concurrent same-key requests share acquisition. No application retry. Codex can internally make multiple paid requests: this is not a monetary or single-image-request cap.
- Windows uses explicit MXC command permissions. Agent commands can write staging, not the project. Codex's internal writer is explicitly trusted to write its normal cache outside that command sandbox; this is not OS confinement of all client writes. Unavailable sandbox/capability/auth falls back to text.
- `--ignore-user-config`, ignored exec rules, ephemeral JSON sessions and explicit security overrides reduce inherited behavior. Profiles must be trusted; do not use profiles that enable extra capabilities. Shell/MCP/direct-API prohibition in prompts is guidance, not a universal tool-security boundary. Use a dedicated trusted Codex environment when stronger isolation is needed.
- Fresh session identity comes from JSON events, never prose. A cooperative cache lock and exclusive session reservation reject existing/ambiguous directories. At most 32 entries and exactly one regular PNG; no newest-file search. Links/junctions/hardlinks and detected identity changes are refused. This does not defend against a hostile concurrent local process. **Single-writer use is required**, including other Codex sessions; stale `.rezept-graph-writer.lock` needs manual investigation, not automatic deletion.
- Timeout 1–600000 ms; output 1–1048576 bytes (session parser further limits stream to 256 KiB and lines to 16 KiB). Timeout/cancellation stop the process tree. Raw provider stderr is not logged.
- PNG originals: 4 MiB, maximum 4096 per axis, supported noninterlaced 8/16-bit grayscale/RGB/grayscale-alpha/RGBA; checks include CRC, bounded inflate and row filter bytes. Unsupported indexed/interlaced files are misses, not guessed valid.
- Offline Chromium decoding creates an aspect-preserving display derivative ≤96px/8 KiB (fallback 64/48px), without altering originals. Mermaid source budget 48000 UTF-16 units; overflow icons omitted deterministically, full labels retained. Renderer error cards are fatal even with exit 0. Browser version affects derivative encoding; fixed runtime/input determinism is tested.

HTML `cache.mode: offline` is not a global offline switch: use icons off/local-only, cached analysis/planning prerequisites, and no uncached recipe requests for fully offline operation.

## Bundles and Git

`assets/recipe-icons/ingredients/egg/{image.png,metadata.json}` (and `processes/oven`, `pot`, `pan`). Metadata records relative image path, SHA-256, dimensions, prompt/style, backend/CLI version, requested agent identity, creation time and terms reference. Actual image model is `null` unless verifiably reported; never infer it from the agent model. This is provenance, not legal clearance, ownership or human visual approval.

Commit both PNG and metadata to reproduce artwork. Metadata-only clones yield cache misses; generate-missing can repair them, local-only reports demand. Valid assets remain reusable after prompt changes. Deleting an image permits regeneration, not exact reproduction. Manual edits that break checksum are preserved, not adopted. Replacement goes to `revisions/r000001/` etc.; direct bundle wins when valid, then lexically ordered valid revisions. To use manual art, provide a technically valid bundle with accurate metadata/checksum; no approval UI exists. Originals in Codex cache remain after acquisition.

Publication uses same-filesystem operation staging, image first, metadata last. Interrupted bundles are misses; only operation-owned staging is cleaned. Unknown files are never deleted. Do not run multiple catalog writers.

## Recognition and reports

### Supported realistic labels

Resolution accepts leading positive integer/decimal quantities (dot or comma), fractions (`1/2`, `½`, `1 1/2`) and optional whitespace-separated units `g`, `kg`, `mg`, `ml`, `l`, `TL`, `EL`, `tsp`, `tbsp`, `Stück`, `Stueck`, `piece`/`pieces`. Case, Unicode and spacing are normalized; inputs over 1024 characters are rejected.

Explicit qualifier forms: eggs with `, Größe S/M/L/XL`, `Zucker für den Teig`, `Butter zum Bestreichen`, `weiche Butter`. Examples include `3 Eier, Größe M`, `250 g Mehl`, `1,5 kg Äpfel` and `60 g Butter zum Bestreichen`. Arbitrary suffixes are not stripped. Alternatives such as `Margarine oder Butter`, `Zucker oder Zimtzucker`, mixtures, egg substitute, apple juice and unknown units remain text-only.

Processes recognize standalone action words inside phrases: `backen`, `weiterbacken`, `vorheizen`, `bake`, `baking`, `preheat`; `kochen`, `sieden`, `boil`, `boiling`; `braten`, `anbraten`, `fry`, `frying`. A nonblank action field takes precedence over the label. Device/temperature-only mentions, recognized negations, conditional/optional forms and conflicting actions abstain. This is a bounded rule grammar, not general language understanding.

The sanitized apple-cake fixture yields eight icons across five ingredient nodes and three oven steps (six distinct motifs). Verified offline with test images; this is not new live-generation evidence or completion of the parent change's security acceptance.

Initial conservative vocabulary: egg, apple, butter, sugar, flour, salt and explicit baking/boiling/frying actions. No substring matching for egg substitute/apple juice, no icon from IDs or temperature alone, no intermediate images. Unknown concepts stay text-only. Style: colored factual schematic, clear silhouette/contours, few details, no text/brands/faces/photorealism, approximately 48px display.

The per-run report outside the catalog contains missing canonical key/reason/count and recipe references. Unknown phrase text is not copied into diagnostics; resolved failures use fixed reasons. Successful repairs are absent from demand. Report/storage/generation failures are nonfatal; recipe JSON/ingredient text remain unchanged. Graph renderer failures remain fatal and remove both graph images; timeline processing remains separate.

An authorized single-egg trial succeeded; the full nine-motif contact-sheet trial is optional and not performed. Inspect recognition yourself; technical validation is not aesthetic or legal approval. Check applicable provider terms. Local Docker/model generation belongs to a separate future change.

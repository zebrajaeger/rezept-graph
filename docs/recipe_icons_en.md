# Recipe icons

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

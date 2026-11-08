## Why

Recipe icons currently have inconsistent backgrounds: the three-egg illustration has a white rectangle while butter appears cut out. New icons should blend into colored recipe nodes through actual transparency rather than a background color chosen by the generator.

## What Changes

- Require a transparent PNG background in the central versioned icon prompt.
- Validate actual decoded transparency before publishing newly generated icons; an alpha channel alone is insufficient.
- Reject opaque results with an actionable unmet-demand reason and text fallback, without automatic retries or destructive white-pixel removal.
- Preserve existing bundles and generation budgets; replacement of the existing egg image requires a separately authorized operation.
- Preserve transparency in display derivatives and SVG/PNG rendering.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `recipe-icon-library`: New-generation transparent-background acceptance, explicit prompting, and safe handling of incompatible outputs without invalidating legacy bundles.

## Impact

Affected areas: `backend/src/icons/motif.ts`, PNG inspection, library publication, display-cache regression tests, rendering tests, and bilingual icon documentation. No new provider, public API, active configuration change, model installation, or paid generation is included. Coordinate with `add-pluggable-image-generation`: transparency is an icon-domain output requirement, not a promise that every general-purpose image request requires transparency. Implementation must run symbol impact analysis and follow TDD.

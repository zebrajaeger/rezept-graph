## MODIFIED Requirements

### Requirement: Generation uses a versioned recognition-oriented prompt
Generation SHALL combine a centrally versioned style prompt with a delimited motif description. The style SHALL request colored schematic factual illustrations with strong contours, a clear silhouette, few distinguishing details, a centered motif, a truly transparent PNG background with transparent margins, and recognition at small display sizes. It SHALL forbid opaque white/colored backgrounds, painted checkerboards, and scene backdrops, and discourage photorealism, text, branding, faces, and decoration. Generated assets SHALL pass technical format, decoding, dimension, and byte-limit checks before use. Technical acceptance SHALL NOT be presented as human approval, measured recognizability, or legal clearance.

#### Scenario: Generator receives an egg request
- **WHEN** a missing egg motif is generated
- **THEN** the request includes both the common recognition criteria and egg-specific concept description
- **AND** metadata records the prompt and style version used

#### Scenario: Provider returns unusable content
- **WHEN** an image response is malformed, unsupported, oversized, or undecodable
- **THEN** it is not published or used as a valid asset

#### Scenario: Transparent background is explicitly requested
- **WHEN** any new ingredient, grouped ingredient, or process icon is generated
- **THEN** its versioned prompt requests real PNG transparency with transparent margins rather than allowing a neutral opaque background
- **AND** existing state and group semantics remain intact

## ADDED Requirements

### Requirement: Newly generated icons pass a transparent-background gate
Before publishing a newly generated icon, the library SHALL inspect bounded decoded effective alpha values. Every outermost border pixel SHALL be fully transparent, at least 1% of canvas pixels SHALL be fully transparent, and at least 1% SHALL have nonzero alpha. A channel declaration alone SHALL NOT establish transparency. Inspection SHALL respect existing compressed-byte and dimension limits and bounded decoded allocation. The gate SHALL apply independently of the selected generation backend. Rejected opaque candidates SHALL produce an actionable `background-not-transparent` unmet-demand reason and the existing text fallback without publication, application retries, or destructive white-pixel removal. Existing valid local bundles SHALL remain reusable without this new gate, mutation, or automatic regeneration. Technical acceptance SHALL NOT imply complete visual background segmentation.

#### Scenario: Three eggs have an opaque white rectangle
- **WHEN** a newly generated three-egg PNG is opaque, including RGBA with all alpha values maximal
- **THEN** publication is rejected with the transparency reason and text fallback without another generation attempt

#### Scenario: White foreground on transparency is valid
- **WHEN** an egg or butter illustration satisfies the border and area rules and has white foreground details and antialiased contours
- **THEN** it passes the background gate without removing white foreground pixels

#### Scenario: Token transparency or empty image is insufficient
- **WHEN** a candidate has only an isolated transparent pixel, opaque border pixels, or no visible foreground
- **THEN** it fails the background gate

#### Scenario: Existing egg bundle predates the new policy
- **WHEN** lookup finds an otherwise valid opaque bundle created under an older style version
- **THEN** its bytes and metadata remain unchanged and reusable without a provider call

#### Scenario: Transparency survives display processing
- **WHEN** an accepted transparent icon is resized, retrieved from display cache, and embedded in SVG and PNG recipe exports
- **THEN** its surrounding transparent region reveals the node background rather than a new opaque rectangle

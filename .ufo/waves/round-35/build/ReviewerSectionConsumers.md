CONSUMERS occurrence=2 distinct=2 must_change=proxy-check.layerTerms+regression;proxy-check+SKILL.md+SCORECARD.md active definitions;current layer-axes+executable-scorecard+member-claims-gate semantics

## Findings

### High — current S/R proxy numerator is occurrence-based; preserve the unit distinction in the cutover

Count basis for the verdict line: unique live counter/derivation sites, not every printed representation or fixture. `claims-check`'s aggregate `totals.sections` is one occurrence counter; `proxy-check.layerTerms()` is one occurrence derivation that emits both S and R terms. The two distinct sites are the claims gate's per-row declared-member comparison and the proxy's K numerator.

- **Occurrence: claims diagnostic.** `scripts/claims-check.mjs:486-501` sums `r.sections.length` into `totals.sections`; `scripts/claims-check.mjs:529-535` prints the total and each row's `sections.length`, while `scripts/claims-check.mjs:424-427` repeats the total in the verdict. This is a raw section-object/heading-occurrence total across rows, not distinct file identities and not restricted to in-family entries. It should remain a diagnostic occurrence count; do not use it as the S/R numerator.
- **Occurrence: S/R layer terms.** `scripts/proxy-check.mjs:581-604` increments `sections[layer]` once for every `row.sections` entry with `inFamily === true` (`:595`), then uses those values for both the stanza terms and coverage formulas (`:599-603`). Repeated headings for the same `section.file` across notes/rows therefore receive repeated credit. This is the C1 implementation target.
- **Distinct per row: claims member-count checks.** `scripts/claims-check.mjs:399-407` compares `N members` / `N files` against `new Set(out.sections.map(s => s.file ?? s.heading)).size`. It is row-local (and unresolved headings use their heading token), not a global S/R-layer identity set.
- **Distinct: K layer.** `scripts/proxy-check.mjs:687-724` puts named K identities in a `Set` and returns `named.size`; the header already states the same K member counts once (`scripts/proxy-check.mjs:43-49`). This is the in-repo precedent for deduplicating the numerator.
- `coverage_script` and `coverage_runtime` inherit the current occurrence unit through `layerCoverage()` (`scripts/proxy-check.mjs:567-570, 602-603`). They are not additional section counters.

### Medium — code-only change would leave a reader-facing unit mismatch, but not a proxy bypass

Yes, changing only the S/R computation leaves outputs/prose that a reader could misinterpret: `CLAIMS ... sections=N` remains an occurrence total, while `S_sections`/`R_sections` would become distinct in-family identities. In a compensating duplicate-one/drop-one edit, the claims aggregate may keep the same occurrence total; that total alone cannot prove member completeness. The proxy's new distinct set is what must make the unchanged stanza drift. A `CLAIMS MATCH`/raw total is not a substitute for the proxy verdict, though the claims gate's separate row-local checks can independently reject some mutations.

This coexistence is not a machine-level inconsistency if the units are explicit. Keep `claims-check`'s raw diagnostic; explicitly call it an occurrence count and distinguish it from the proxy's distinct, in-family member identity count. Do not change the claims total to a distinct value: it includes out-of-family and unresolved recorded sections and serves a different diagnostic purpose.

### Low — active contract prose and S/R regression coverage need the same definition

- `scripts/proxy-check.mjs:87-94` documents S/R as a Σ of sections and explains the difference as only out-of-family/unresolved exclusions. Change this definition to distinct in-family `section.file` identities per layer; keep the out-of-family filter.
- `SKILL.md:650-669,756-771` likewise defines a Σ/section sum and presents old S/R readings; revise the active definition and state that the claims gate's `sections` total is raw occurrences. Root `README.md` had no literal section/S/R hit in the text search; it needs no change based on this review.
- `SCORECARD.md:163-189,220-252,309-310` and the current contract explanations in `corpus/knowledge/layer-axes.md:82-87,164-180,287-293,316-318`, `corpus/knowledge/executable-scorecard.md:63-64,303-307`, and `corpus/knowledge/member-claims-gate.md:106-112` still describe occurrence-based proxy terms or say the distinct fix is queued. Update their current-definition/status passages and the live scorecard values as part of the normal re-derivation; leave dated round-history as historical evidence rather than rewriting it.
- S/R hermetic coverage currently checks base layer arithmetic, stanza drift, score response, and out-of-family exclusion (`scripts/proxy-check.mjs:1461-1567`), but the explicit duplicate-one/drop-one distinct regression shown in this file is K-only (`:1760-1773`). Add S and R cases asserting that a duplicate occurrence cannot compensate for a dropped distinct `section.file`; this directly protects C1. The stanza key set/finding names need not change.

## Non-consumers

- `scripts/round-gate.mjs:303-311,326-419` uses “section” for parsing a `## Planned` Markdown block; it does not consume S/R section metrics.
- `scripts/surface-probe.mjs:799-820,847-900` parses and executes SKILL checklist lines, then counts checklist pass/fail items. It does not inspect member-section totals. The checklist commands for proxy/claims only check their declared exit/output substrings (`SKILL.md:613-630`); they are not section-count derivations. `proxy-check`'s separate `C` term counts checkbox lines, not member sections (`scripts/proxy-check.mjs:482-485,747`).
- Root `README.md`: no relevant section-count consumer found by literal search. `corpus/README.md` is a note index, not an S/R numerator derivation.

## Residual risk and verification gaps

The pinned baseline artifact records S occurrence/distinct `86/86` and R `83/83` (`.ufo/waves/round-35/baseline/distinct.txt:1-12`), so unmutated baseline values alone do not exercise the semantic difference; the paired mutation is essential. I did not run a gate, selftest, or shell command. The LSP device is unavailable in this environment (`read xd://lsp` returned “No such tool”; the mounted-device list omitted it). Literal grep was used only as fallback inventory; semantic conclusions above come from direct source reads, not an empty grep result.
# ScoutRfc3339 — S102 opened

Axes: source fidelity; reproducible provenance; scope grounding; SOURCES row compatibility.

## Observed evidence — high confidence

- Opened [RFC 3339 — Date and Time on the Internet: Timestamps](https://www.rfc-editor.org/rfc/rfc3339.txt) with curl. The saved header identifies RFC 3339, Standards Track, July 2002 (lines 7–14).
- UTC fetch start and completion: **2026-10-24T04:03:35Z**, each emitted by `date -u` immediately around the fetch.
- HTTP status: **200**. Effective URL: `https://www.rfc-editor.org/rfc/rfc3339.txt`. No HTML fallback needed.
- Downloaded and saved bytes: **35064**, independently reported by curl and `wc -c`.
- SHA-256: `9ab2b8864a85dca73a88f49b0927bc7bc85f596926e4fd1890905777924e700a` (`sha256sum`).
- Raw fetched bytes: `.ufo/waves/round-52/build/ScoutRfc3339/rfc3339.txt`.
- Fetch receipt: `.ufo/waves/round-52/build/ScoutRfc3339/fetch.txt`.

### One verbatim quote

Section **5.6, Internet Date/Time Format**, saved text **line 422**; five whitespace-delimited words, original internal spacing retained:

```text
date-time       = full-date "T" full-time
```

Supporting definitions in the same section: `full-time` requires `time-offset` (line 420); `time-offset` selects the UTC designator or numeric-offset production (lines 414–415). Thus the quoted date-time production connects to a required offset, not a zone-less local clock. Section 5.7 separately gives month/year-dependent day limits (lines 455–474).

## Proposed full SOURCES.md row

Column order follows `corpus/SOURCES.md:12`. Proposal only; the lane registry was not edited. The seat-requested kind `standard` is preserved below; see the registration compatibility finding.

| S102 | RFC 3339 — Date and Time on the Internet: Timestamps — https://www.rfc-editor.org/rfc/rfc3339.txt | standard | A | grammar + offset rules for fail-closed timestamp validation | §5.6 Internet Date/Time Format, saved text lines 414–422; fetched 2026-10-24T04:03:35Z | A full timestamp requires a UTC designator or signed numeric offset, excluding zone-less wall clocks from this grammar. | mined | 2026-10-24 | 180d | corpus/knowledge/fail-closed-clock-validation.md |

## Registration compatibility finding — high confidence

ScoutTierAudit flagged a conflict between the explicitly requested kind `standard` and the frozen source registry enum. Directly opened `/home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:24-25`: it permits `spec`, `docs`, `paper`, `code`, `tool`, `dataset`, `talk`, `book`, `community`, and `own-work`, but not `standard`. This is an encoding conflict, not a tier/scope defect.

The requested row remains at `.ufo/waves/round-52/build/ScoutRfc3339/sources-row.txt`. A separate frozen-enum-compatible alternative, changing only kind to `spec`, is at `.ufo/waves/round-52/build/ScoutRfc3339/sources-row-spec.txt`. No contract or registry was changed. Tier A remains grounded in the official primary standard and matches the contract's scoped-primary definition (lines 26–29).


## Inference and limits

- **Grounded application:** reject a timestamp missing its offset rather than silently interpreting it in the verifier's local zone.
- **Not an RFC mandate:** finite JavaScript parse results, exact `toISOString()` round-trips, receipt ordering, and receipt-window bounds are application validation policies, not requirements established by this excerpt.
- The lane's fixed three-digit, uppercase-UTC clock representation is a narrower policy than RFC 3339: §5.6 permits variable fractional precision and signed offsets, and discusses lowercase letters (saved lines 413–433). Do not describe every RFC-valid timestamp as necessarily accepted by that lane policy.
- No code/exported contract was investigated; LSP definition/reference tracing was not applicable to this standards-only source extraction.

## Remaining unknowns / boundaries

No missing prerequisite for the assigned S102 fetch, quote, or row proposal. Admission of the proposed row and entry integration belong to the integrating seats; neither is claimed complete here. No build, test, counter, or source-check command was run. Tool installs/updates: **none**.

Report: .ufo/waves/round-52/w1/ScoutRfc3339.md

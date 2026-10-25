# L1Kumitate62.CritC2Regex — C2 subcase 1: JS POSIX-class row regex

Falsification wave round 62 w2, attacking inherited round-61 predicate D61 v1
(`doctrine61-probe.mjs`). Subcase 1 of `CritControlC2.md` (round-61 w1, §1/vacuity):
the probe's row regex `/^\|[[:space:]]*S195[[:space:]]*\|/` is not POSIX whitespace
in JS, so a contract-shaped `| S195 | …` row never matches.

## Counterexample
A fully honest build — census-valid S195 row, real capture pinned with its true sha,
re-grounded entry, README covered and CLEAN — yields `E3 MISS row-absent` + `E4 MISS`
from the frozen probe: `DOCTRINE61_UNMET held=4/6`, exit 1.

## Evidence (scratch only, `/tmp/kumitate-r62-w2/CritC2Regex/`)
Frozen probe copied byte-exact, hash matches the round-61 file:
```
e638e2b932f9d1552484c428131f73ad7efef663b273bad72e1581a30efa1965  .../probe/doctrine61-probe.mjs
```
Scratch fleet: `fleet/shokunin.conf` maps `kumitate|kumitate-shokunin`; lane repo
commits the honest row at rev `eaca1cdce85c9b91995e5dab4fdb3cafef666335`:
SOURCES row `| S195 | Temporal worker versioning pinning — https://example.invalid/temporal-worker-versioning-pinning sha256 c578a312ba15cbb39de9d1e801ca253ee77ae63a131a09e970422ff7ef28b093 | docs | B | temporal | §C2.1 | honest contract-shaped row | mined | 2026-10-25 | 90d | corpus/knowledge/temporal-worker-versioning-pinning.md |`
(NF=13, 11 cells; `body.md` capture sha `c578a312ba15cbb39de9d1e801ca253ee77ae63a131a09e970422ff7ef28b093` pinned verbatim; `body.md` present at `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`).

Census and readme-map (E5/E6 dependencies) are clean:
```
$ sources-census.sh validate --root /tmp/kumitate-r62-w2/CritC2Regex/fleet kumitate
kumitate	ok	/tmp/kumitate-r62-w2/CritC2Regex/fleet/kumitate-shokunin/corpus/SOURCES.md
census_exit=0
$ node scripts/readme-map.mjs
README_MAP: CLEAN files=1 rows=1 covered=1
readme_map_exit=0
```
Frozen probe run (verbatim):
```
$ node doctrine61-probe.mjs /tmp/kumitate-r62-w2/CritC2Regex/fleet/kumitate-shokunin eaca1cdce85c9b91995e5dab4fdb3cafef666335 --census-root /tmp/kumitate-r62-w2/CritC2Regex/fleet
DOCTRINE61: DOCTRINE61_UNMET held=4/6 checks=6 rev=eaca1cdce85c9b91995e5dab4fdb3cafef666335 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 MISS row-absent
 | E4 MISS pin= sha=c578a312ba15cbb3
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=1 rows=1 covered=1
probe_exit=1
```

Byte-exact regex micro-test (literal extracted from frozen probe line 17):
```
frozen regex (probe line 17, verbatim): /^\|[[:space:]]*S195[[:space:]]*\|/
line | frozen v1 match | intended match
contract row (spaces):  | S195 | … | false | true
contract row, no spaces: |S195|…    | false | true
corrupt : after pipe:   |:S195:|…  | true | false
```
Parse: in JS `[[:space:]]` is a one-character class `{[, :, s, p, a, c, e}` followed by
a literal `]` (the `*` binds to that literal `]`), not POSIX whitespace. Hence the regex
can match a row only if the char right after `|` is one of `[ : s p a c e` and the char
before the closing `|` likewise — no census-valid `S195` row (spaces, or bare `S195`)
can ever match.

## Impacted axes
coverage (C2 frontier claim): the named regex defect alone makes E3 (and E4's row-find)
unsatisfiable for every census-valid Registry row ⇒ honest builds are always
`DOCTRINE61_UNMET` (observed `held=4/6`), and any v1 `DOCTRINE61_HELD` requires E3 to
have matched a malformed/non-contract row (e.g. `|:S195:|`) or an off-Registry phantom —
i.e. false provenance. The frozen negative control `ctl-c2-unopened-row.txt` passes for
the same wrong reason; it is non-vacuous only if a positive control reads HELD.

## Does subcase 1 independently prevent D61 from verifying?
Yes. Independently of the shifted-cell-index, phantom-row, worktree-vs-rev, and
partial-hash defects, subcase 1 alone guarantees: E3 always `row-absent` for any honest,
census-valid row ⇒ an honest build can never read `DOCTRINE61_HELD` under v1, so the
judge must reject a v1 HELD at face value.

## Smallest safe correction (disclosed v2)
E3/E4 row regex → `/^\|\s*S195\s*\|/` (or explicit `[ \t]`), restricted to lines inside
`## Registry`; re-record the negative control against v2 with a positive control (a0 must
read HELD). (Remaining per-subcase fixes — cell indices, rev-bounded capture/readme-map,
census root — belong to sibling subcase reports, not this one.)

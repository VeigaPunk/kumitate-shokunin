# ATTACK SecUfoDrills verdict=holds defects=0

Target: the re-anchored S8 member section `## `scripts/ufo-drills.mjs`` in
`corpus/knowledge/remaining-scripts-census.md` (round-35 edit vs base master
`1770305fae20826b39905a8251ddeca6b4957ac4`; census diff = 624 lines for the
whole note). Upstream read ONLY via the pinned clone at `31c465f1`
(`/fast/scratch/kumitate-r35/src`, detached; base `964f443e` via `git show`).
Axes named: coverage:script-layer (attack axis), operability (collateral —
the section feeds the S_sections distinct-identity claim C1). No lane files
edited; no tools installed (nothing to record).

## Anchor-by-anchor verification at 31c465f1

Every `:N` anchor in the census body line 670 was read verbatim at the pin
(`git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-drills.mjs | sed -n 'Np'`):

| Census claim (census:670) | Pin line read | Verdict |
|---|---|---|
| `main` (`scripts/ufo-drills.mjs:1561`) | `function main() {` | ok |
| `parseArgs` (`:1518`) | `function parseArgs(argv) {` | ok |
| `DRILLS_USAGE` (`:1507`) | `const DRILLS_USAGE =` | ok |
| `EXECUTORS` (`:107`) | `const EXECUTORS = new Set(["self-iter", "sync-check", "cargo-test", "node-test", "judge-handoff", "shell"]);` — exactly the six named executors | ok |
| `SHADOW_PATHS` (`:76`, iterated at `:519`) | `const SHADOW_PATHS = [` / `for (const rel of SHADOW_PATHS) {` inside `buildShadow` | ok |
| `wiredCount` (`:1696`), checks `:1705-1710` | `const wiredCount = suite.counts.pass + suite.counts.fail;` (1696); 1705 `if (suite.counts.pending > wiredCount) {` → 1708 breach push, 1709 `if (suite.counts.referenced > wiredCount) {` → 1712 push — the cited range 1705-1710 covers both breach checks | ok |
| top-level catch, exit 2 (`:1727-1731`) | 1728 `} catch (error) {`, 1729 `if (error instanceof DrillFormatError) {`, 1731 `process.exit(2);` | ok |
| rethrow, exit 1 (`:1733`) | `throw error;` → uncaught at top level → exit 1 | ok |

Semantic clauses spot-verified beyond the anchor lines:

- "parses strict argv": `parseArgs` body 1518-1560 fails on unknown args
  (`:33 fail(unknown argument)`), exclusive `--help` (`:5-7`), exclusive
  `--self-test` (`:36-40`), duplicate/empty `--only` (`:23`, `:31`).
- "no OMP, OAuth or network": header comment `:4-5` states it; scan for
  `fetch(|https?://|net.connect|axios` over the pinned file → only the usage
  text echo `:1511` and header `:5`; no network client code. `grep -in oauth`
  → the same two comment lines only.
- "executes `drills/<id>.drill.json`": `drillsDir` = `join(root, "drills")`
  (`:67`), loader filters `name.endsWith(".drill.json")` (`:803`), id-vs-file
  name check `:817`.
- Coverage invariant semantics: breaches recorded and `failed = true` →
  `process.exitCode = 1` (`:1723`); full-run-only gate confirmed at `:1704`
  (`if (only === null)`), so an `--only` diagnostic run never trips it —
  the claim "full-run coverage invariant" is accurate.
- `DrillFormatError` class defined at `:171`; `throw new DrillFormatError`
  at `:174`; `instanceof` checks at 1312, 1329, 1361, 1389, 1729 — all
  inside the file, consistent with the claim.

## Population-table row vs `wc -l` at the pin

- Census `:157` `| `scripts/ufo-drills.mjs` | 1734 | tool |` — read verbatim.
- `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-drills.mjs | wc -l` → **1734**.
- Base for the history trail: same command at `964f443e` → **1726** (matches
  FidUfoDrills.md "file 1726 → 1734 lines, verified wc -l").
- Table value equals `wc -l` at the pin exactly. ok.

## Removed clauses: trace kept, no false residue

Master paragraph (extracted from base master tree) named three anchors that
do not exist at the pin:

- `boundaryRefusal` / `DRILLS_REFUSAL_SCHEMA` (`:110`) — `grep -cE
  'boundaryRefusal|DRILLS_REFUSAL_SCHEMA|UNEXPECTED_ERROR'` → **0** at both
  `964f443e` and `31c465f1`. These symbols never existed at either revision;
  they were artifacts of a pre-shrink file revision (the ~4xxx anchors were
  out of bounds at base, file ≤1726 lines).
- `UNEXPECTED_ERROR` (`:4649`) — same grep → 0 at both revisions.

Round-35 census body keeps the trace with three explicit removal markers and
one re-anchor marker, all verbatim in census:670:

```
(round 35: removed boundaryRefusal — absent at 31c465f1)
(round 35: removed DRILLS_REFUSAL_SCHEMA — absent at 31c465f1)
(round 35: removed UNEXPECTED_ERROR — absent at 31c465f1)
re-anchored at 31c465f1 (round 35)
```

The replacement exit-code contract is stated exactly as the pin implements
it (`DrillFormatError` → exit 2; rethrow → exit 1; no typed refusal line).
The old paragraph's true content (`main` strict argv, six-executor
`EXECUTORS`, `SHADOW_PATHS`, `wiredCount` invariant, DrillFormatError exit 2)
survived the rewrite — nothing verbatim-true was silently dropped, and the
one behavior word ("never a pass" honesty framing) is preserved by the
new "full-run coverage invariant" clause with the same mechanics.

## Revision labels

The section keeps its provenance trail: re-anchor marker at the pin
(above). No stale revision label remains inside the section body (the only
`964f443e` reference left in the S8 area of the note is the intentional
history bullet block for departed members — not this section). The header
claim of the section is the pinned revision, matching the round's binding
source pin.

## New false claims: none found

Every observable claim in the round-35 body maps to verifiable pin state;
none contradicted. FidUfoDrills.md (wave-1) reported anchors=10 ok=3
moved=4 gone=2 — its "moved" targets are exactly the anchors that now
resolve (1561/1518/1507/107/76+519/1696), and its "gone" items are exactly
the three removed-clause markers; the round-35 census body matches that
fidelity report 1:1. No claim invented beyond pin state.

## Gate cross-check (observability, not the attack itself)

`node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row S8`
→ `CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=60 adv=0)`, exit 0 — the
section's file anchors all resolve at the pin (no SECTION_DEAD_ANCHOR /
SECTION_FILE_UNRESOLVED for this row), consistent with this attack.

## Verdict

verdict=holds, defects=0. The re-anchored S8 ufo-drills section is
semantically true at `31c465f1`: all seven body anchors point at their
named symbols, the population-table count (1734) equals `wc -l` at the
pin, all three removed clauses carry explicit removal traces with the
symbols verifiably absent at both read revisions, and no new false claim
was introduced. C2's script-layer arithmetic for this member (88/88 S,
census cell 60) is corroborated by the independent claims gate.

## Commands run (transcript)

- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff master -- corpus/knowledge/remaining-scripts-census.md` (624 lines; hunk for this section at diff lines 478-482)
- `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-drills.mjs | wc -l` → 1734; `… 964f443e:…` → 1726
- `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-drills.mjs | sed -n '<each cited line>p'` (all anchors above, each verified verbatim)
- `git -C /fast/scratch/kumitate-r35/src diff 964f443e 31c465f1 -- scripts/ufo-drills.mjs` → 2 hunks (ufoBin UFO_CLI_BIN override, fixturePath move), +10/−2 — no census claim depends on either
- `grep -cE 'boundaryRefusal|DRILLS_REFUSAL_SCHEMA|UNEXPECTED_ERROR'` at both revisions → 0/0
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show master:corpus/knowledge/remaining-scripts-census.md` (master paragraph extraction for trace comparison)
- `node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row S8` → MATCH, exit 0

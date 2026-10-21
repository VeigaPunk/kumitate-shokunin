ATTACK scripts/ufo-route-preflight.mjs verdict=holds defects=0

Axis: coverage:script-layer only (leaf member; C1 operability and C3 kimi-layer untouched). Pure read-only falsification; no lane file edited, no scratch mutation, no tool installed (none needed).

# Target

Round-35 edit of `## \`scripts/ufo-route-preflight.mjs\`` in
`corpus/knowledge/remaining-scripts-census.md`:
- working section heading :749, body :751, next heading :753;
- population-table row :169 (`| \`scripts/ufo-route-preflight.mjs\` | 177 | tool |`);
- master body `master:779` (`176 L`; `:32`; `:54`; `origin HEAD \`964f443e\``);
- master table row `master:150` (`176`).

`git diff master` on this member is exactly two lines: the table count `176 -> 177`, and
the body line re-anchored `:32 -> :33`, `:54 -> :55` plus `was 176 @ 964f443e` and
`re-anchored at 31c465f1 (round 35)`.

# Every claim, re-derived at 31c465f1

Source pin verified: `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` ->
`31c465f15669f744848bd9f5d56191c5085670f7`.

| # | claim in section | command | observed output | verdict |
|---|---|---|---|---|
| 1 | `177 L` | `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-route-preflight.mjs \| wc -l` | `177` | holds |
| 2 | `was 176 @ 964f443e` | same at `964f443e` | `176` | holds |
| 3 | `ROUTE_PREFLIGHT_SCHEMA` at `scripts/ufo-route-preflight.mjs:33` | `... \| sed -n '33p'` | `export const ROUTE_PREFLIGHT_SCHEMA = "ufo-route-preflight-v1";` | holds |
| 4 | `routeFamilies` at `:55` (continuation bound to this member by the heading/`:N` grammar) | `... \| sed -n '55p'` | `export function routeFamilies(laneCounts, routing) {` | holds |
| 5 | population-row count equals `wc -l` | row :169 vs #1 | `177 = 177` | holds |
| 6 | kind `tool` | pin `:1` shebang; exported defs `:33,38,55,91,116,144` | `#!/usr/bin/env node`; no `node:test` import | holds |
| 7 | `Live S8 member` | recomputed S8 = script layer(88, `git ls-tree`) − S1–S7(28, note block :39-66) | target in S8, set size `60` | holds |
| 8 | `re-anchored at 31c465f1 (round 35)` | pin `rev-parse`; anchors #3/#4 | correct revision and lines | holds |

Base-side control: at 964f443e the same two lines are `:32`
(`export const ROUTE_PREFLIGHT_SCHEMA = "ufo-route-preflight-v1";`) and `:54`
(`export function routeFamilies(laneCounts, routing) {`), so the stated base anchor pair
in the diff is also true.

# Revision label and removed-clause trace

- Original label kept twice: `was 176 @ 964f443e` and `re-censused 2026-10-14 against
  \`964f443e\``. Both halves are true (176 at base; the historical census wording is the
  master original, unaltered except the dropped `origin HEAD` qualifier).
- Upstream drift is one commit, comment-only: `git -C /fast/scratch/kumitate-r35/src diff
  --numstat 964f443e 31c465f1 -- scripts/ufo-route-preflight.mjs` -> `4 3`, matching the
  frozen row `s-modified-members-55.tsv:38` (`+4/-3`). `git log --oneline 964f443e..31c465f1
  -- scripts/ufo-route-preflight.mjs` -> `3ddd6b3 route-trial: one route grammar,
  effort-less hops, mirror-drift preflight`. Hunk `@@ -23,9 +23,10 @@` replaces the header
  claim “refuses effort-less hops as a usage error” with “an effort-less hop is probed
  without \`--thinking\` …”; no code line moved, net +1 line, which is exactly the +1
  anchor shift observed at #3/#4.
- Removed clauses: the note carried none of the removed header behaviour, so no
  `(round 35: removed …)` trace is owed here. `grep -n "effort-less\|WO-2\|usage error"
  corpus/knowledge/remaining-scripts-census.md` hits only line 641
  (`prepare-ephemeral-l1.mjs`, unrelated). The file's 12 such traces all belong to
  members whose note prose did assert the now-absent symbols (`emitFor`, `STALE_MS`, …).

# New-claim audit

- No new claim beyond the re-anchored numbers, `was 176 @ 964f443e`, and the trailer; each
  is verified above.
- [INFERENCE] The mid-sentence `re-censused 2026-10-14 against \`964f443e\`` now sits next
  to pin numbers (177 / :33 / :55). It remains a true historical statement, and the
  `was` clause plus the `re-anchored at 31c465f1` trailer scope the two revisions; the
  same sentence shape is used by the sibling `:755` and `:762` sections, so this is the
  family convention, not a second one. A reader checking it against 964f443e finds
  176 / :32 / :54 — exactly what the parenthetical and the diff already say. Not a false
  claim; no fix required. (The target is in fact stricter than its siblings: it dropped
  `origin HEAD`, which is no longer true of 964f443e at this pin.)

# Gate cross-checks (lane tree, pinned `--src`, all read-only)

```
$ node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row S8
ROW S8   form=section   notes=1 sections=60 adv=0
SUMMARY: errors=0 warnings=0
CLAIMS: MATCH (rows=1 yes=1 notes=1 sections=60 adv=0)

$ (note's own Arm-2 probe logic, re-implemented independently in-process)
HEADINGS: 60  MEMBERS: 60  DUPLICATE: 0
MEMBER_PROBE: 60/60 ok            # no BAD row for ufo-route-preflight.mjs

$ node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src
PROXY: MATCH (A=7 C=13 operability=8; C1=19/19 C2=79/79 coverage=10;
S=88/88 coverage:script-layer=10; R=83/92 coverage:runtime-layer=9;
K=51/51 coverage:kimi-layer=10; pins=6 match)

$ node scripts/proxy-check.mjs --selftest
PROXY_SELFTEST: 107/107 pass
VERDICT: PASS
```

Whole-note arithmetic re-derived: 60 table rows sum to `33367` = the declared total;
classes `22 suite / 30 tool / 3 shim / 4 asset / 1 doc`; target heading occurs exactly
once (`grep -c` = 1); declared-set listing `:438` unchanged; section is blank-line
delimited and carries two own-file anchors plus two verbatim symbols, satisfying the
note's stated family standard (`:19-21`).

# Remaining unknowns

- None for this member's anchors, count, kind, membership, revision labels, or the
  section's contribution to `S_sections` / `coverage:script-layer=10`.
- The sibling `ufo-route-preflight.test.mjs` line (`:755`, `probeFamilies :134` vs
  `ExecFidelitySweep.md:74` proposing `:113`) is a different member owned by
  `SecUfoRoutePreflightTest`; not judged here.

Verdict: holds. The re-anchor is faithful to the pin, the original revision label is
kept, the removed upstream behaviour was never claimed in this note, and no new false
claim was introduced.

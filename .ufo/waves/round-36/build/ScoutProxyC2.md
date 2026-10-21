C2-DELTA notes=80 rows=79 missing=corpus/lessons/round-35-verifier-spotcheck.md

# ScoutProxyC2 — the `C2_TOTAL_DRIFT declared=79 computed=80` term and the one missing README row

Read-only scout. No lane/git/jj write; the only file written is this report.

## Why the term fires (observed)

`scripts/proxy-check.mjs:755-756` derives two different censuses:
`C2 = countLines(readmeText, RE_README_ROW)` over `corpus/README.md`, `C2_total = notes.length` over
`*.md` files under `corpus/knowledge` + `corpus/lessons` (`listCorpusNotes` → `walkFiles`, recursive,
sorted). `RE_README_ROW = /^\| `(knowledge|lessons)\//` (`:330`) is line-anchored at column 0.

```
$ node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r36/src ; echo EXIT=$?
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=79 computed=80 delta=+1
PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9
PROXY  warn  PIN_UNPINNED  scripts/sources-check.mjs has no pin.<name> key in the kumitate-proxy-v1 stanza
PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=79 computed=80 delta=+1; AXES_DRIFT term=coverage declared=10 derived=9; PIN_UNPINNED term=scripts/sources-check.mjs)
EXIT=1
```

Byte-identical to `.ufo/waves/round-36/baseline/proxy-pin.txt` (and `proxy-default.txt`), so the
drift is tree-local, not pin-local. Arithmetic: `coverage = floor(10 × C1/C1_total × C2/C2_total) =
floor(10 × 19/19 × 79/80) = 9` vs the `## Axes` row `coverage = 10` (`SCORECARD.md:314`) — **the
`AXES_DRIFT` error is the same single miss** and clears when the census reads 80/80, with no axis
edit. `C1=19/19` and `C2=79` are each declared == computed; only the denominator is off.

Root cause: commit `0614092e0804aaca06642cb3a263a05c1cacc98e` (current master head, "round-35
verifier spot-check (integrator, hyaku)") added exactly one file and no row.

```
$ git show --name-status --format='%H %s' 0614092 -- corpus/
0614092e0804aaca06642cb3a263a05c1cacc98e round-35 verifier spot-check (integrator, hyaku): non-author admit/reject
A	corpus/lessons/round-35-verifier-spotcheck.md
$ git log --oneline -1 -- corpus/README.md
4c9e407 round-35: distinct S/R derivation; S8 re-census at pinned 31c465f1; …
```

So the note files went 79 → 80 while rows stayed 79, and `SCORECARD.md:288` `C2=79` / `:289`
`C2_total=79` still declares the pre-note pair.

## Commands and the only-miss proof

```
$ grep -c '^| `\(knowledge\|lessons\)/' corpus/README.md            -> 79
$ find corpus/knowledge corpus/lessons -maxdepth 1 -name '*.md' -type f | wc -l   -> 80
$ (knowledge 40) (lessons 40); find … -mindepth 2 -name '*.md' | wc -l             -> 0  (no nested notes)
$ LC_ALL=C grep -oP '^\| `\K(knowledge|lessons)/[^`]+(?=`)' corpus/README.md | LC_ALL=C sort -u   -> rows (79)
$ LC_ALL=C find corpus/knowledge corpus/lessons -maxdepth 1 -name '*.md' -type f | LC_ALL=C sed 's|^corpus/||' | LC_ALL=C sort -> notes (80)
$ LC_ALL=C comm -23 notes rows   -> lessons/round-35-verifier-spotcheck.md      (note with no row)
$ LC_ALL=C comm -13 notes rows   -> (empty)                                     (row with no note)
$ LC_ALL=C sort rows | uniq -d   -> (empty)                                     (duplicate rows)
```

**Yes — the round-35 verifier note row is the only miss.** Exactly one note lacks a row, zero rows
point at a missing file, no duplicate rows: the 79/80 gap is entirely
`corpus/lessons/round-35-verifier-spotcheck.md`. `lessons/round-35.md` itself is rowed at
`corpus/README.md:94`; the *verifier* note is the one that landed without a row. Same class as round
34, whose verifier row (`corpus/README.md:93`) records it: "row added in round 35 … `C2_TOTAL_DRIFT`
77→78".

### The 80 corpus note files (`knowledge` 40 + `lessons` 40, `LC_ALL=C` sorted)

```
knowledge/cost-and-profile.md knowledge/dispatch-shapes.md knowledge/distill-and-l3.md knowledge/enqueue-admission.md knowledge/executable-scorecard.md knowledge/failure-telemetry.md knowledge/gate-verdict.md
knowledge/kimi-binary-secrets.md knowledge/kimi-config-plane.md knowledge/kimi-lane-definitions.md knowledge/kimi-mcp-plane.md knowledge/kimi-modes-machinery.md knowledge/kimi-residue-files.md knowledge/kimi-session-state.md
knowledge/kimi-skills-plugins.md knowledge/layer-axes.md knowledge/live-surface-probe.md knowledge/local-ship.md knowledge/loop-driver.md knowledge/member-claims-gate.md knowledge/native-admission-detail.md
knowledge/native-judge-pipeline.md knowledge/native-transcript-ledger-seats.md knowledge/native-trial-launch.md knowledge/omp-task-contract.md knowledge/ops-watchers.md knowledge/queue-and-claim.md knowledge/queue-summary.md
knowledge/reconcile-and-cycle.md knowledge/remaining-scripts-census.md knowledge/round-close-gate.md knowledge/route-probe-cluster.md knowledge/route-resolution.md knowledge/runtime-remainder-census.md knowledge/runtime-support.md
knowledge/sighting-wall.md knowledge/singleton-and-queue-ownership.md knowledge/successor-chain.md knowledge/swarm-wave-lifecycle.md knowledge/test-inventories.md
lessons/round-1-aggregator-audit.md lessons/round-1.md lessons/round-10.md lessons/round-11.md lessons/round-12.md lessons/round-13.md lessons/round-14.md
lessons/round-15.md lessons/round-16.md lessons/round-17.md lessons/round-18.md lessons/round-19.md lessons/round-20.md lessons/round-21.md
lessons/round-22.md lessons/round-23.md lessons/round-24.md lessons/round-25.md lessons/round-26.md lessons/round-27.md lessons/round-28.md
lessons/round-29.md lessons/round-3.md lessons/round-30.md lessons/round-31.md lessons/round-34-verifier-spotcheck.md lessons/round-34.md
lessons/round-35-verifier-spotcheck.md lessons/round-35.md lessons/round-4-aggregator-audit.md lessons/round-4.md lessons/round-5-aggregator-audit.md
lessons/round-5-aggregator-mirror-out-of-province-membrane-seal.md lessons/round-5.md lessons/round-6-aggregator-audit.md lessons/round-6.md lessons/round-7.md lessons/round-8-aggregator-box3-coldrun.md
lessons/round-9-aggregator-corpus-verdict.md lessons/round-9.md
```

(The 40 knowledge entries are `knowledge/*.md`; the 40 lessons entries run `round-1`…`round-35` by
`LC_ALL=C` order, which is why `round-3.md` sits after `round-29.md`.) Corpus note dirs hold no
subdirectories, so this list is the exact `listCorpusNotes` set.

### The 79 README map rows

`corpus/README.md` (keys from the `grep -oP` above, same sort) is **the identical list minus
`lessons/round-35-verifier-spotcheck.md`** — the whole difference, proven by both `comm` directions
plus the empty duplicate check. 79 row keys, 79 distinct, each resolving to an existing note file.

## The row to add (literal; one line; copy verbatim)

Insert at `corpus/README.md:95`, immediately after the `lessons/round-35.md` row (`:94`), before the
blank line (`:96` = `## Known gaps`). Table shape `| Entry | Covers | Primary sources |`; ordering
convention is round note then that round's verifier note (`:92` round-34, `:93` round-34-verifier,
`:94` round-35).

```
| `lessons/round-35-verifier-spotcheck.md` | Round-35 non-author verification written by the hyaku integrator (@m_opus), not the lane: PROTOCOL step-1 conformance, per-claim re-check of C1 (distinct S/R member derivation), C2 (script-layer 9→10 at the pinned origin) and C3 (K1 registry 3→4, root shape-only member), a 4/4 discernment spot-check (3 admits + 1 reject, all `agree`), trend verdicts, and 4 routed defects; row added in round 36 (it landed without one, `C2_TOTAL_DRIFT` 79→80) | commit `0614092`; fleet `.ufo/reports/round-35/kumitate.md` @ `00b0344` |
```

Content comes from the note itself: header `author: hyaku closure (non-author integrator, @m_opus)`
/ `lane-head: 4c9e4075…` / `report: .ufo/reports/round-35/kumitate.md @ 00b0344…`; headings
`## Conformance (PROTOCOL step 1)`, `### C1 — … distinct S/R member derivation`, `### C2 — …
script-layer 9 → 10 at the pinned origin`, `### C3 — … K1 registry 3 → 4 (root mcp.json,
shape-only)`, `## Discernment spot-check` (S021/S022/S023 admit + S020 reject, 4 × `agree`),
`## Trend verdicts`, `## Routed defects` (4 numbered). Both externals verified: `0614092` is the
commit that added the note; `/home/vgpnk/Projects/shokunin/.ufo/reports/round-35/kumitate.md` exists
(fleet), `00b0344` exists in the fleet repo.

## Companion stanza edit — the row alone does NOT green the gate

`C2_TOTAL_DRIFT` is the *denominator* (`notes.length`), which the row never changes. Row only ⇒
`C2` declared=79 computed=80 **and** `C2_total` declared=79 computed=80 (`compareTerms` fires one
`_DRIFT` per key). Move both keys in the same edit:

```
SCORECARD.md:288  C2=79        -> C2=80
SCORECARD.md:289  C2_total=79  -> C2_total=80
```

Then `C2=80/80`, derived `coverage = floor(10 × 19/19 × 80/80) = 10` = `## Axes` row
(`SCORECARD.md:314`), so `AXES_DRIFT` clears too; only the pre-existing `PIN_UNPINNED` warn remains
(warn ≠ error without `--strict`: `summarize` → `drift = errors > 0 || (strict && warnings > 0)`) ⇒
`PROXY: MATCH`, exit 0. Do not touch `LOG.md:1613`/`:1620` (`C2 77 → 79/79`, `C2=79/79` — true at
`4c9e407`). `grep -n '79/79\|C2=79\|C2_total=79' SCORECARD.md SKILL.md LOG.md` finds only those two
stanza lines plus the two LOG history lines.

## Mechanical checks on the proposed row

Row extracted from this report, replayed in memory against `corpus/README.md` (no file written):

```
len=565 RE=true pipes=4 rows_before=79 rows_after=80 · coverage_before=9 coverage_after=10   (floor(10×19/19×79/80) → floor(10×19/19×80/80))
```

The row must stay one line: `countLines` splits on `\n` and the regex is line-anchored, so a wrapped
row still reads 79. Citation-gate safety: `cite-check.mjs` exempts `.ufo/…` as a workspace prefix
(`WORKSPACE_PREFIX_RES`, `scripts/cite-check.mjs:199-202`, `/^\.ufo\//`), `0614092` is the same
7-hex commit shape the round-34 verifier row already carries (`corpus/README.md:93`, `a5683a9`), the
first cell follows the 79-row precedent, and no symbol/line anchors are introduced (no new
`SYMBOL_MISS` surface). [INFERENCE] `cite-check` was not executed against a tree containing the row
(read-only seat); that argument is by token shape and precedent.

## Confidence / remaining unknowns

- Observed: 80 notes / 79 rows, the single missing note, stanza `:288-289`, derived coverage 9 vs declared 10, `0614092` adding only the note, row matches `RE_README_ROW` and yields 80/80, `.ufo/` cite-check exemption. [INFERENCE] none material; "no other row missing" is observed (both `comm` directions + no dups).
- Open for the L1: if the claim run uses `--strict`, the surviving `PIN_UNPINNED` warn keeps `PROXY: DRIFT`; the baseline runs are non-strict and the target names `PROXY: MATCH`, so non-strict is the consistent reading. `.ufo/pins/origin.json` does not exist yet (`ls .ufo/pins` → absent), so the `src-rev=` segment comes from `ExecProxyPin`, not from this row fix.

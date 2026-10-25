# Audit13 — Source-UsedBy (S195 used-by resolution + README/pin presence)

Round 61 wave 2, seat Audit13 (reviewer). Axes: operability, coverage. Leaf member; no subagents; no installs.
Target claim (w2-spec `Audit13`): *"Check S195 used-by resolves to exactly the new entry and that the entry is present in README+readme-map pin. Report specific counts."*
Plan predicate under test: `DOCTRINE61_HELD` E3 ("its `used-by` names exactly that entry") + E6 (README map row + readme-map CLEAN), `.ufo/waves/round-61/plan.md:66-78`.

## Verdict

**Working-tree data: VERIFIED.** S195 `used-by` names exactly `corpus/knowledge/temporal-worker-versioning-pinning.md`, the file exists, reciprocity holds, the entry is present once in `corpus/README.md` and once in `.ufo/pins/readme-map.json`, and both gates exit clean.
**Provenance caveat: the entire evidence set is uncommitted working-tree state** at HEAD `be4a820`; the frozen probe cannot see it and, independently, its E3 is miscoded so it could never observe a correct used-by cell.

## Counts (all measured live, working tree)

| Check | Command / evidence | Count / result |
|---|---|---|
| SOURCES rows whose used-by cites the entry | `awk -F'|' '/^\| S[0-9]+/` used-by col match | **1** — row S195, `corpus/SOURCES.md:147` |
| Paths inside S195 used-by cell | cell parse (`split('\|')`) | **1** — `corpus/knowledge/temporal-worker-versioning-pinning.md`, single value, no list |
| S195 row status / opened / recheck | same row | `mined` / `2026-10-25` / `90d` — matches E3 data requirement |
| Entry file on disk | `stat` | exists, 3057 bytes, mtime 2026-10-25 07:58 |
| Knowledge-dir files matching `*temporal*` | `ls corpus/knowledge/` | **1** — the entry itself |
| Other SOURCES rows citing the entry | used-by column scan | **0** |
| Entry `source:` header reciprocity | `corpus/knowledge/temporal-worker-versioning-pinning.md:1` | `source: S195 — https://docs.temporal.io/worker-versioning.md …` — bidirectional |
| `sources-check` used-by diagnostics | `node scripts/sources-check.mjs` | exit **0**; `SOURCES_CHECK: CLEAN rows=134`; **0** USED_BY_MISSING and **0** USED_BY_ASYMMETRY for S195 (2 unrelated asymmetry warnings: S028, S124 → `corpus/knowledge/failure-recovery-replay.md`) |
| Entry occurrences in `corpus/README.md` | `grep -n` | **1** — line 182, row cites `S195` + `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/` |
| S195 occurrences in `corpus/README.md` | `grep -c '\bS195\b'` | **2** — lines 182 (entry row) and 183 (round-61 lesson row) |
| Entry in `.ufo/pins/readme-map.json` `covered` | JSON parse | **1** — `knowledge/temporal-worker-versioning-pinning.md` at index 52 of 148, alphabetically between `successor-chain.md` and `swarm-wave-lifecycle.md`; `version: 2` |
| readme-map gate | `node scripts/readme-map.mjs` | `README_MAP: CLEAN files=148 rows=148 covered=148`, exit **0** |

Exact row (`corpus/SOURCES.md:147`), used-by cell last:
`| S195 | Worker Versioning — Temporal documentation — https://docs.temporal.io/worker-versioning.md | docs | A | … | mined | 2026-10-25 | 90d | corpus/knowledge/temporal-worker-versioning-pinning.md |`

## Residual risk / findings

1. **Uncommitted provenance (operability).** At HEAD `be4a820` the S195 row, README row, pin entry, entry file, `corpus/lessons/round-61.md`, and all of `.ufo/waves/round-61/w1/` are untracked or modified-only (`git status --porcelain`). `git show be4a820:corpus/SOURCES.md` contains no S195; committed pin `covered=145` has no temporal entry. The "committed round-61 wave-1 evidence" the wave-2 brief assumes does not exist yet — every count above is working-tree-only and would disappear from a clean checkout. Verification at any frozen rev must be re-run after integration commits.

2. **Frozen probe cannot observe the verified fact (coverage, corroborating C2 seats).** `node .ufo/waves/round-61/probe/doctrine61-probe.mjs <lane> be4a820` → `DOCTRINE61_UNMET held=0/6`, `E3 MISS row-absent` (probe still exits 0). Two independent defects inside E3, `probe/doctrine61-probe.mjs:17`: (a) the row regex `/^\|[[:space:]]*S195[[:space:]]*\|/` uses POSIX classes JS ignores, so `.find` returns nothing even when the row is present (matches `controls/ctl-c2-critic-a0-honest-row-vacuity.txt:21`); (b) the cell indices are shifted +1 — the code checks `c[9]==='mined' && c[10]==='2026-10-25' && c[12]==='<path>'` but in `split('|')` output the truth positions are `c[8]=mined`, `c[9]=2026-10-25`, `c[11]=<path>` (confirmed by `ScribeSourcesRows.md:125-128` and my parse). With the row present it would print `status=2026-10-25 opened=90d used-by=` and still MISS. The underlying data satisfies E3's declared intent; the frozen instrument cannot measure it.

## Commands run

```
node scripts/readme-map.mjs                                   # CLEAN 148/148/148, exit 0
node scripts/sources-check.mjs                                # exit 0, CLEAN, no S195 diagnostics
awk used-by column scan over corpus/SOURCES.md                # 1 hit, S195, single path
python3 JSON parse of .ufo/pins/readme-map.json               # covered=148, entry @index 52
git show be4a820:{SOURCES,README,pins/readme-map.json}        # committed rev lacks all of it
git status --porcelain; git ls-files                          # round-61 set untracked
node .ufo/waves/round-61/probe/doctrine61-probe.mjs $LANE be4a820  # UNMET held=0/6, E3 row-absent, exit 0
```

Report: `.ufo/waves/round-61/w2/Audit13.md`

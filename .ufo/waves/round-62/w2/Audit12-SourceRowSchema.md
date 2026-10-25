# Audit12 — Source-RowSchema (S195), round 62 w2

Scope: attack the inherited round-61 predicate on S195: **11-cell row · mined/opened
2026-10-25 · used-by exact · no escaped/literal pipe**. Read-only finding; no verdict
beyond the predicate. No tools installed.

## What held (evidence)

1. **11-cell row — holds.** Lane `corpus/SOURCES.md` header (line 12) is exactly
   `id|source|kind|tier|scope|anchor|teaches|status|opened|recheck|used-by` = 11 columns.
   S195 (line 147) parses to exactly **11 cells** (NF=13 under the contract's awk):
   `S195` · `Worker Versioning — Temporal documentation — https://docs.temporal.io/worker-versioning.md`
   · `docs` · `A` · scope · anchor · teaches · `mined` · `2026-10-25` · `90d` ·
   `corpus/knowledge/temporal-worker-versioning-pinning.md`.
2. **mined/opened 2026-10-25 — holds.** status=`mined`, opened=`2026-10-25`
   (past/present as of 2026-10-25; E08 passes), recheck=`90d` (valid NNd cadence; E09 passes).
3. **No escaped/literal pipe — holds.** S195 line has exactly 12 `|` (leading + 10
   internal separators + trailing), zero inside any cell; `grep -o '\\|'` across the whole
   file returns 0 escaped pipes.
4. **Census on extraction — clean.** Extracting `## Registry` + header + separator + S195
   alone into `/tmp/s195extract/corpus/SOURCES.md` (with symlinked used-by target) and running
   `sources-census.sh validate --file` returns **EXIT=0 `ok`** (no E01–E11). Full-lane
   `sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` also returns
   EXIT=0 (6 unrelated W04 warnings).

## Counterexample — used-by is NOT exact

Contract v1 (`SOURCES-CONTRACT-v1.md:40`): used-by = "repo-relative paths of the knowledge
entries or lessons citing the row". Files under the lane `corpus/` citing S195:

- `corpus/knowledge/temporal-worker-versioning-pinning.md` — cited in used-by ✓
- `corpus/lessons/round-61.md` — cites S195 at lines 12 ("A S195 / temporal-worker-versioning-pinning.md | ADMIT …"), 22 ("The single added row is S195, mined, opened 2026-10-25, used only by …"), 26 (id-collision discussion). **Absent from used-by.**
- `corpus/lessons/round-61-verifier-spotcheck.md` — cites S195 at lines 92 ("C2 … on S195") and 100 ("The S195 row is in `## Registry` at SOURCES.md line 147, with NF=13 …"). **Absent from used-by.**

`corpus/README.md` and `PROVINCE.md` also name S195 but are indexes, not knowledge entries
or lessons → correctly excluded. So the used-by cell lists 1 of ≥3 qualifying citer paths.
The round-61 lesson's own sentence (round-61.md:22) "used only by `corpus/knowledge/temporal-worker-versioning-pinning.md`"
is therefore false provenance. The census validator cannot catch this: E11 checks only that
listed paths exist, never that all citing lessons are listed.

## Impacted axes

- **Sources & frontier** (conformance): S195's citation graph in the registry is incomplete;
  the R61 report/lesson's "used only by" claim is inaccurate, and the watchdog/source-census
  gate reads this registry.
- **Coverage / discernment**: the frontier expansion count (contract rule 4) tracks knowledge
  entries whose `source:` cites a mined row; an incomplete used-by under-records the citer
  graph that future rows and spot-checks rely on.

## Smallest safe correction

Append the two lesson paths to S195's `used-by` cell (append-only, allowed):
`corpus/knowledge/temporal-worker-versioning-pinning.md, corpus/lessons/round-61.md, corpus/lessons/round-61-verifier-spotcheck.md`,
and log the old→new used-by change in the round lesson per contract rule 2. No other cell
changes; no renumbering. This resolves the only failing predicate without touching schema,
dates, or the row body.

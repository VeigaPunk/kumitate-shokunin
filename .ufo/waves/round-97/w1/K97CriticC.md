# K97CriticC — H97 differential (claim C1, operability)

**H97: SURVIVES on the assigned corpus — 1 274 / 1 274 cases, zero disagreements.** 76 historical
`corpus/SOURCES.md` blobs (lane at `38eb197c`), 21 sibling `*-shokunin/corpus/SOURCES.md`,
2×300 seeded mutations of the freeze registry (seeds 97/197; heading insert/delete/replace/move
incl. `##\tRegistry`, `## Registry\r`, CRLF files, VT/FF/NBSP, 0–4-space and tab indents, `###`,
`#`, rows moved between sections), 2×240 heading-shape×indent stress cases. Per case: census
`validate --file` E12 ids (output order) + `census --file` `rows` vs tool `--json`
ROW_OUTSIDE_REGISTRY ids (finding order) + `counts.rows`, order-sensitive equality.

**Tool under test.** `K97ExecTool/` never carried `READY` (checked 23:36→00:01 while the builder
rewrote the file five times: `4955a630`→`d7087042`→`34c79bdf`→`2b6969ac`→`ccbf1619`), so per the
seat rule the primary attested tool is the regenerated L1 reference `ctl-positive` (sha `bc2780…`,
== `controls/controls-sha256.txt`); the candidate is reported as pre-READY observation at
`ccbf1619…` (stable from 23:55). `diff` candidate vs `ctl-positive` = 78 lines, all one comment
line + selftest lines: the `runCheck` R97 block is byte-identical.

| tool | assigned corpus 1 274 | supplementary probes 27 |
|---|---|---|
| ctl-positive `bc2780` | 1 274 | 22 (5 rows-only, shared with BASE) |
| candidate `ccbf1619` | 1 274 | 22 (same 5 cases) |
| BASE `5402b210` | 1 143 | 18 |

Cross-tool: candidate `findings` JSON is byte-identical to ctl-positive on all 1 274 assigned
cases (the fix changes nothing outside the section rule). Real lane: candidate and BASE `--json`
output byte-identical (exit 0, sha `052427a8…`); candidate `--selftest` 68/68 PASS.

Frozen counter (`probe97-c1.mjs`, `--freeze/--rev 38eb197c`): candidate `4955a630` → `C97_C1: HELD
a=1/1 b=1/1 c=1/1 d=1/1 e=1/1 f=1/1` seed `603380c675dbd878`; candidate `ccbf1619` → receipt
`probe-ccbf1619.txt`; ctl-positive → HELD, seed `90939609607f0c8b`.

Counterexample class BASE still fails (smallest, 212 B): `##\tRegistry` — census inside/1 row,
BASE outside/0 rows; `## Registry\r` — census outside/0 rows, BASE inside/1 row (`cx-base-*.md`).

**Known limit (pre-existing, not R97's delta):** census `rows` counts every table row inside
`## Registry`; the tool counts only `S[0-9]{3,}` ids → census rows 2 vs tool rows 1 on 5
row-definition probes, identically for BASE, ctl-positive and candidate. R97 freezes row
detection at base; no real registry or registry-shaped mutation exposes it (E12 ids agree 8/8).

Evidence: `.ufo/waves/round-97/K97CriticC/` (`H97.md`, `harness.py`, census/compare/receipt JSON,
`cases-metas*.json`, `pre-lane*.json`, `base-lane.json`, `probe-*.txt`, `cx-base-*.md`). Scratch
`/fast/scratch/hyaku/kumitate-r97/K97CriticC` removed before yield.

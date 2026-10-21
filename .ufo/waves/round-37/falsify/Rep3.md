REP3 numbers=8 mismatches=1 verdict=partial
Axis: operability. Target: `## Sources & frontier` in `/home/vgpnk/Projects/shokunin/.ufo/reports/round-37/kumitate.md` (lines 70-75). The item's "section 3" is the fourth `##` heading (after Work performed, Landed changes, Before -> after); the parenthetical names it unambiguously. Lane HEAD at check time: `a5d627b` (the erratum revision). The section text is identical in my two reads, before and after the erratum was appended at 03:23.

Why partial: all 8 numbers reproduce from the lane tree. Of 4 pointers, 3 resolve as written. The census command as written (`sources-census.sh validate ...`) exits 127 and reproduces only with the fleet-root path.

## 1. Numbers: 8 of 8 reproduce

Section text: `rows 32 (A:31/B:1, mined 16, queued 14, rejected 2); no new row this round ... census ... -> kumitate ok, exit 0`.

Command (cwd = lane): `node scripts/sources-check.mjs`
```
SOURCES  info  LEGACY_NO_HEADER  count=38
SOURCES_CHECK: CLEAN (rows=32 tiers=A:31,B:1,C:0 status=queued:14,mined:16,rejected:2 entries_with_source=3 legacy=38)
exit=0
```
`--json` gives `"counts":{"rows":32,"tiers":{"A":31,"B":1,"C":0},"status":{"queued":14,"mined":16,"rejected":2},"entriesWithSource":3,"legacy":38}`.

Independent derivation (gawk over `corpus/SOURCES.md`, table rows matching `^| S###`):
```
NF 13 32          (all 32 rows have 13 fields)
rows 32 unique_ids 32
tier A 31 / tier B 1          (C: 0 implicit; 31+1 = 32)
status mined 16 / queued 14 / rejected 2   (16+14+2 = 32)
id range S001 .. S032
```

| # | Report claim | Command and observed output | Result |
|---|---|---|---|
| N1 | rows 32 | sources-check above; gawk 32; census `census` mode: `kumitate rows 32` | reproduces |
| N2 | A:31 | sources-check; gawk `tier A 31`; census `tier.A 31` | reproduces |
| N3 | B:1 | sources-check; gawk `tier B 1`; census `tier.B 1` | reproduces |
| N4 | mined 16 | sources-check; gawk `status mined 16`; census `status.mined 16` | reproduces |
| N5 | queued 14 | sources-check; gawk `status queued 14`; census `status.queued 14` | reproduces |
| N6 | rejected 2 | sources-check; gawk `status rejected 2`; census `status.rejected 2` | reproduces |
| N7 | no new row this round (32 at base) | `git diff --quiet 91da27c6 HEAD -- corpus/SOURCES.md` clean; `cmp` of `git show 91da27c6:corpus/SOURCES.md` vs live file: identical, 22286 B; `node scripts/sources-check.mjs --self /fast/scratch/kumitate-r37/Rep3/base91` -> `SOURCES_CHECK: CLEAN (rows=32 ... entries_with_source=3 legacy=38)`, exit 0 | reproduces (rows and every SOURCES field unchanged, including entries_with_source=3 and legacy=38) |
| N8 | census exit 0 | `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate; echo exit=$?` -> `kumitate<TAB>ok<TAB>/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md`, `exit=0` | reproduces (the `kumitate ok` text is that TSV line) |

Also: `cmp .ufo/waves/round-37/final/sources.txt` against the live sources-check output: identical (161 B). The record matches the live tree.

## 2. Pointers: 3 of 4 resolve as written

- P1 `sources-census.sh` (bare). FAILS as written. From the lane root:
  `sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` -> `error: command not found: sources-census.sh`, exit=127.
  Not in the lane (`ls scripts/sources-census.sh` -> No such file), not on any PATH directory. It resolves only as `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` (fleet root, 35466 B). Fix: write the full path in the section.
- P2 `--root /home/vgpnk/Projects/shokunin`: resolves (directory exists; census accepted it).
- P3 lane id `kumitate`: resolves at `/home/vgpnk/Projects/shokunin/shokunin.conf:49` (`kumitate|kumitate-shokunin|operability + coverage ...`).
- P4 `corpus/SOURCES.md` (census output path): resolves, 22286 B.

Supplement (not in section 3, supports the census `ok`): `test -e` on all 23 used-by pointer pairs in the registry: all OK (`corpus/knowledge/*.md`, `corpus/lessons/*.md`). The 16 mined rows are exactly the 16 rows with a used-by pointer (16 of 32 rows have `—`, the other 16 have pointers).

## 3. Non-counted findings (wording and evidence; not number or pointer failures)

- W1 "which is the round's quality claim": the declared claim is operability (fleet report line 11: `Declared claim (one): operability`; LOG.md:1727: `Declared claim: operability`). "quality" appears only as a trend verdict (report line 80: `quality: improved`). The sentence conflates trend and claim.
- E1 Evidence gap: no round-37 record holds the census result. `grep -rln sources-census .ufo/waves/round-37` returns nothing; `final/sources.txt` holds only the sources-check line. LOG.md mentions sources-census only at lines 1436, 1547, 1627 (earlier rounds); the round-37 entry (1714-1728) has none. The census claim rests on the report text and this rerun.

## 4. Frontier sentence: checked, holds

- "no new ground entered": `git diff --quiet 91da27c6 HEAD -- PROVINCE.md` clean; the Frontier band (PROVINCE.md:17-22) is unchanged. `git diff --name-status --diff-filter=A 91da27c6 HEAD -- corpus/knowledge` is empty. The only added corpus files are two lessons (`corpus/lessons/round-36-verifier-spotcheck.md`, `corpus/lessons/round-37.md`). The four knowledge notes are M (restorations), not new entries.
- "green by shift" -> "green by recorded debt": pairing rule at base `scripts/claims-check.mjs:300` is `const pair = next ?? prev ?? null;`; at HEAD line 303 is `const pair = prev ?? next ?? null;`. HEAD: `node scripts/claims-check.mjs --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json` -> `FIDELITY_TOTAL anchors=1551 ... nonok=186`, `FIDELITY: CLEAN (notes=20 anchors=1551 src-rev=31c465f15669)`, exit 0. The ratchet file has `total` 186 and 20 notes. The base-tree fidelity run was not re-derived (it belongs to section 2).

## 5. Outside section 3 (observed, not counted)

- O1 Stale C2 in the round-37 LOG entry: LOG.md:1724 `D8 README row + C2/C2_total=83` and LOG.md:1726 `C2=83/83`. The live tree says 84: `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` -> 84 (base 91da27c6: 82 via `git ls-tree`); `node scripts/proxy-check.mjs` -> `PROXY: MATCH (A=7 C=14 operability=8; C1=19/19 C2=84/84 ...; src-rev=31c465f15669)`; SCORECARD.md:288 `C2=84`; fleet report line 44 `C2 = C2_total = 84`. The LOG disagrees with its own gate.
- O2 "expansion: unchanged" (report line 79) sits beside two new lesson files that moved C2 from 82 to 84. They are not frontier ground, but the trend line does not name the count change.

## 6. State and reproduction

- Lane HEAD `a5d627b`; the last commit touched only SCORECARD.md, corpus/lessons/round-36.md and corpus/lessons/round-37.md. None of the section-3 inputs (SOURCES.md, PROVINCE.md, knowledge/) moved between 86c0676 and a5d627b.
- Scratch writes (mine): `/fast/scratch/kumitate-r37/Rep3/` (`base91/` = `git archive 91da27c6 corpus scripts/sources-check.mjs`; `SOURCES.base91.md`; `live-sources.txt`).
- Read-only runs: census `validate` and `census` (stdout only, no `--out`); sources-check (default, `--json`, `--self`, `--selftest` 46/46 pass); claims-check `--fidelity`; proxy-check. Git reads used `--no-optional-locks` except one early `git status --short`, which may have refreshed `.git/index` stat data (no content change).
- Tool installs or updates: none. Subagents spawned: none. Lane files written: this report only.
- Recommended fix for the report: replace the bare `sources-census.sh` with `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`, and record the census line in a round-37 record (for example `final/`) so the claim has a pointer.

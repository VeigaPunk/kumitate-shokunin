# Lesson repair — Erratum 3 for round-79.md (D3 precision fix)

Target file (lane): `corpus/lessons/round-79.md`.
Status: Erratum 2 (D3/D4) is COMMITTED at `509afb1d`. Its D3 block contains one sentence that
this audit found to be factually wrong (see report §D3): "do not exist at any lane revision".
`close/census.txt` and `close/shape.txt` DID exist — solely at the measured work revision
`357e4e73` (`git ls-tree 357e4e73 -- .ufo/waves/round-79/close/` lists both; census.txt header
`date=2026-11-04T04:59:59-03:00`; shape.txt carries `OMP_CENSUS: CLEAN ...` +
`OMP_SHAPE_COMPARE: IN_SYNC`). The close commit `32620ef5` renamed `census.txt` →
`census-shape.txt` (`git diff --name-status 357e4e73 32620ef5` → `R075 .../census.txt .../census-shape.txt`,
`D .../shape.txt`). The correction must be a NEW appended erratum naming that sentence
(append-only; the committed Erratum 2 bytes are not rewritten). 13 lines, under the 25-line bound.

## Exact text to land (append at end of corpus/lessons/round-79.md)

```markdown
## Erratum 3 (append-only, 2026-11-04, round 80; supersedes only the sentence it names)

Erratum 2's D3 block says the four `close/` names in the `## Counters` table "do not exist at any
lane revision". That sentence overreaches for two of the four. `close/census.txt` and `close/shape.txt`
did exist — solely at the measured work revision `357e4e73`, as the kimi census and OMP shape receipts.
The close commit `32620ef5` renamed `census.txt` to `close/census-shape.txt` and deleted `shape.txt`,
folding the OMP line into `census-shape.txt`. Precisely: none of the four names exists at the round-79
close (`32620ef5`) or any later revision, and `close/readme-map.txt` / `close/spotcheck-check.txt`
never existed at any revision. The four table pointers are void either way; only the sentence's reach
is corrected here. The committed receipts remain `close/census-shape.txt` (kimi census + OMP line),
`close/maps.txt` (README map 194/194, spotcheck map 45/0), and `close/sources-census.txt`, per
Erratum 2.
```

## Audit certification of Erratum 2's remaining text

- D3's list of the four void names and the table location (`## Counters`, rows 86–90): TRUE.
- D3's replacement pointers: TRUE. `close/census-shape.txt` line 15 =
  `OMP_CENSUS: CLEAN (source=snapshot entries=64 findings=0 bound=35/35)`; `close/maps.txt` line 1 =
  `README_MAP: CLEAN files=194 rows=194 covered=194`, line 3 = `SPOTCHECK_MAP: CLEAN spotchecks=45 uncovered=0`;
  `close/sources-census.txt` exists in the HEAD tree.
- D4 ("21 words" → 18): TRUE and already corrected; `printf '%s' '0 if a line is selected, 1 if no
  lines were selected, and 2 if an error occurred.' | wc -w` → `18`. Quote itself faithful.

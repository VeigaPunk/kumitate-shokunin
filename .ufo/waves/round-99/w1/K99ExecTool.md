# K99ExecTool — w1 executor report (R99 candidate: census-blank cell trim)

## Deliverable
- Candidate: `.ufo/waves/round-99/K99ExecTool/sources-check.mjs`
  sha256 `50b94567905676cc31c78ca47e76fd3ba625a7ae0d933b597fca0e74e1463f31` (`sha256.txt`, `READY` — one line, same hash).
- `cap-spawn.mjs` + `cap-run.mjs` copied beside it; `cmp` vs lane scripts: identical (receipt: this run's cmp, "cap-spawn identical / cap-run identical").

## Change (diff.txt — exactly 3 hunks vs `scripts/sources-check.mjs` at base f9cd1bff)
1. Header doc +2 lines: every Registry cell is trimmed with the census `row_pass` trim class — POSIX `blank`, ASCII SP/TAB, both ends (R99); JS `String.prototype.trim()` deliberately not used.
2. `trim` helper (base line 134, candidate lines 136–137 after the header shift): `function trim(value) { return value.trim(); }` → one-line doc comment + `function trim(value) { return value.replace(/^[ \t]+|[ \t]+$/g, ''); }`. All callers (id line 232-region, the ten other cells, tier/status counts, used-by split) go through this one helper, so every Registry cell now trims the census blank class. Everything else byte-identical (section grammar r97, outside-row regex, 13-field rule, finding kinds, exit map, contract `kumitate-sources-v1`).
3. Selftest +19 `r99trim-*` arms beside the r97 section arms, reusing `makeDefault`/`makeRow`/`runTool`/`check`:
   - 10 id-pad arms (NBSP, VT, FF, CR, NEL, U+2003, U+FEFF, U+200B, U+0001, U+3164; lead+trail each): exact `ID_FORM` details `id=<padded>`, `counts.rows` excludes the padded rows.
   - 5 enum-cell arms: kind NBSP/VT → `KIND_ENUM`; tier FF/CR → `TIER_ENUM`; status U+2003/FF → `STATUS_ENUM`; opened U+FEFF/NBSP → `OPENED_INVALID`; recheck CR/U+2003 → `RECHECK_INVALID` — each with exact detail strings and rows still counted.
   - Duplicate arm: NBSP-padded repeat = `ID_FORM` (not `ID_DUPLICATE`), TAB-padded repeat = `ID_DUPLICATE`; `counts.rows`=3.
   - Counts arm: `counts.rows` = blank-trim-valid ids only (2 of 5 rows).
   - Acceptance arm: blank pads of length 1/4/8 (SP, TAB, mixed) on every cell → exit 0, rows=9, zero findings.
   - Census parity arm (r97 pattern): padded-id `ID_FORM` set + `counts.rows` vs live census `E02` count (4), per-line core attribution; skips only when census absent, fails on census exit outside 0/1.

## Selftest counts
- Before (`selftest-before.txt`, base bytes, default env): **70/70 pass + 1 SKIP** (`r97sec-census-parity`, census not resolvable without fleet `SHOKUNIN_ROOT`) = 71 arms.
- After, default env (`selftest-default.txt`): **88/88 pass + 2 SKIP** (r97sec + r99trim census arms) = 90 arms.
- After, `SHOKUNIN_ROOT=/home/vgpnk/Projects/shokunin` (`selftest.txt` — the env the counter uses for predicate (h)): **90/90 pass, 0 SKIP, exit 0**.

## Arm teeth (arm-teeth.txt; driver arm-teeth.py — the generator's line rewrites applied to MY candidate bytes)
**16/16 shapes killed** by ≥ 1 `r99trim-*` arm: ctl-nothing (13 arms), spaceonly (2), asciiws (8), nbsp (5), zs (8), leadonly (13), trailonly (13), padcap3 (1: blank-accepted), bomstrip (2), cfstrip (1: id-zwsp), c0strip (9), pystrip (13), idonly (5 cell arms), enumonly (8), countall (12), plus BASE JS trim = ctl-nothing. ctl-splitjs is out of scope (not a kill target); ctl-positive = the candidate itself. Driver note: the first run's ctl-idonly SURVIVED was a driver artifact (helper left at R99 → no-op rewrite); the corrected shape (helper reverted to JS trim + id blank inline) is killed by 5 cell arms. K99Mutation independently reproduced both facts (their 27-mutant probe: reference 90/90, 23/26 mutants killed; peer message).

## Frozen counter (`probe/probe99-c1.mjs`, never edited; work dir under scratch, removed)
- `score1.txt`: `C99_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=1/1 f=1/1 g=21/21 h=1/1 rows=401 census_rows=401 tool_rows=314 E02=87/87 E03=12/12 E01=9/9 E05=43/43 E06=43/43 E07=43/43 E08=43/43 E09=43/43 E12=314/314 seed=3052ea1b61c1334b tool_sha256=50b94567905676cc31c78ca47e76fd3ba625a7ae0d933b597fca0e74e1463f31`
- `score2.txt`: `C99_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=1/1 f=1/1 g=21/21 h=1/1 rows=401 census_rows=401 tool_rows=313 E02=88/88 E03=12/12 E01=8/8 E05=43/43 E06=43/43 E07=43/43 E08=43/43 E09=43/43 E12=313/313 seed=1172cfb57babd0d3` (same tool_sha256).

## Notes / risks
- `READY` written only after both counter runs on the final bytes; no candidate edit after scoring.
- No writes outside `K99ExecTool/` (and now `w1/K99ExecTool.md`) plus scratch; probe/plan/controls untouched (K4). No installs performed.
- `arm-teeth.py` kept in the seat dir as the exact reproduction script for the teeth table.

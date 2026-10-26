VERDICT: The round-65 lesson skeleton is drafted with all five Gate rows opened, quoted (9/9 under the probe's own `norm()`) and byte-pinned from committed captures; three calibration findings change how the L1 must word the `## Mistakes` cell and the C1 after-value, and no number in the draft rests on an unrun command.

## Evidence

Draft: `.ufo/waves/round-65/build/K65ScribeLessonDraft/round-65.md` (149 lines) — sections `## Mistakes` (one row), `## What round 65 changes` incl. the counted recurrence table, `## Gate` (rows S201-S205, assimilation, carried rejects), `### Collision guard`, `### Quarantine`, `### considerthese`, spot-check placeholder, `## Open items carried`.

Before-state receipts (read, not re-run):
```
base/readme-map-before.txt : README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md  EXIT=1
base/proxy-before.txt      : PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=156 computed=157 delta=+1
                              PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9  EXIT=1
base/harm-pairA-freeze.txt : HARM_ROW gate=readme-map ... id=HARM ; HARM_ROW gate=proxy-check ... id=HARM
                              HARM_MATRIX: HARM gates=19 held=15 repaired=0 carried=2 moved=0 new=0 gone=0 harm=2 harm_absent=0 new_red=0 base=a004902d77d1 tip=47fe23831519  EXIT=1
base/harm-pairB-freeze.txt : HARM_MATRIX: CLEAN gates=19 held=14 repaired=2 carried=2 moved=0 new=1 gone=0 harm=0 harm_absent=0 new_red=0 base=6825a51425e9 tip=a004902d77d1  EXIT=0
base/harm65-base.txt       : HARM65_UNMET held=0/5 checks=5 rev=47fe2383... | H1..H5 MISS tool-absent   EXIT=1
base/omp65-base.txt        : OMP65_UNMET held=0/8 checks=8 rev=47fe2383... | O1..O8 MISS                EXIT=1
base/omp65-donothing.txt   : OMP65_UNMET held=1/8 ... (only O8)                                        EXIT=0
base/harm-matrix-selftest-freeze.txt : HARM_MATRIX_SELFTEST: PASS (26/26)                              EXIT=0
base/omp-binary-probe-freeze.txt     : 15 OMP_BIN: keys, OMP_BIN_PROBE: DONE omp=18.12.6               EXIT=0
```
Commands run this seat (all read-only):
```
grep -c '^OMP_BIN:' .ufo/waves/round-65/base/omp-binary-probe-freeze.txt            -> 15
ls .ufo/waves/round-65/controls/harm | grep -c '^case-'                             -> 16
node -e "<spec.json sweep over controls/harm>" -> cases=16 exit0=9 transitions=ABSENT_BOTH,CARRIED,CARRIED_MOVED,HARM,HARM_ABSENT,HELD,NEW_OK,NEW_RED,REPAIRED distinct=9
sha256sum <5 captures> -> types.ts 16167 caa3eade… ; mcp-runtime-lifecycle.md 22741 362acea5… ; 10bce690.patch 9953 eedfbbc4… ;
                          package.json 16030 83c96c50… ; client.ts 14975 479aef6d…
node .ufo/waves/round-65/build/K65ScribeLessonDraft/qcheck.mjs                       -> TOTAL 9/9  (norm() copied from probe/omp65-probe.mjs:57-64)
grep -cE '^S20[1-5]$' .ufo/waves/round-65/build/K65ExecCollisionGuard/assimilation/staged-ids -> 5
wc -l reg-ids staged-ids collisions                                                  -> 139 / 155 / 6   (collisions = S195..S200)
grep -cE '^\| S20[1-5] \|' corpus/SOURCES.md ; grep -cE '^\| S206 \|' corpus/SOURCES.md -> 0 ; 0
grep -rl 'R56-V3|Audit19|R61-V2|W04|DEGRADED|dangling' corpus/lessons | wc -l (per token) -> 8 / 6 / 4 / 36 / 1 / 7
grep -c W04 .ufo/waves/round-65/base/census-before.txt                               -> 6   (S034 S068 S084 S095 S123 S126), EXIT=0
curl api.github.com/repos/can1357/oh-my-pi/issues/{8167,14172,12471} -> open / merged_at null / comments 10,0,0 / updated 2026-10-20,2026-10-07,2026-09-18
git log --oneline -1 -- .ufo/waves/round-64/build/K64ExecProxyRepair/receipts/13-manifest-before.txt -> 2ca91a0 round-65: freeze …
```
Gate quotes: 9 bullets (S201 ×2, S202 ×2, S203 ×2, S204 ×1, S205 ×2), word counts 1–17, all `OK` under the frozen `norm()`; the literal `2025-11-25` occurs in the S201/S202/S203 bullets.

## Findings

**K65ScribeLessonDraft-1** (medium, attacks the `## Mistakes` captured-by cell). Q60's round-start arm did **not** capture the drift; at the plan commit it reads `NA`/`NO_MARKER` with `map=CLEAN`. The draft therefore names `readme-map` (after the fact, on the base revision) as the only capture and says why the arm had nothing to refuse. Repro: `cat .ufo/waves/round-65/base/plan-before-ready-freeze.txt` → `PLAN_BEFORE_READY: NA rev=2ca91a0… round=65 ... reason=NO_MARKER ... map=CLEAN files=157 rows=157 covered=157`, `SUMMARY ... na=1 ... exit=2`.

**K65ScribeLessonDraft-2** (medium, attacks C1's discriminative power). `HARM65_HELD held=5/5 checks=5 rev=2ca91a0…` already holds at the freeze revision, so the claim is satisfied before any wave seat runs and a wave that lands nothing still reads 5/5; only the ratchet can strengthen it. The plan's "before" is true only at `47fe2383`. The draft states this at the C1 bullet instead of writing the after-value as the round's work. Repro: `cat .ufo/waves/round-65/base/harm65-at-freeze.txt` (untracked, see -4).

**K65ScribeLessonDraft-3** (low, attacks the round-64 D3 list). Sub-item (iii) is closed: the two "untracked" `K64ExecProxyRepair` receipts are tracked as of the freeze commit (`git log --oneline -1 -- …/receipts/13-manifest-before.txt` → `2ca91a0`; same for `15-manifest-after.txt`, `15-refresh-idempotent.json`). Sub-item (ii) is worse than filed: the r64 wave-1 draft cites `close/p3-real-reports.txt`, which was never committed (`ls .ufo/waves/round-64/close/p3-real-reports.txt` → No such file), and the filed report carries no `re-deriv` line (`grep -c 're-deriv' /home/vgpnk/Projects/shokunin/.ufo/reports/round-64/kumitate.md` → 0).

**K65ScribeLessonDraft-4** (low, attacks the frozen-set claim). `.ufo/waves/round-65/base/` gained two files after the freeze commit: `harm65-at-freeze.txt` and `plan-before-ready-freeze.txt` (`comm -13 <git ls-tree …base> <ls base>` → those two names only). The freeze is therefore not immutable in practice, and finding -2 rests on an untracked receipt; the L1 should commit or re-derive it before citing.

**K65ScribeLessonDraft-5** (info, attacks a "6 collisions" reading of the guard). The guard's 6 collisions are `S195…S200` only because the five new lane rows do not exist yet; the staged set already holds ids `S201-S205` for five unrelated documents (`grep -cE '^S20[1-5]$' staged-ids` → 5), so after the append the guard must read 11. Fixture proof the guard can fail: `col-base` 6, `col-sp0`/`col-sp2` 7, `col-sp4` 6.

**K65ScribeLessonDraft-6** (info). `w1/K65ScoutTagVersion.md` proposes a new row `S206` for `types.ts`, which is already the lane's S201 (same URL, same sha `caa3ead…`); adopting S206 would duplicate the document. The draft keeps five rows and says so.

**K65ScribeLessonDraft-7** (info, calibration of a carried number). "kimi DEGRADED K=49/53" mixes two denominators: the gate's clean line reads `K=49/49 coverage:kimi-layer=10` (`base/harm-pairA-freeze.txt:2`) while the spot-check's 53 is a host member count (`corpus/lessons/round-64-verifier-spotcheck.md:66`). The draft states both rather than repeating 49/53 as one quantity.

## Artifacts

- `.ufo/waves/round-65/build/K65ScribeLessonDraft/round-65.md` — the lesson skeleton (draft for `corpus/lessons/round-65.md`; L1 fills nothing — no `__QUOTE__` token remains).
- `.ufo/waves/round-65/build/K65ScribeLessonDraft/qcheck.mjs` — the 9-bullet quote checker (frozen `norm()`), `TOTAL 9/9`.
- `.ufo/waves/round-65/build/K65ScribeLessonDraft/captures/10bce690.patch` — this seat's own fetch for S203, byte-identical to `build/K65ScoutCommit/capture/10bce690.patch` (`eedfbbc4…`, 9953 B).
- Scratch: `/tmp/kumitate-r65/K65ScribeLessonDraft/{package.json,client.ts,10bce690.patch,i8167.json,i14172.json,i12471.json,qcheck.mjs}` (small; left in place).
- No tool installed or upgraded; no lane file outside my build/report paths was touched.

## Limits

Did not run either counter (H65/O65) at any revision — every "after" value in the draft is the declared predicate or a receipt at the freeze; did not run the H2 harness or H1 selftest myself (the `PASS (26/26)` line is the committed receipt); did not fetch S201/S202 live — their nine bullets were re-checked against the committed captures, not against a fresh fetch (scout re-fetch receipts cover the tag/commit identity); did not read the installed binary (probe receipt only); `w1/K65ScoutStagedVsLive.md` did not exist at drafting time, so the tracker-state reject rests on my own live API read of the three records, not on that scout's verdict; did not verify the staged entries' full bodies beyond their headers and the used passages; no claim about wave-2 work.

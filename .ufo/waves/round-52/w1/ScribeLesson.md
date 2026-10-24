# ScribeLesson — round 52, wave 1 (lesson + LOG drafts)

## Behavior

Drafted the round-52 lesson file and the LOG.md round-52 entry skeleton from the frozen
artifacts, without executing counters or gates.

Read (read-only): `.ufo/waves/round-52/plan.md` (whole); both frozen probe headers
(including the predicate lines `attest52-probe.mjs:76` / `doctrine52-probe.mjs:30`, checked
by direct grep); all three base transcripts
(`base/attest52-base.txt`, `base/doctrine52-base.txt`, `base/baseline-gates.txt`);
`LOG.md` tail (newest entry = `round-51 2026-10-24 …` at line 2029, 2045 lines total);
`corpus/lessons/round-51.md` (104 lines, the shape template);
`corpus/lessons/round-51-verifier-spotcheck.md:8,36,71`; the Q43 block of
`corpus/QUALITY.md:801-819`; round-51 close receipts under `.ufo/waves/round-51/close/`;
the filed round-51 report `/home/vgpnk/Projects/shokunin/.ufo/reports/round-51/kumitate.md`
(lines 1-12, 88-110); and, at the 15-report snapshot, nine of the fifteen wave reports then
present (`ExecProbeSanity`, `ScoutRfc3339`, `ScoutCompanion`, `ScoutCensus`, `SentScope`,
`CritFreeze`, `CritC1`, `CritC2`, `ScribeQuality`), plus three late arrivals
(`RevCounterA`, `RevCompat`, `ConnOverlap`). Thirty-nine reports were present when the
drafts were finalized (`date -u` = `2026-10-24T04:07:38Z`).

Wrote exactly three files (see Touched surfaces). No lane source, corpus, SCORECARD,
QUALITY, SOURCES, LOG, plan, probe, receipt or registry file was edited; drafts live under
the seat's own `build/ScribeLesson/`. No mutating git/jj command; no subagents; no
background jobs; no tools installed or upgraded (`installs: none`).

## Evidence — exact commands and outcomes

1. `cat .ufo/waves/round-52/base/attest52-base.txt` →
   `ATTEST52: ATTEST52_UNMET held=5/13 checks=13 rev=02c01258464cac3804faf177d0cfbf113cd59706 rule=A52 version=v1 | B1 MISS … | B2 MISS attest52-run-1.txt:absent;… | B2e MISS run exit=64 last="receipt-attest: USAGE unexpected argument \"--stdin\" … | B5 MISS pin match;proxy exit=1 PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=117 c…`
2. `cat .ufo/waves/round-52/base/doctrine52-base.txt` →
   `DOCTRINE52: DOCTRINE52_UNMET held=0/5 checks=5 rev=02c01258464cac3804faf177d0cfbf113cd59706 rule=D52 | E1 MISS entry-absent`
3. `cat .ufo/waves/round-52/base/baseline-gates.txt` (12 lines, measured at
   `02c01258…`, date `2026-10-24T03:48:28Z`) → three proxy errors:
   `A_DRIFT  A: declared=71 computed=73 delta=+2`; `C2_TOTAL_DRIFT  C2_total: declared=117 computed=118 delta=+1`;
   `AXES_DRIFT  coverage: ## Axes row=10 derived=9`, then `PROXY: DRIFT (A_DRIFT term=A declared=71 computed=73 delta=+2; C2_TOTAL_DRIFT …; AXES_DRIFT …)`; also `BINDGUARD50: GUARD_UNMET held=7/8` at base, `ATTEST51: ATTEST_UNMET held=8/9` (A5 MISS), `DOCTRINE51: DOCTRINE_HELD held=5/5`, census exit 0 with the four pre-existing W04s (S034/S068/S084/S095).
4. `cat .ufo/waves/round-51/close/FINAL-57333ead13b1b39419bdb1cf6502fad0aa8523ff.txt`
   (655 bytes, 6 lines) → line 1:
   `ATTEST51: ATTEST_UNMET held=8/9 checks=9 rev=57333ead13b1b39419bdb1cf6502fad0aa8523ff rule=A51 version=v3 | A1 PASS | … | A5 MISS pin match;proxy exit=1 PROXY: DRIFT (A_DRIFT term=A declared=81 computed=71 delt…`;
   following lines `a51=1`, `DOCTRINE51: DOCTRINE_HELD held=5/5 …`, `d51=0`, an un-rev-bound
   `PROXY: MATCH (A=81 C=23 operability=9; … pins=6 match; src-rev=31c465f15669)`, `h3=0`.
   Line 1 stops mid-token at `delt`.
5. `git cat-file -e fef67079:.ufo/waves/round-51/close/FINAL-57333ead13b1b39419bdb1cf6502fad0aa8523ff.txt`
   → `fatal: path '…' exists on disk, but not in 'fef67079'`.
   `git ls-tree --name-only fef67079 .ufo/waves/round-51/close/` →
   `A51-cd7f69d3.txt`, `D51-cd7f69d3.txt` only.
   `cat .ufo/waves/round-51/close/A51-cd7f69d3.txt` → `ATTEST_HELD held=9/9 … rev=cd7f69d3…`, `run-at: 2026-10-24T02:48:31Z`, `exit=0`.
6. `git log --oneline -3 fef67079` / `-3 57333ead` / `-3 cb6c472`;
   `git merge-base --is-ancestor 57333ead fef67079` → true; `fef67079` ancestor of
   `02c01258` → true; `git log --oneline -3 -- …/FINAL-57333ead….txt` → single commit
   `cb6c472 round-51: final harm+census receipts`; `git merge-base --is-ancestor fef67079 cb6c472` → true.
7. `grep -rn "fef67079" /home/vgpnk/Projects/shokunin/.ufo/reports/round-51/kumitate.md` →
   hits at lines 6, 92, 99, 100, 105; lines 99-100 read
   ``**After** at `fef670794aa7a46d437bde58ab7f265d3471b587`: `ATTEST_HELD held=9/9 checks=9
   rev=fef67079… rule=A51 version=v3` exit 0 (all nine checks PASS; `close/FINAL-*.txt`).``
8. `grep -n "^round-51" LOG.md` → 2029 (the shape reference); `wc -l LOG.md` → 2045.
9. `grep -c "^| S" corpus/SOURCES.md` → 101; `grep -n "S102\|S103" corpus/SOURCES.md` →
   no matches at draft time.
10. `ls .ufo/waves/round-52/w1/` → absent on first check (01:03 local), then 1 file, then
    5, then 15 at the final snapshot (`date -u` = `2026-10-24T04:06:12Z`).
11. `.ufo/waves/round-52/build/ScoutRfc3339/rfc3339.txt` / `fetch.txt`, and
    `.ufo/waves/round-52/build/ScoutCompanion/S103-row.md` read for the gate skeleton's
    measured values (hashes, byte counts, quote lines as quoted in the drafts).

No A52/D52 (or A51/D51) run was performed by this seat; the numbers quoted are the seats'
committed receipts and reports.

## Drafts produced

- `round-52.md` — header (lane, round, base `02c01258…`, freeze `f539a71e…`, plan +
  counters paths, "ONE v2 wave of exactly 64 seats" per the 2026-10-24 steer, 25/64 = 39%
  attack), the two claims with their frozen predicate names, `## Mistakes` with M1 =
  pre-filled R52-11 row (class close-citation integrity / freeze-evidence gap; evidence,
  captured-by, fix exactly as briefed plus the hard-byte specifics), M2/M3 as wave-mined
  candidates (CritFreeze F1/F2; CritC1 B4c/B3c), M4 pending with the CritC2 queue, and a
  grouped mine queue of the 15 reports present; `## Gate` with S102/S103 as PROPOSED rows
  carrying the scouts' measured fields, tier-scope and entry-shape notes from CritC2, and
  admitted / withheld / rejected / spot-check slots.
- `LOG-entry.md` — single-paragraph skeleton mirroring the newest (round-51) entry's
  exact shape: no bullet marker, ~100-col wrap, `->` arrows, backticked ids, fields in the
  same order (claims → instrument/pin → frozen+executed counters → wave shape → receipts →
  close sequence R1/R2/R3 → terms → harm → frontier → lesson/QUALITY/entry/rows → routed
  defects → open L0), with `<...>` placeholders for post-wave values.

## Findings

1. **R52-11 confirmed on bytes, in three separable parts.** (a) The committed FINAL
   receipt reads `held=8/9`, A5 MISS on `declared=81 computed=71` — not 9/9. (b) That file
   was not in the cited tree: `git cat-file -e` fails at `fef67079`, whose close dir holds
   only the `cd7f69d3` receipts. (c) It lands in `cb6c472`, a descendant of the cited rev;
   the 9/9 comes from `cd7f69d3` (run-at `2026-10-24T02:48:31Z`), so the 9/9@fef67079 is
   compositional, matching the verifier spot-check's R52-11 text. Peer scribe ScribeQuality
   independently confirmed the same with hard bytes and additionally recorded the FINAL
   file's two-tree shape (rev-bound `held=8/9 … declared=81 computed=71` beside an
   un-rev-bound `PROXY: MATCH (A=81 …)`) and the truncated line 1 — both corroborated by my
   own reads in steps 4–6; its Q44 draft is its own artifact, not read or merged here.
2. **Freeze-prose drift candidate (not adjudicated).** The plan's "Round-open baseline
   (L1-measured at the base tip, transcripts committed under `base/`)" quotes
   `PROXY: DRIFT (C2_TOTAL_DRIFT declared=117 computed=118 delta=+1; AXES_DRIFT …)`, omitting
   the `A_DRIFT term=A declared=71 computed=73 delta=+2` clause that the committed transcript
   `base/baseline-gates.txt` prints first; the plan also asserts `CHECKLIST: 21/23 pass`,
   for which the committed base transcript carries no line (it holds proxy, G50, A51, D51
   and census only). Class resembles round-51 M4 (own-prose sweep); recorded for the
   integrator/judge, not entered as a lesson row.
3. **Wave-mined candidate mistakes** (entered as M2/M3 candidates in the lesson draft):
   CritFreeze F1 (both probe headers lack the plan's byte-identical predicate sentence;
   `build/CritFreeze/predicate-comparison.json`) and F2 (replaying at `f539a71e` differs
   from the committed base receipts at first bytes 49/51, revision field, plus the B5 detail
   shift). For the counter-vs-contract collision, three seats captured it independently:
   CritC1 (b), RevCounterA X1 (BLOCKER — "contract ↔ counter contradiction; 13/13
   unreachable for a conformant v2", noting the base receipt's `B4c PASS` was graded under
   v1 semantics), and RevCompat F2 (both B4c arms asserted together at
   `attest52-probe.mjs:377`); RevCompat F3 adds a softer whitelist ambiguity ("exactly the
   whitelist" lists ten fields with `stdin_sha256?` optional while v1 records nine, so only
   the required-plus-optional reading keeps B6 green), and its verdict calls the frozen
   counter "NOT a sound scorer of the frozen contract". None is upgraded to a round mistake
   here; the canonical judge decides.
4. **C2 gate inputs are measured, not admitted.** S102: 35,064 B, sha256
   `9ab2b886…e700a`, HTTP 200, fetched `2026-10-24T04:03:35Z`, 5-word quote at §5.6 line 422.
   S103: 172,329 B, sha256 `9c120292…d140`, HTTP 200, fetched `2026-10-24T04:03:47Z`,
   14-word quote at saved HTML line 1765, tier B proposed. Neither row exists in
   `corpus/SOURCES.md` at draft time (101 rows), consistent with ScoutCensus's wave-time
   snapshot at `04:04:02Z` (`A:87/B:6/C:8`, exit 0). Admission is not claimed.
5. **C2 prior-art conflict recorded for the entry author.** ConnOverlap reports that a C2
   sentence claiming the fleet had no RFC 3339 receipt-timestamp source is contradicted by
   kake `SOURCES.md:40` (kake S032, mined 2026-10-21, for publishing-receipt calendar/offset
   parsing); the entry must name that prior art without collapsing kumitate S102 into it,
   and sibling lanes stay read-only. Entered in the lesson draft's `## Gate` as a
   requirement, not a Gate decision.
6. **SentScope's two findings recorded, not adopted.** Low: five coordinator metadata paths
   (`w1-assignments|registry|spec|taskcall|validate.json`) lie outside the allowlist the
   sentinel tested; medium: fleet worktree not clean with attribution explicitly not
   established. This seat did not re-run either check and does not attribute the paths to a
   seat.
6. **Verbatim conflict for the canonical judge (no adjudication here):**
   - plan R52-11: `no frozen A51/D51 receipt committed at the measured close rev fef67079 (committed FINAL read 8/9@57333ead)`;
   - committed receipt line: `rev=57333ead…` with `held=8/9`;
   - filed report: `ATTEST_HELD held=9/9 checks=9 rev=fef67079…` with receipt named as `close/FINAL-*.txt`;
     no file `close/FINAL-*` exists at `fef67079`.

## Gates

None executed by this seat — no A52/D52/A51/D51, probe, selftest, counter, census, checklist,
build, lint or proxy run (scribe role; also the seat's gate is textual drafts). All invariant
statements above are from committed receipts and read-only git plumbing
(`cat-file -e`, `ls-tree`, `log`, `merge-base --is-ancestor`). The lesson/LOG drafts are
proposals; nothing here is claim evidence (Q26 class).

## Touched surfaces

- Created `.ufo/waves/round-52/build/ScribeLesson/round-52.md` (lesson draft).
- Created `.ufo/waves/round-52/build/ScribeLesson/LOG-entry.md` (LOG skeleton).
- Created `.ufo/waves/round-52/w1/ScribeLesson.md` (this report).
- Also ran `mkdir -p .ufo/waves/round-52/build/ScribeLesson` (own auxiliary path).
- Nothing else: no lane tracked file edited, no fleet/sibling write, no MANIFEST, no
  `.ufo/state` or `watchdog.log`, no git/jj mutation.

## Out of scope / not done

- Did not write `corpus/lessons/round-52.md`, `LOG.md`, `SCORECARD.md`, `QUALITY.md`,
  `SOURCES.md` or `README.md`; drafts stay under `build/ScribeLesson/` for integration.
- Did not draft or merge Q44 text (seat ScribeQuality's artifact); the lesson draft only
  names Q44 as part of the R52-11 fix.
- Did not execute any frozen counter or gate, did not inspect the 49 seats that had not
  reported, and did not exercise the flagged probe fixtures (CritC1/CritFreeze) — those
  depend on the canonical judge and the L1's post-wave battery.
- Did not verify the plan's `CHECKLIST: 21/23` baseline claim beyond showing the committed
  transcript lacks the line (finding 2).
- No tool installs/upgrades (none needed), per the paused-pacman guard.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-52/build/ScribeLesson/round-52.md`
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-52/build/ScribeLesson/LOG-entry.md`
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-52/w1/ScribeLesson.md`

## Limits

Draft-time snapshot: the mine queue used the 15 of 64 reports present at
`2026-10-24T04:06:12Z`; 39 were present at finalization (`04:07:38Z`) and the wave was still
in flight, so M2/M3/M4 may gain or lose candidates and the Gate decision slots and every
"Terms"/"Harm" placeholder in the LOG skeleton remain unfilled. The census figures are a
wave-time observation, not the close measurement. The lesson draft intentionally carries an
unadjudicated slot (M4) rather than a fabricated row; the integrator or the canonical judge
owns promotion. This report is provenance/closure material only, never claim evidence.

# Round 51 — lesson

Lane: kumitate. Round 51 (hyaku run 6; orchestrator attempt 1 — the `launch kumitate round=51`
line at `.ufo/watchdog.log:1095`, 2026-10-23T22:40:30-03:00; no `complete kumitate round=51`
line at this draft). Base and round-open tip `c90b9de94009b938fa19a089bfaa97df20b54f86`
(round-50 close B-records commit; the round-50 lesson `corpus/lessons/round-50.md` is the
parent). Freeze commit `06ecbf4703fe9515ae51f36a903c58825c250ccc` ("round-51: freeze plan,
counters A51/D51, w1 spec") carried the plan and both counters together, before any data seat
ran; the counters were then repaired **pre-data** under the plan's append-only
`## Freeze repair addendum` — `1fd8aceb` (A51 v1→v2), `3ed875d3` (D51 v1→v2),
`8c07e880` (A51 v2→v3), `8fd3cde1` (A3c sidecar), `4b8da21` (A4c + body arithmetic + header
claim), `cbca45c` (A3d), plus plan-text repairs `779b16e` and `8f3c692`. Counter bytes at this
draft's HEAD `8f3c692bb112f918bdbf8e6df4f5796614d1e103`:
`.ufo/waves/round-51/probe/attest51-probe.mjs` sha256 `73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c`
(rule A51, 9 checks A1/A2/A2c/A3/A3c/A3d/A4/A4c/A5) and
`.ufo/waves/round-51/probe/doctrine51-probe.mjs` sha256 `f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0`
(rule D51, 5 checks); plan `.ufo/waves/round-51/plan.md` sha256 `1cb5bd0bc586abe5bc3020df855e1ffc4d404d1e5c647c3ebd6df7d1eac2ed58`.
Plan `.ufo/waves/round-51/plan.md`; counters frozen pre-data
(`probe/attest51-probe.mjs` rule A51, `probe/doctrine51-probe.mjs` rule D51). Two claims, one
per axis: C1 operability `ATTEST_HELD` (A51) and C2 coverage `DOCTRINE_HELD` (D51).

Wave shape (plan.md § Waves): two v1 waves, 32 + 32 = 64 seats (≤128). Wave 1
`kumitate-r51-w1` (build, 32 seats, band 32–64; plan.md cites
`scripts/hyaku/ufo-wave-policy.json`, whose band note reads "16-32 -> 32-64"); the §3 L2 floor
(1 connector, 3 executors, 1 scribe, 1 scout, 1 reviewer, 1 critic; the planner seat is the
L1's). Wave 2 `kumitate-r51-w2` (falsify, 32 seats) dispatches only if wave 1 yields ≥32
distinct attack items. Residuals, if any, go to one ordinary task call ≤8 seats. Seats never
edit the lane checkout outside their own report/aux paths.

Wave 1 dispatch as committed (`.ufo/waves/round-51/w1/swarm-registry.json`, 32 members):
executor 8, scout 5, reviewer 5, critic 4, scribe 4, mutation-tester 2, connector 1,
sentinel 1, revenger 1, simplifier 1. Canonical attack-role mix
(reviewer + critic + mutation-tester + labrat) = 11/32 = 34.4%.

## Mistakes

- **M1 — a frozen counter's header promised a non-score exit-2 path its code never took, so an error
  reading was scored as an ordinary miss.** Class: declared-error-exit promise not implemented /
  error-vs-miss conflation in a frozen counter. Evidence: the class was surfaced by this round's
  reading of round-50's own seat artifact `.ufo/waves/round-50/r50/CritPredicateWording.md:38-48`
  ("Error versus scored miss: headers promise exit 2 that these branches do not implement") and is
  **absent from `corpus/lessons/round-50.md` M1–M6** (no `exit 2` / `never a score` /
  `malformed verdict` occurrence in that file; the round-50 close report's GAP list does not
  carry it either). Measured on round-50's frozen bytes at this draft (scratch clones only, lane
  checkout never written): `bindguard50-probe.mjs` sha256 `a9e79600…b61dc3` and
  `repairs50-probe.mjs` sha256 `f69dbc3e…a240d`, both matching the hashes cited by the round-50
  seat report — (i) `repairs50-probe.mjs` at the nonexistent revision
  `deadbeefdeadbeefdeadbeefdeadbeefdeadbeef` printed `REPAIRS50: LEDGER_UNMET held=2/8 …` and
  exited **1**, where its header (`:25`) promises "A crash or an unreadable blob is exit 2 (never
  a score)"; `blob()` (`:51-54`) returns `null` and `lsRev()` (`:55-58`) returns `[]` on failure,
  and both become ordinary misses (`R1 MISS no ## Gate`, `R2 MISS absent`, `R6 MISS missing`);
  (ii) the same counter at `589d25e4` (where `corpus/lessons/round-49.md` is absent) also scored
  `held=2/8` exit 1 rather than exit 2; (iii) `bindguard50-probe.mjs` at a scratch revision whose
  `cap-run.mjs` selftest prints `VERDICT: MAYBE` printed `G4 MISS exit=0 VERDICT: MAYBE` and
  `BINDGUARD50: GUARD_UNMET held=5/8` exit 1 — a score — where its header (`:25-26`) promises
  exit 2 for "a malformed verdict line". Recurrence, live in this round: the frozen A51 v1
  (`06ecbf4`) could not execute at all (a JSDoc glob `round-4*/**` closed the block comment early;
  `SyntaxError: Unexpected token '**'`) and a Node module-load failure exits **1**, which the
  plan's own freeze-repair addendum item 1 records as "a crash reads exit 1, indistinguishable
  from a legitimate UNMET"; the A51 header's exit-2 sentence survived until `4b8da21` corrected
  it to say a malformed verdict line is a MISS, not a crash. Fix, as landed: the A51 header now
  states the implemented behaviour and keeps exit 2 only for the archive-failure and
  throw-paths it actually implements (`attest51-probe.mjs:95-96`, `:319-320`); the D51 header
  (`:22-24`) matches its implemented branches. Shown able to fail: the three round-50 readings
  above and the pre-repair A51 crash receipt
  `.ufo/waves/round-51/build/ExecBaseCounter/attest-base-prerepair-crash.txt` (exit 1).
  Remaining limit for the L1 to record (not a defect, a boundary): a *scored* miss is
  indistinguishable from a legitimate negative unless the summary line is read; the counters do
  print `ATTEST51:`/`DOCTRINE51:` on every non-crash path, so the distinction is available.

Further rows for this section are **mined from wave findings — pending**: the L1's close
minings (the D3 column-index defect and the A51 v2 kill-rule falsification, both already
repaired pre-data and named in the plan's freeze-repair addendum items 1–3 and 7; the A4c, A3d
and A3c-sidecar challenge arms; the A3/A4 ledger-semantics clarification in addendum item 4)
belong here with their own class, evidence, fix and failing demonstration.

## Gate

- **Candidates.** S100 (man7.org `clock_gettime(2)`) and S101 (man7.org `getrandom(2)`) — both
  opened this round by scout seats, per plan.md § C2. Nothing else is a candidate this round:
  no round-50 row is re-opened, and no source is rejected.
- **Admitted.** Pending — the two rows are to be written by the L1 with status `mined` and
  `used-by` naming `corpus/knowledge/invocation-attestation.md`, and the row count goes 99 → 101.
  Opened and located this round (fetch receipts and quotes are in the seat reports
  `.ufo/waves/round-51/w1/ScoutClockSource.md` and `.ufo/waves/round-51/w1/ScoutRandomSource.md`;
  fetched bytes under `.ufo/waves/round-51/build/ScoutClockSource/` and
  `.ufo/waves/round-51/build/ScoutRandomSource/`):
  - **S100** — `https://man7.org/linux/man-pages/man2/clock_gettime.2.html`, HTTP 200, 30379
    bytes, body sha256 `7d7948bcf8400a786c2795b24e8da979d6e01610f7b8ea6bf1ab97f06205fb69`,
    fetched `2026-10-24T01:59:31Z`; located quote (22 words, DESCRIPTION `CLOCK_MONOTONIC`
    paragraph): "The CLOCK_MONOTONIC clock is not affected by discontinuous jumps in the system
    time (e.g., if the system administrator manually changes the clock)". Page identity note the
    L1 must carry into the row: the man7 page for `clock_gettime(2)` is titled `clock_getres(2)`
    (man-pages 6.19); the page does **not** say `CLOCK_MONOTONIC` is immune to NTP — NTP is named
    under `CLOCK_REALTIME` — so the row's `teaches` cell must not claim NTP immunity.
  - **S101** — `https://man7.org/linux/man-pages/man2/getrandom.2.html`, HTTP 200, 16466 bytes,
    body sha256 `366f0e7e27c7bd5e361e782bb12ce23215dabcd20ddc505eb91451cda49f7b3d`, fetched
    `2026-10-24T01:59:28Z`; located quote (17 words, DESCRIPTION paragraph 2): "By default,
    getrandom() draws entropy from the urandom source (i.e., the same source as the /dev/urandom
    device)". Page-identity caution the L1 must carry into the row: the string `CSPRNG` does not
    occur in the page (count 0), and the page does not state that Node's `crypto.randomBytes`
    calls `getrandom`; "CSPRNG" and "node uses it" are plan wording, not source text.
  - `opened` cell for both rows: the UTC fetch date `2026-10-24` (the `-03` local date was still
    `2026-10-23`); `recheck: 180d`.
- **Rejected.** Pending — none so far this round.
- **Spot-check.** Pending — round 51's own non-author closure is the L1's duty. This lesson
  claims no round-51 spot-check verdict. The round-49 non-author spot-check
  (`corpus/lessons/round-49-verifier-spotcheck.md`) remains the last outside verdict on record,
  and round 50's lesson claims none for itself.
- **Frontier — SOURCES (cells to change; to be filled by the L1 from the landed rows).** Rows
  99 → 101. S100 and S101 are new rows (status `mined`, `opened 2026-10-24`, `recheck 180d`,
  `used-by corpus/knowledge/invocation-attestation.md`); no existing row's `status`, `recheck` or
  `opened` cell changes, and no row is removed.

## Limits and integration constraints (measured by this seat; for the L1)

- **D51 is reachable at 5/5.** Measured in a scratch clone (lane checkout never written) at this
  draft's counter bytes: a house-shaped `corpus/knowledge/invocation-attestation.md` — `source:`
  as **line 1**, `verified-at:` line 2, `recheck:` line 3 — with ≥12 `- ` clause lines each
  carrying `receipt:<repo-path>@sha256:<64hex>`, plus S100/S101 rows inserted **inside** the
  `## Registry` table, read
  `DOCTRINE51: DOCTRINE_HELD held=5/5 checks=5 rev=ok rule=D51 | D1 PASS | D2 PASS | D3 PASS |
  D4 PASS | D5 PASS` exit 0. Two integration constraints follow, both learned by failing them
  first: (i) `scripts/sources-check.mjs:359` requires `lines[0].startsWith('source:')`, so a
  title-first entry fails D4 with `ENTRY_HEADER_REQUIRED`; (ii) the SOURCES rows must sit inside
  the `## Registry` table — appending them at end-of-file fails D4 with `ROW_OUTSIDE_REGISTRY`.
- **D1's window is five lines; the plan sentence says three.** `plan.md:100` states the trio is
  "in its first three lines", while `doctrine51-probe.mjs:11` (header) and `:64`
  (`text.split('\n').slice(0, 5)`) implement the first **five**. Measured: a trio at lines 3–5
  reads D1 PASS; at lines 4–6 it reads D1 MISS. Severity low (a house-shaped entry puts `source:`
  on line 1, where both readings agree, and D4 forces that shape anyway) — but the plan sentence
  and the frozen counter state two different windows, the QUALITY Q25 "predicate stated three ways"
  shape. Proposed minimal fix for the L1: amend the plan's D1 sentence to say five lines (the
  counter is frozen and its header and code agree with each other).
- **D2's "each carrying" is enforced as a count, not per clause.** Measured: 13 clause lines with
  12 bound read D2 PASS; 12 clause lines with 11 bound read D2 MISS. The counter's own rule
  (`clauses.length >= 12 && bound.length >= 12`) is satisfiable by one unbound surplus clause, so
  the plan's "≥12 clause lines, each carrying a … binding" is slightly stronger than the frozen
  check. Severity low; the L1 may either tighten the wording or leave it and record the reading.
- **`opened` is checked against UTC today.** `sources-check.mjs:403` and `sources-census.sh:90`
  both default to `date -u +%F`; the UTC fetch date `2026-10-24` was accepted in the scratch run
  above while the local `-03` date was still `2026-10-23`.
- **Brief-vs-repo wave-policy path.** The task brief cites
  `/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy-v1.json`; that file does not
  exist. The repo has `scripts/hyaku/ufo-wave-policy.json` (band note "16-32 -> 32-64") and
  `scripts/hyaku/ufo-wave-policy-v2.json`; `plan.md:138` cites the first. The plan's citation is
  the one that resolves.

## Evidence basis

Read `plan.md` (all 211 lines at HEAD, including the append-only freeze-repair addendum), both
frozen counters at HEAD, `corpus/lessons/round-50.md`, the round-50 LOG entry (`LOG.md:1977-2027`),
round-50's close artifacts (`close/CritCloseClaims.md`, `close/CritCloseReport.md`) and round-50
seat artifacts (`r50/CritPredicateWording.md`, `r50/RevControlReach.md`, `r50/MutReceiptSyntax.md`,
`r50/CritB49CounterAttack.md`), the round-51 scout reports, the wave-1 registry, the round-open
baseline (`base/baseline-gates.txt`) and `corpus/SOURCES.md` + `scripts/sources-check.mjs`.
Executed, with outputs quoted in the report: both round-51 counters at base `c90b9de9`; both
round-50 counters at a nonexistent revision and at `589d25e4`; the round-50 G50 counter at a
scratch malformed-verdict revision; D51 at three scratch revisions (trio at lines 3–5, 4–6 and
line-1 house shape; 13-clause/12-bound and 12-clause/11-bound variants; the 5/5 house shape); A51
at base against a scratch verdict-printing stub; the live sources census. Every scratch clone was
under `mktemp -d` and has been removed. No lane file, git ref, index, or sibling lane was
modified by this seat; no tool was installed or updated.

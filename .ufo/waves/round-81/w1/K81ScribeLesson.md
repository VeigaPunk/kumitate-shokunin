# K81ScribeLesson — round 81, lesson draft

Seat: K81ScribeLesson (scribe, round 81 w1). Text only: this file plus
`K81ScribeLesson-captures/`; no product-code edit, no git mutation, no subagent, no background
job, no tool install. Scratch used and removed: `/fast/scratch/hyaku/kumitate-r81/K81ScribeLesson/`
(a `git archive` of the base tip and one backdated receipt for the age-gate repro).

Target bytes: `d140f2883170cc1b0859ba5359bcdac3123a676e` (scaffolding) **plus** the uncommitted
seat artifacts on the worktree (the two frozen probes, `open/checklists.txt`, `corpus/QUALITY.md`,
`w1/`). Every reading below names its capture or its command.

## What I ran (receipts in `K81ScribeLesson-captures/`, `cap/` below)

| command | reading | receipt |
|---|---|---|
| `node .ufo/waves/round-81/probe/probe81-c1.mjs --set c1` | `C81_C1: HELD held=16/16`, exit 0 | `cap/counters-close.txt` |
| `node .ufo/waves/round-81/probe/probe81-c2.mjs --set c2` | `C81_C2: HELD held=15/15`, exit 0 | `cap/counters-close.txt` |
| same two, `--tool` = `git archive 77c7a8b3` extract | C1 `0/16`, C2 `4/15` (amended probe) | `cap/c1-base-postamendment.txt`, `cap/c2-base-postamendment.txt` |
| same two, pre-Amendment-1 probe bytes | C1 `15/16` (arm 1), C2 `9/15` (arms 04, 06, 10, 11, 12, 14) | `cap/c1-at-worktree.txt`, `cap/c2-at-worktree.txt` |
| `node scripts/proxy-check.mjs` | `PROXY: MATCH (A=889 C=41 … C2=201/201 … pins=6 match; source=snapshot)`, exit 0 | `cap/gates-close.txt` |
| `node scripts/spotcheck-adopt.mjs --check` | `SPOTCHECK_COVERAGE: CLEAN spotchecks=47 uncovered=0` + `MAP: CLEAN`, exit 0 | `cap/gates-close.txt` |
| `node scripts/readme-map.mjs` | `README_MAP: CLEAN files=201 rows=201 covered=201`, exit 0 | `cap/gates-close.txt` |
| `node scripts/omp-census.mjs` and `--compare .ufo/pins/omp-shape.json` | `CLEAN entries=65 findings=0 bound=35/35`; `IN_SYNC entries=65 receipt=65`, exit 0 | `cap/gates-close.txt` |
| `node scripts/kimi-census.mjs` | `CLEAN (members=55 checked=55 chain=22 info=4)`, exit 0 | `cap/gates-close.txt` |
| `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` | exit 0, six carried `W04` | `cap/gates-close.txt`, `cap/sources-counts.txt` |
| `node scripts/ready-handoff.mjs --lane . --round 81 --wave w1` | `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1`, exit 0 | `cap/gates-close.txt` |
| four selftests | `31/31`, `(98 cases)`, `34/34`, `163/163` | `cap/selftests-close.txt` |
| Q74 quote check on the two new rows | S236 22 words (prefix) / 30 (entry), S237 22 | `cap/gate-quotes.txt` |

Two findings the lesson carries beyond the counters: `open/checklists.txt` is **empty at the freeze
commit** (`0` lines at `f8783f4b` and at HEAD; 73 lines only in the worktree), and the amended probe
re-run changes the C2 base control from `1/15` to `4/15`.

---

<!-- ================= lesson begins (copy from here) ================= -->

author: kumitate L1 (round 81)
round: 81
lane: kumitate
base: 77c7a8b3fe7f3cebe681065da283de0ae38ddb5b (round-80 verifier spot-check)
freeze: f8783f4be4d7e14aedf125e2c3323d46ce0da403
scaffolding: d140f2883170cc1b0859ba5359bcdac3123a676e
report: .ufo/reports/round-81/kumitate.md (fleet repo)

# Round 81 — an admitted handoff, and a receipt that says when it was taken

Two claims, two axes: C1 `operability` (a new capability, `scripts/ready-handoff.mjs`, contract
`kumitate-ready-handoff-v1`) and C2 `coverage:omp` (`kumitate-omp-shape-v2`: `captured_at` beside
`entries`, `--shape` age disclosure, opt-in `--max-age` staleness gate). Both integers hold
(operability 9, coverage:omp 10 — `PROXY: MATCH … A=889 C=41 C2=201/201 … O=1/1 O_members=65
O_findings=0 O_bound=35 … pins=6 match`, `cap/gates-close.txt`). The moves are a new admission
layer over the run-7 inline handoff and a self-describing shape receipt; neither re-prices an axis.

## Gate

Two rows entered, both opened and captured on 2026-11-04; the captures are committed under
`.ufo/waves/round-81/build/L1/captures/` and every quote was re-located in those bytes by
`cap/gate-quotes.txt` (Q74: the count is the `wc -w` of the quoted bytes, not an estimate).

- **S236 — Kubernetes, *Admission Controllers Reference*** (docs, tier A) — **admit**. URL
  `https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/`, accessed
  2026-11-04; capture `.ufo/waves/round-81/build/L1/captures/kubernetes-admission.html` (574,395
  bytes, sha256 `1a86e90c…`). Located quote (22 words), *What are they?*: "An admission controller
  is a piece of code that intercepts requests to the Kubernetes API server prior to persistence of
  the resource". Scope: admit a request before it is persisted — the gate is the layer between the
  writer and the store, and its refusals are typed. The entry
  (`corpus/knowledge/ready-handoff-admission.md`) quotes the same sentence to its full stop, 30
  words; the SOURCES row's "21 words" is therefore wrong on both the count and the limit — 30
  breaks the ≤25-word rule. Recorded under `## Mistakes`, not silently rewritten here.
- **S237 — IETF RFC 9111, *HTTP Caching* §5.1 Age** (spec, tier A) — **admit**. URL
  `https://www.rfc-editor.org/rfc/rfc9111.html`, accessed 2026-11-04; capture
  `.ufo/waves/round-81/build/L1/captures/rfc9111.html` (232,630 bytes, sha256 `ce91ee98…`).
  Located quote (22 words): "The Age field value is the cache's estimate of the number of seconds
  since the origin server generated or validated the response". The row's "22 words" matches.
  Scope: a stored artifact carries its age, and the consumer declares freshness.
- **No third row.** S235 (clig.dev) stays rejected from round 80 with its flip unchanged;
  `source-dupes` reads `CLEAN groups=6 known=6` on the two new rows (`cap/gates-close.txt`).
  Registry: 175 rows, tier A 149 / B 16 / C 10, corpus files 201 (`cap/sources-counts.txt`);
  `README_MAP: CLEAN files=201 rows=201 covered=201` (`cap/gates-close.txt`).

## Counters

`open` = the receipts under `.ufo/waves/round-81/open/` and `controls/`, captured at the freeze
(before any data seat). `close` = this lesson's own captures under
`.ufo/waves/round-81/w1/K81ScribeLesson-captures/` (shortened `cap/`), measured 2026-11-04
06:52–07:04 -03 at `d140f288` plus the uncommitted seat artifacts. The closure re-derives every
close cell at its own tip with a `rev=` line; the counters and tools were still being edited while
this table was taken (see §Limits).

| counter | open | close | source |
|---|---|---|---|
| C1 counter `probe81-c1.mjs --set c1` | `0/16` exit 1 | `16/16` exit 0 | open `controls/c1-base.txt`; close `cap/counters-close.txt`; amended-probe base re-run `0/16` in `cap/c1-base-postamendment.txt` |
| C1 constant-printer stub | `3/16` | — (not re-run: stub bytes uncommitted) | `controls/c1-stub.txt` (`sha=529aec84`) |
| C2 counter `probe81-c2.mjs --set c2` | `1/15` exit 1 | `15/15` exit 0 | open `controls/c2-base.txt`; close `cap/counters-close.txt`; amended-probe base `4/15` in `cap/c2-base-postamendment.txt` |
| C2 constant-printer stub | `5/15` | — (bytes uncommitted; receipt carries no `sha=`) | `controls/c2-stub.txt` |
| live handoff `w1.ready` + `w1-dispatch.json` | gate absent at base (`0/16`) | `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1` exit 0 | `cap/gates-close.txt` |
| proxy `node scripts/proxy-check.mjs` | `DRIFT (C2_TOTAL 198/199; AXES coverage 10/9)` exit 1 | `MATCH (A=889 C=41 C2=201/201 … O_members=65 … pins=6 match; source=snapshot)` exit 0 | open `open/proxy-open.txt`; close `cap/gates-close.txt` |
| spotcheck coverage | `DRIFT spotchecks=47 uncovered=1 first=corpus/lessons/round-80-verifier-spotcheck.md` exit 1 | `CLEAN spotchecks=47 uncovered=0` + `MAP: CLEAN` exit 0 | open `open/spotcheck-open.txt`; adopt `open/spotcheck-adopt.txt`; close `cap/gates-close.txt` |
| README map | `CLEAN files=199 rows=199 covered=199` | `CLEAN files=201 rows=201 covered=201` | open `open/readme-map.txt`; close `cap/gates-close.txt` |
| OMP census | `CLEAN entries=65 findings=0 bound=35/35`; `IN_SYNC entries=65` | `CLEAN … bound=35/35`; `IN_SYNC entries=65 receipt=65` | open `open/census-open.txt`; close `cap/gates-close.txt` |
| kimi census | `CLEAN members=55 checked=55 chain=22` | same | open `open/kimi-census.txt`; close `cap/gates-close.txt` |
| sources census | exit 0, six carried `W04` | exit 0, six `W04`; rows 175, tier A 149 | open `open/sources-census.txt`; close `cap/gates-close.txt`, `cap/sources-counts.txt` |
| checklists | `36/39 pass` exit 1 at base `77c7a8b3` — **committed empty at the freeze**, 73 lines in the worktree | not run by this seat; the closure owns the close run | open `open/checklists.txt` |
| selftests | base: `omp-census` 89 cases; `ready-handoff` absent | `ready-handoff 31/31`; `omp-census (98 cases)`; `spotcheck-adopt 34/34`; `proxy 163/163` | close `cap/selftests-close.txt`; base `cap/c2-base-postamendment.txt` |

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `spotcheck-coverage` — the 10th recurrence: a verifier spot-check lands after the lane's close, outside the spotcheck set and the README map | `open/spotcheck-open.txt` → `SPOTCHECK_COVERAGE: DRIFT spotchecks=47 uncovered=1 first=corpus/lessons/round-80-verifier-spotcheck.md` and `MAP: DRIFT first=uncovered:lessons/round-80-verifier-spotcheck.md`, `check=1`, at base `77c7a8b3` | the round-open `SPOTCHECK_COVERAGE` gate, before any data seat — not the author | `open/spotcheck-adopt.txt` → `SPOTCHECK_ADOPT: ADOPTED corpus/lessons/round-80-verifier-spotcheck.md wrote=both` + `README_MAP: CLEAN files=199 rows=199 covered=199`, `adopt=0`; at the draft instant `cap/gates-close.txt` reads `CLEAN spotchecks=47 uncovered=0` + `MAP: CLEAN`. **Fail-ability:** the gate is red before the fix and green after, and the round's instrument is no constant printer — base counter `0/16` (`controls/c1-base.txt`) vs M `16/16` (`cap/counters-close.txt`), constant printer `3/16` (`controls/c1-stub.txt`) |
| `frozen-counter` — at the freeze the counters' own fixtures were wrong, and the frozen bytes were then edited | pre-amendment runs: `C81_C1: UNMET held=15/16` (arm 1 `DRIFT REPORT_TRAILER` on a legal fixture, `cap/c1-at-worktree.txt`) and `C81_C2: UNMET held=9/15` (arms 04, 06, 10, 11, 12, 14, `cap/c2-at-worktree.txt`). Committed vs worktree bytes: probe81-c1 `465eebf2…` vs `c837f011…`, probe81-c2 `10e177d5…` vs `886991f2…` (2 and 15 lines). The committed controls no longer match: `controls/c2-base.txt` `1/15` vs `cap/c2-base-postamendment.txt` `4/15` (arms 4, 9, 13, 14 pass at base), and the plan's `controls/stub/` pointer is dead — only four `.txt` files exist and `c2-stub.txt` carries no `sha=` | the counters' own arms; independently `K81ConnOverlap.md` §6.2–6.4 and `K81ScoutReconC2.md` F10 | plan Amendment 1 (append-only, items 1–6) names every fixture change and the tool defect the frozen arm caught (`omp-census.mjs` `main()` dropped `parsed.maxAge`, so the CLI gate never fired); the probe bytes are re-hashed here and the base control re-captured on the amended bytes. The kill rule survives (base `0/16` and `4/15` are both below HELD); the plan's discriminating-arm list does not |
| `empty-receipt` — a quoted reading has no committed receipt (the R80-1/R80-11 class, recurring at this freeze) | `open/checklists.txt` is `0` lines at `f8783f4b` and at HEAD `d140f288`; the worktree file is 73 lines, begins `rev=77c7a8b3… (base tree)` and ends `CHECKLIST: 36/39 pass` / `VERDICT: FAIL` / `exit=1`; `git status --porcelain` shows ` M` on it | this seat's committed-vs-worktree sweep, not the gate runner | commit the 73-line receipt with the round; until then the Counters row `checklists` cites it as worktree-only |
| `record-count` — a Gate row's word count is wrong and its quote breaks the ≤25-word rule (third recurrence after r79 D4 and R80-5) | `corpus/SOURCES.md:190` says "quote 21 words"; `corpus/knowledge/ready-handoff-admission.md` quotes the capture's sentence to its full stop at **30** words; `cap/gate-quotes.txt` locates the 30-word sentence and the 22-word prefix in `kubernetes-admission.html` at offset 26805 | this seat applying Q74 (`corpus/QUALITY.md`, added this round) to the two new rows | the lesson's Gate quotes the 22-word located prefix; the SOURCES count and the entry's quote still need the edit (Q74's arithmetic on the committed entry returns 30, over the limit) |
| `false-green` — a checklist item greens a refusal | `SKILL.md:756` pipes `omp-census --shape … --max-age 30` into `grep -q "age_days="`; on a 45-day receipt the refusal line `SHAPE_STALE age_days=45 max_age=30` matches the pattern, so the item prints `age-disclosed` and `checklist_exit=0`; the tool also dies of an uncaught `EPIPE` when the reader exits first | `K81ScoutReconC2.md` F2 (capture `checklist-756-stale.txt`), not the item's author | assert the exit status (or invert a `grep -q SHAPE_STALE` match) and handle `EPIPE` in `io`; item text and command unchanged at this draft |

## Routed-defect answers

R80-1 … R80-12 (from `corpus/lessons/round-80-verifier-spotcheck.md` §Routed defects). The
append-only errata were committed at `d140f288`; nothing below rewrites a round record's bytes.

| id | disposition | evidence |
|---|---|---|
| R80-1 | append-only erratum | `corpus/lessons/round-80.md` §Errata item 1; the only checklist receipt is `.ufo/waves/round-80/close/checklists.txt` (`rev=6cbd6750`); no scaffolding receipt exists at any revision |
| R80-2 | append-only erratum | item 2; `close/readme-map.txt` reads `CLEAN files=198 rows=198 covered=198` |
| R80-3 | append-only erratum | item 3; `open/c1-base.txt` has six `PASS` arm lines (arms 6, 7, 9, 10, 11, 12) |
| R80-4 | append-only erratum | item 4; `open/conflation.txt` shows the base `--adopt` as `ALREADY_ADOPTED … exit 0`; the refusal is `open/c1-base.txt` arm 08 |
| R80-5 | append-only erratum + gate | item 5; Q74 added to `corpus/QUALITY.md` (worktree at this reading) — and the class recurred on S236, see §Mistakes `record-count` |
| R80-6 | why-not — still red | `SKILL.md:632` tail still reads `contract kumitate-spotcheck-adopt-v1` and "`--selftest` (16 hermetic cases …)"; `SKILL.md:746` head says "the `--selftest` suite is 34 cases" while its tail says "the tool's 28-case suite". One edit (v3.1 / 34) closes both |
| R80-7 | fixed in place | `S117`/`S118` `used-by` at `d140f288^` carried `corpus/knowledge/worker-heartbeat-liveness.md, corpus/knowledge/two-reading-verdicts.md`; at `d140f288` only `corpus/knowledge/worker-heartbeat-liveness.md`. Old→new logged here |
| R80-8 | append-only erratum | item 8; `close/spotcheck-selftest.txt` reads 34/34, so "26 → 28" is superseded by "26 → 34" |
| R80-9 | append-only erratum | item 9; the report's receipt row is measured at `6cbd6750`; the fleet report is not in the lane's write scope |
| R80-10 | fixed here | every round-81 control and open receipt ends with an `exit=` line (`controls/c1-base.txt`, `c1-stub.txt`, `c2-base.txt`, `c2-stub.txt`, `open/proxy-open.txt`) |
| R80-11 | fixed here | `open/spotcheck-adopt.txt` is the committed transcript (`ADOPTED … wrote=both`, `adopt=0`) |
| R80-12 | why-not — not exercised | no duplicate row was created this round; `source-dupes` reads `CLEAN groups=6 known=6` (`cap/gates-close.txt`); the r80 red-before stays uncommitted and is not fabricated; the S233 withdrawal remains re-derivable from `509afb1d` vs `6cbd6750` |

## Wave

ONE v1 wave, 14 seats, from `.ufo/waves/round-81/w1-dispatch.json`, admitted by the round's own
gate: `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1
roles=scout=2,connector=1,executor=3,mutation-tester=1,reviewer=2,critic=1,sentinel=1,scribe=2,revenger=1`
exit 0 (`cap/gates-close.txt`). Attack 4/14 = 28.6 % under the gate's set (`reviewer`, `critic`,
`mutation-tester`, `labrat`); `sentinel` and `revenger` are not counted by it (see §Limits).

Settled at this draft's instant and read by this seat: `K81ConnOverlap.md`,
`K81ScoutReconC1.md`, `K81ScoutReconC2.md` (sibling-overlap scan and the two surface recons); the
defects they prove are folded into §Mistakes and §Limits with their receipts. The remaining seats
had not filed when the draft was written; the closure integrates `w1-results.json` and the
per-seat reports under `w1/`.

## Limits

- **The close cells are a live-tree snapshot.** The tools were edited during the measurement
  window: `scripts/omp-census.mjs` read `f19cb1b3…` at 06:54 and `ba7cbc8f…` at 06:58 (mtime
  06:55:03), `scripts/ready-handoff.mjs` `f8b4a92b…` (mtime 06:49:23). A closure must re-run every
  close cell at its own tip with a `rev=` line (round 80's D6 rule).
- **The frozen counters were amended after their controls were captured.** `controls/*.txt` were
  taken against the pre-Amendment-1 probe bytes; the amended probe moves the C2 base control from
  `1/15` to `4/15` (arms 4, 9, 13 and 14 pass at base; arm 9 was green before too, arms 4 and 14
  became preservation arms with the amendment, and arm 13 rides the lane's re-pinned receipt; C1
  stays `0/16`). The plan's "arms 10–13 fail at base" is therefore false for 13. The stub readings
  (`3/16`, `5/15`) cannot be re-derived: their bytes are not committed, the plan's `controls/stub/`
  pointer is dead, and `c2-stub.txt` carries no `sha=`.
- **C2's counter is not independent of the rest of the lane.** Arms 11 and 12 read the whole
  proxy verdict (`verdict=MATCH`), so C2 cannot read HELD while any other pin, stanza or axis is
  red (`K81ScoutReconC2.md` F9: a missing `pin.ready-handoff` registration made the proxy
  FAIL-CLOSED at 09:51Z). An UNMET C2 is not by itself a receipt defect.
- **The 98-case suite never enters `main()`.** `capture()` calls `runShape` directly and the file
  has zero `spawn` calls, so the Amendment-1 item-5 fix (`main()` dropped `parsed.maxAge`) has no
  regression test; reverting the 4th argument re-passes the suite (`K81ScoutReconC2.md` F1,
  `K81ConnOverlap.md` §6.1). The plan's "97 cases" and this draft's 98 are both true at different
  bytes.
- **The gate is not in the take path.** Nothing fleet-side invokes `ready-handoff.mjs`; the
  orchestrator polls `<wave>.ready` and spawns the payload unchanged, so r79 and r80 would read
  DRIFT under it and were dispatched anyway (`K81ScoutReconC1.md` F1). Until the orchestrator
  calls it, admission is L1 discipline, not a harness invariant.
- **No admission receipt is kept.** The w1 ready/dispatch pair was written at 06:49:16.9, 6.2 s
  before the pinned gate bytes (06:49:23.17); the gate prints an FNV-1a 8-hex `dispatchSha`
  (`ready-handoff.mjs:72`, used at `:197`) and discards it, so nothing records which revision
  admitted the handoff (`K81ScoutReconC1.md` F3; the three mtimes are re-read here); the take took
  240 s against the contract's ~15 s (F14).
- **`--selftest --work <missing>` stays an uncaught ENOENT** in the tool (`omp-census.mjs`
  `mkdtempSync` without `mkdirSync`); the probe now creates the directory (Amendment 1 item 4), so
  the arm passes while the tool-side edge remains (`K81ScoutReconC2.md` F3).
- **The v2 cutover is half-done in the docs.** `corpus/knowledge/omp-agent-root.md:180-200`,
  `SKILL.md:610`, `SKILL.md:754` and `corpus/knowledge/snapshot-bound-derived-scores.md:35` still
  assert the v1 receipt, and the proxy has no v2 fixture of its own (`K81ScoutReconC2.md` F4/F5).
- **`--compare` is host-bound.** Inside one measurement window the live root read
  `DRIFT entries=69 receipt=65 added=2 transient=2 first=models.db-shm` (06:58) and `IN_SYNC`
  (06:59); only a commit-time capture is evidence, and the O integer never reacts to it.
- **Age is self-asserted.** `captured_at` is the writer's claim; the custody chain is
  `pin.omp-shape`, so a re-labelled receipt is a new receipt re-pinned in the same commit. A
  re-snapshot is no longer byte-idempotent (`captured_at`), so "re-snapshot equals the receipt" is
  not a valid check — `--compare` plus the pin is (`K81ScoutReconC2.md` F7).
- **The attack-role prose has no machine authority.** The plan §Wave shape names `sentinel`; the
  gate's `ATTACK` is `(reviewer, critic, mutation-tester, labrat)` (`ready-handoff.mjs:37`), which
  matches the prompt's v2-wave line but no policy key (`ufo-wave-policy.json` has no `attack` key —
  `K81ScoutReconC1.md` F10). This wave reads 4/14 either way only because it carries a
  mutation-tester; a wave that swapped it for a sentinel would read 3/14 = 21.4 % and be refused.
- **R80-6 remains open**, so the round-80 routed set is not fully closed: `SKILL.md:632` and
  `SKILL.md:746` still carry the v1/16 and 28-case text beside their v3.1/34 heads.

<!-- ================= lesson ends ================= -->

## Seat notes (not part of the lesson)

- No `[x]` was written anywhere; no commit, push, or mutating git/jj call was made (read-only
  `git log`/`git show`/`git diff`/`git ls-tree`/`git archive` only; the archive was extracted in
  scratch, and `git -C <lane>` was never mutated).
- The base archive was extracted to
  `/fast/scratch/hyaku/kumitate-r81/K81ScribeLesson/base` and removed with the rest of the seat
  scratch before this report was filed.
- The lesson deliberately states which close cells are the draft instant's and which are
  closure-owned rather than presenting a mid-round reading as the round's final value.

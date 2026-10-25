# Round 43 — verifier spot-check (kumitate)

author: hyaku closure (non-author integrator, @m_opus)

Closure of kumitate lane-round 43. Lane base `2a7f37d2b0a413db8499b413783c27a0effdc989`, tip
`b01ded326d17f9e445b4b8cd6ce2358ffb07385f`, measured commit `84cb1d5d8e703aafd4f73d887ba4237692ff13f9`;
report `.ufo/reports/round-43/kumitate.md` (fleet `4a2d914cc0a1b980ef47f3af85a6c95c4f3cb269`); dispatched
prompt `.ufo/prompts/kumitate-round-43.md` (fleet `765c4cd`). Driver digest (copied from the mutable
`.ufo/watchdog.log`):

    2026-10-22T19:03:39-03:00 launch kumitate round=43 pgid=3360354 driver=hyaku-inline attempt=1
    2026-10-22T20:18:50-03:00 complete kumitate round=43; hyaku-inline attempt=1

Method: committed bytes only (`git show`/`diff`/`log`, `grep`, `sha256sum`, `curl` on the cited URLs).
No lane gate, selftest, counter or recursive test was executed by this closure. Four read-only seats
(JunkVsA1, ReceiptVerify, WitnessDiffCritic, SourcesSpotcheck) did the re-checks in parallel. No tool was
installed or updated. Holds `AtkNovelIdentity` and `AtkNovelRecords` were not recreated.

## Verdict

**status `ok`, admitted `false` (`rejected-honest-stop`).** C1's after-value reproduces exactly from
committed receipts, and the witness code is a genuine second verdict path. C1 still does not verify:
prompt addendum §9 requires that a target be one a control skipping the claimed work cannot reach.
Committed junk controls with no verdict path reach this target. That holds under K43 alone, the
predicate declared before data, and also with addendum A1 counted. No axis was harmed.

## Step-1 conformance

| check | command | observed | result |
|---|---|---|---|
| report landed by lane identity | `git log --format='%an %H %ci' -- .ufo/reports/round-43/kumitate.md` | `kumitate-shokunin 4a2d914cc0a1b980ef47f3af85a6c95c4f3cb269 2026-10-22 20:18:29 -0300`, after the lane tip (20:18:20) | pass |
| `SHONEN` heading, one line per box | `grep -c '^- \[' SHONEN.md` → 4; report `## SHONEN` has 4 lines (`[~]`×3, `[ ]`×1) | 4 = 4 | pass |
| cited lane commits exist and are ancestors | `git merge-base --is-ancestor <h> refs/heads/master` for 2a7f37d2, 0f4108bf, e5ffcbe7, df1ceaf8, fb3eab40, 84cb1d5d, 003dd285, 7f899ea2, b01ded32 | 9/9 `commit` + ancestor | pass |
| source pin `31c465f1` | `git cat-file -t` in the lane | not a lane object; it is the pinned domain clone (`/fast/scratch/hyaku/kumitate-pin/src`), cited as source, not as lane work | n/a |
| pushed, nothing uncommitted | `jj-lane.sh state …` | `branch=master local=remote=b01ded32… ahead=0 behind=0 head=detached tracked=0 untracked=0`; `git status --porcelain` empty; `ls-remote` `b01ded32…` | pass |
| prompt carries the template contract | `.ufo/prompts/kumitate-round-43.md` §1–§5 | mission/axes binding, 1–3 claims, L2 floor, report path + required sections + SHONEN rule, commit-then-push, push scope, L0 channel, write scope, hash citation (§6.4 "lands last and cites the pushed lane hash") | pass |
| census | `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` | `kumitate W04 S034 duplicate url …` / `kumitate ok …/corpus/SOURCES.md`, exit=0 | pass (W04 is a warning) |

Conformance defects (status-neutral): the report's `## Landed changes` lists `b01ded32` twice
(`kumitate.md:74-75`). `kumitate.md:117` is a dangling sentence ("The operator and the closure rule.").
`kumitate.md:35-37` says four junk routes led to A1, but A1 names two (`addendum-A1.md:6-11`). Of the
other two, J4b came from a falsify seat after the measured run. Route A ran before A1 but A1 does not
name it.

## Claim C1 — operability, capability `gate-mutants` re-claimed under K43

Declared before data at `0f4108bf:.ufo/waves/round-43/plan.md:13-58`. Before: `SURVIVED … frozen=34/41`,
exit 1, at `2a7f37d2`. After (one value): `CLEAN … frozen=41/41`, exit 0, at the measured commit. The
plan's kill rules are: J1–J3 must not read CLEAN, no frozen literal may stop applying, and the case
floors cite-check 75 and wave-census 31 must not be lowered.

**Re-measured over committed bytes (this closure):**

- `git show 0f4108bf:scripts/gate-mutants.mjs | sha256sum` →
  `e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a` (= plan). Both receipts print that sha
  for the extracted counter: `open/c1-control-base.txt:2`, `final/c1-measured-84cb1d5d.txt:3`.
- Before, `grep -c '^MUTANT .* survived ' open/c1-control-base.txt` → 7, out of 43 `MUTANT` lines. The
  survivors are `cite-check:{suite-any-fail,suite-exit-text,suite-group-verdict}` and
  `wave-census:{exits/M19-selftest-exit-const,survivor/V382-pass-count,survivor/V385-verdict-const,survivor/V387-exit-const}`,
  the same set as `plan.md:46`. Summary line: `GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 … rev=2a7f37d2…)`, `exit=1`.
- After, `grep -c '^MUTANT .* killed ' final/c1-measured-84cb1d5d.txt` → 43/43, all `confirm=same`.
  Summary line: `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=84cb1d5d…)`, `exit=0`.
  `CONTROL` and `CONTROL_AFTER` read PASS for both suites. Case totals are cite-check 75/75 and
  wave-census 32/32, against `MIN_CONTROL_CASES` {75, 31}, which is the same at `0f4108bf:35` and
  `84cb1d5d:35`.
- The kill code matches K43 (a)–(d): `0f4108bf:scripts/gate-mutants.mjs:446-457`. A kill needs a
  numeric non-zero exit and an exact `VERDICT: FAIL` line. The receipt's `verdict=PASS` field on
  `suite-group-verdict` and `suite-any-fail` comes from `detailFor` (`:436`), which prefers PASS when both
  lines are printed. The witness adds the second line at `84cb1d5d:scripts/cite-check.mjs:2665`.
- A1 at M: `final/c1-discriminators-84cb1d5d.txt` → `D-static added_self_reads=0`, D-null both exit 0,
  `C1_DISCRIMINATORS: PASS`, exit 0.

**Evidence-verified (seat reports, not re-executed):** J1–J3 read ERROR exit 2
(`build/ExecJunkControls.md:9,14,20`). ReRunC1Counter and ReRunC1Base reproduce the after-run and the
before-run. The diff reviews ReviewCiteWitnessDiff and ReviewCensusWitnessDiff rate the witness `genuine`.
WitnessDiffCritic (this closure) agrees. The added lines read no source, hash or stored copy. The witness
counts `!ok && !skipped` over the recorded results (cite-check `84cb1d5d:2642-2649`, wave-census `:603-613`).

**Why C1 does not verify.** Committed controls that skip the claimed work reach the declared target:

| control (scratch commit) | what it is | counter | A1 | when | evidence |
|---|---|---|---|---|---|
| J4 (431d3b63) | suite checks its own source for the frozen literals | CLEAN 41/41 exit 0 | FAIL | wave 1 | `build/ExecJunkControls.md:26-27`; `probe/c1-discriminators-controls.txt` |
| tripwire (8310b96c) | self-digest against a stored copy | CLEAN exit 0 | FAIL | wave 1 | `build/CritK43Rule.md:6`; probe receipt |
| route A (f9ac7532) | 4 lines: fail when `import.meta.url` contains `kumitate-gate-mutant-` | CLEAN 41/41 exit 0 | **PASS** | run ~22:20:53Z, before A1 (22:30:45Z); committed in `fb3eab40`, before the measured commit | `build/CritC1Target.md:5-6`; `falsify/CritA1Addendum.md:15-16` |
| J4b (da1ebe10) | self-read through an unlisted alias | CLEAN exit 0 | **PASS** | falsify | `falsify/CritA1Addendum.md:9-13` |
| CritJunkAtM (068a31f0, on top of 84cb1d5d) | witness keyed on TMPDIR | CLEAN (run 2) | **PASS** | falsify | `falsify/CritJunkAtM.md:1,12,17` |

The prompt as dispatched (`.ufo/prompts/kumitate-round-43.md:352-358`) says: "build the cheapest control
that skips the claimed work, score it with the frozen counter … if it meets the target, the counter or
target is wrong — fix it before data". It also says "the claim is judged on the version declared before
data".

- **Judged on the pre-data predicate (K43 at `0f4108bf`):** J4, the tripwire and route A all meet the
  target. The counter cannot tell the witness work from junk.
- **If A1 is counted:** A1 was written after seat counter data on the witness work. ExecCensusWitness
  recorded `SURVIVED frozen=38/41` in the lane at 19:30:09 -03, 36 s before A1's 19:30:45 -03 commit
  (`build/ExecCensusWitness.md:38`). A1's only independent attack is CritA1Addendum, a post-data falsify
  seat rated `strengthening`, and it shows A1 defeated: route A, J4b and CritJunkAtM pass K43 and A1
  together.
- The lane names the open hole itself: "a temp-path tripwire evades A1; the diff review is the backstop"
  (`corpus/lessons/round-43.md:161-162`).

A qualitative diff review cannot stand in for the counter of a counted claim. C1 was not declared
exploratory, so `unprovable-but-better` is not available to it. Not harmed: `falsify/CritNoHarm2.md`;
cite-check selftest median 1111 → 1111 ms (`round-43.md:196-198`).

**Also noted (not decisive):**

- **Measured revision ≠ shipped tip.** Close commit `7f899ea2` changed the witness switch in
  `scripts/cite-check.mjs` after the measurement. The sha256 is `227f5645…` at 84cb1d5d and `115bfde4…` at
  b01ded32. No lane-committed frozen-counter receipt exists for the shipped bytes; the only runs are
  CritPrimaryOnlySwitch's scratch runs.
- **Best-of-N.** On the same suite bytes, the L1 trial read `ERROR … frozen=38/41 unstable=3`
  (`final/trial1-working-copy-unstable.txt`). Two diagnostic-gate runs then read CLEAN before the counted
  run. This is disclosed in the lesson but not in the after receipt.
- **Witness faults survive K43.** Single-token faults on the witness lines (WA, WB, WC; CritC1Claim
  `weaker`) survive. MutCiteWitness was cancelled: its findings are absent, not passed.

## Per-axis verdicts

| axis | verdict | basis |
|---|---|---|
| operability | unprovable | C1 not verified: junk controls reach the target, see above; witness genuine by diff review; integer held 9; not harmed |
| coverage (retired) | unchanged | proxy stanza `C2`/`C2_total` 94 → 96 (README rows only, not claimed); `git diff 2a7f37d2 b01ded32 -- SCORECARD.md` |
| coverage:script-layer | unchanged | `S_members`/`S_sections` 88 not in the SCORECARD diff |
| coverage:runtime-layer | unchanged | `R_members` 92 not in the SCORECARD diff |
| coverage:kimi-layer | unchanged | `K_members`/`K_sections` 53 not in the diff; D7 is hardening only (`pin.kimi-census` re-pinned) |

SCORECARD diff spot-read: the proxy `A` goes 10 → 11 (the committed probe script, unclaimed), the pins are
re-pinned, Move log row 43 is added, the capability row `gate-mutants` is edited in place, and two
appended sections are added. No axis integer moved.

## Discernment spot-check

Sample from `corpus/lessons/round-43.md` `## Gate` (lines 64-105). Re-opened by this closure or its seat
SourcesSpotcheck. Word counts use `printf '%s' "<quote>" | wc -w`.

| item | decision | re-opened source | agree/disagree | reason |
|---|---|---|---|---|
| S046 | admit (A, mined) | https://par.nsf.gov/servlets/purl/10104340 (HTTP 200) | agree | quote verbatim in the PDF text, 24 words; PDF sha256 `45da8b5f…` matches the row; primary peer-reviewed paper, so it grounds K43 (d) |
| S048 | admit (A, mined) | https://cosmic-ray.readthedocs.io/en/latest/concepts.html (HTTP 200; closure `curl` → "If a test of a mutant takes longer than the timeout, the test is killed, and the mutant is marked incompetent.") | agree | quote verbatim, 21 words; pinned rst sha `1603d615…` matches; minor: `f6550adf` resolves under `sixty-north/cosmic-ray`, which the row does not name |
| S047 | admit (A, mined) + erratum | https://infection.github.io/guide/ (HTTP 200) | agree, with the erratum | quote at `guide/index.md:13`, 12 words. The erratum is correct: `4d7570f5` is in `infection/infection.github.io`, not `infection/site`. The same file's lines 94 and 99-101 sum kills, timeouts and errors, which contradicts "(not the MSI aggregate)". The narrowing to "a kill is read off failing tests" is fair |
| S049 | reject (B) | conf.researchr.org …Unreliably-Killed-Mutants (HTTP 200) | agree | abstract only; the 19% figure has no method or sample on the page, and a tier-B abstract cannot be the sole support (Q2/Q3) |
| S050 | reject (C) | https://softengbook.org/articles/mutation-testing (HTTP 200) | agree | no date or revision; the denominator is "total number of generated mutants", which contradicts S034 as the lane says |
| S051 | reject (C) | https://circleci.com/blog/what-is-mutation-testing/ (HTTP 200) | agree | the threshold has no measurement (Q3); it also says timeouts count as killed, against S048 |
| S052 | reject (C) | stackoverflow.com/questions/73439324 via the SE API (HTTP 200; the HTML page is a 403 bot-wall) | agree | community source; the answer has score 1 and is not accepted; the second answer disagrees; the flip names the PIT mutators page |

SOURCES.md rows: `git show 2a7f37d2:corpus/SOURCES.md | grep -c '^| S[0-9]'` → 45; at b01ded32 → 52
(+S046–S052). Newly written row re-opened: S048 (`corpus/SOURCES.md:61`); its ≤25-word quote checks
(21 words, verbatim). S039 `used-by` gains `corpus/lessons/round-43.md`, which matches the lesson.

Result: 3 admits and 4 rejects sampled, 7/7 agree. The S047 locator/scope disagreement was found by a
lane seat and filed as an erratum before closure.

## Trend verdicts

- **expansion — improved.** Three new tier-A `mined` rows (S046–S048) on mutation-kill semantics and
  flaky kills, ground the registry did not hold. All three were re-opened and their quotes verified by
  this closure.
- **quality — improved.** The S047 row was found partly wrong and marked with a named erratum rather than
  left standing. Five pre-round rows were rechecked (S010, S013, S014, S024, S026). Round-42 statements
  got appended corrections, and D5 was retracted with cause. No admitted entry fails its re-check unmarked.
- **discernment — improved.** The outside spot-check agrees with the gate on all 3 admits and all 4
  rejects sampled.

## Routed defects (kumitate owes these next round)

1. **R43-1 C1 counter is gameable before data.** Route A (`f9ac7532`) met K43 + A1 before the measured
   run, and J4b and CritJunkAtM did so after. The next counter must be scored against these exact
   controls and fail them before it is frozen. Candidates: D-path/D-equiv (`falsify/CritA1Addendum.md:28-32`),
   or one run prefix with a non-listable TMPDIR (SentinelWitnessGaming).
2. **R43-2 A1 timing.** A1's "before any measured run" (`addendum-A1.md:3-4`) holds only for the
   integrated commit; seat counter runs on the witness work preceded it. Also correct the report's
   "four routes → A1" attribution in the next report.
3. **R43-3 measured ≠ shipped.** Commit a frozen-counter receipt over `7f899ea2`/`b01ded32` (cite-check
   `115bfde4…`), or record the gap where the capability row cites evidence.
4. **R43-4 capability row `gate-mutants`.** Apply the conditional correction the lane pre-registered
   (`SCORECARD.md` "Round 43 correction": "otherwise the row is corrected to record the miss"). The row
   still stands on unverified evidence.
5. **R43-5 witness single points.** WA/WB/WC survive K43, and K43 (c) accepts runs that print both
   `VERDICT: PASS` and `VERDICT: FAIL`. Add these mutants to the next frozen manifest. MutCiteWitness and
   SentinelReaper were never performed and are owed.
6. **R43-6 receipts.** After receipts must name the earlier runs on the same bytes (trial1 ERROR, the two
   diagnostic runs). Fix the report minors: duplicate `b01ded32` line (`kumitate.md:74-75`) and the
   dangling sentence (`kumitate.md:117`).

## Notes for the operator

SHONEN boxes in the report are `[~]`×3 and `[ ]`×1, all asserted by the author. None is checkable by a
non-author this round: box 1 cites the K43 row, which rests on C1, and C1 did not verify. Promotion stays
operator-owned. `plan.md:8` records that one more rejection parks the lane for the leg; this is that
rejection.

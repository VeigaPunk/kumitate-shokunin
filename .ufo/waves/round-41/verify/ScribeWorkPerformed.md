RESULT ScribeWorkPerformed rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=drafted bullets=11

Scope: draft of the round report's `## Work performed` and `## Landed changes` sections for kumitate
round 41 (attempt 2). Source: `git log a58b7f72..fae386aa` (8 commits), `corpus/lessons/round-41.md`,
`LOG.md`, `SCORECARD.md`, `SKILL.md`. The `## Landed changes` table covers that range only; the
verify wave's own commit `57269a5` is evidence for the closure, not part of the two claims. The L1
integrates; this file is the only thing written.

## Work performed

Declared claims (two, one axis each). Round open `a58b7f72afc1eb44b37e438a2f8b212c658874e5`;
target revision `fae386aa9e0542710b7a893d84c8e92e86fc079b`; source pin `31c465f15669f744848bd9f5d56191c5085670f7`.

1. **C1 — operability (the lowest non-retired axis, integer held at 8).** `scripts/cite-check.mjs`
   pins the 16 verdict, render and exit conditions the round-40 scout named `unpinned=16`
   (`.ufo/waves/round-40/build/ScoutCiteVerdict.md:1`). Eleven hermetic cases were added
   (64 → 75) at `scripts/cite-check.mjs:2386-2481`. Counter, committed before its first counted run:
   `.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` (74 lines, `git show cb2d8d0`). Before,
   at `a58b7f72`: `survived=15/16` (only `resolved>0` killed). After, at `68db3419`: `survived=0/16`,
   reproduced at `4e58bb0e` and at `fae386aa`. I re-ran the probe myself at all three revisions in
   a scratch clone and reproduced each number.
2. **C2 — capability `wave-census` (learning claim; the per-axis verdict lands on operability, A 8 → 9
   and C 15 → 17, so under AXES.md's distinct-axis rule the round is one operability move plus one
   capability row).** New instrument `scripts/wave-census.mjs` (408 lines at `fae386aa`) reads a round's committed
   `*-dispatch.json` payloads and the report files their `Report:` trailers name. Counter
   `.ufo/waves/round-41/probe/wave-recount.sh.txt`, committed in `2759297` before the instrument.
   Before, at `27592977`: `RECOUNT_MISMATCHES=7`, `CAPABILITY_ROWS=1`, both `--expect` calls exit 1
   (module not found). After: `RECOUNT_MISMATCHES=0`, `CAPABILITY_ROWS=2`, `--expect
   build:mutation-tester=4` exit 1 and `=3` exit 0. Sourced on S038.

Work items:

- **Plan, frozen counters and open receipts.** Commit `34fccc1` (plan `.ufo/waves/round-41/plan.md`,
  open receipts `.ufo/waves/round-41/open/receipts.txt`, the R40-7 `corpus/README.md` row).
  The open receipts record `CHECKLIST: 14/15`, `PROXY: DRIFT` with `C2_TOTAL_DRIFT declared=90
  computed=91` and `AXES_DRIFT coverage`, `cite-check` 64/64, `sources-check` rows=37.
- **C1 counter committed before its first run.** Commit `cb2d8d0` adds
  `.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` (16 single-condition mutants, one per
  named condition; killed = at least one case failed; a crash is not a kill).
- **C1 pins land.** Commit `68db341` adds 93 lines to `scripts/cite-check.mjs`: a warn-only fixture
  in default and `--strict` mode, the `citeCheck` map on a failing fixture, both text environment
  labels, the process exit contract (0, 1, 2 for an empty scan set, 2 for zero resolved citations, 64
  for an unknown argument) observed through a child of the same file, and two cases where the suite
  observes itself — a child `--selftest` with one injected failing case must print the failure, end
  `VERDICT: FAIL` and exit 1, in text and in `--json`. Receipt
  `.ufo/waves/round-41/final/cite-mutants-open-a58b7f72.txt` (before) and
  `cite-mutants-measured-68db3419.txt` (after) are committed in the same range.
- **C2 counter committed before the instrument.** Commit `2759297` adds
  `.ufo/waves/round-41/probe/wave-recount.sh.txt` (jq recount of `.taskCall.tasks | length` and
  `.taskCall.tasks[].agent` per payload, diffed against the instrument's own listing).
- **C2 capability lands.** Commit `4e58bb0` adds `scripts/wave-census.mjs` (295 lines), the
  `SKILL.md` gate-registry row (`SKILL.md:607`), `## Verifiable checklist` items 16–17
  (`SKILL.md:690-691`), the `## Capabilities` row `wave-census` (`SCORECARD.md:1681`), the S038 row
  (`corpus/SOURCES.md:51`), the R40-3 cite receipt (`.ufo/waves/round-41/final/cite-receipt-r40-3.txt`:
  33 `REV_UNKNOWN` classified 1 external-url + 32 not-in-url) and the lesson draft
  (`corpus/lessons/round-41.md`).
- **Falsify repairs to C2.** Commit `02fef27` repairs five defects the falsify wave found: a
  resume-only payload (`taskCall` null) failed closed, a mixed spawn-and-resume payload read
  `REGISTRY_MISMATCH`, a directory or symlink named `<Name>.md` counted as a report, an
  under-declared or misspelled `--expect` was not pinned, and `--expect` was not round-scoped. The
  instrument now reads `resumeSends` (`resumed=`), counts only regular files, treats an unknown role
  as `EXPECT_UNKNOWN`, accepts `attack` as the attack total and `<round>/<wave>:<role>=<n>`; selftest
  12 → 20 (WC13–WC20, `scripts/wave-census.mjs:302-361`). The same commit adds the falsify dispatch
  and 17 falsify reports, the lesson, `LOG.md` and the `SCORECARD.md` round-41 section.
- **Self-observation guard.** Commit `5320e0d` changes the injection marker so a changed literal
  cannot make the child recurse: any value of `KUMITATE_CITE_SELFTEST_INJECT_FAIL` marks a child,
  and only the value `1` injects the failing case (`scripts/cite-check.mjs:2458-2460`).
- **Attempt 2 lands the inherited attempt-1 leftovers and pins them.** Commit `fae386a` commits the
  three repairs attempt 1 left uncommitted and untested — a `Report:` path with a `..` segment no
  longer resolves outside the round, a task without a string name and agent fails closed (exit 2),
  and any read error exits 2 rather than 1 (`scripts/wave-census.mjs:106-110`, `:401`) — and adds one
  case per repair (WC21–WC23, `scripts/wave-census.mjs:363-378`), selftest 23/23. Reverting each
  repair turns the suite to 22/23 `VERDICT: FAIL`; I reproduced all three kills myself in a scratch
  copy. The same commit re-opens S018 (`queued` → `mined`, used-by `corpus/lessons/round-41.md`,
  `corpus/SOURCES.md:31`), corrects the `SKILL.md`, `corpus/README.md` and lesson wording, adds the
  8 remaining falsify reports, and moves the misrooted `ReviewCensusCode.md` into the lane byte-exact
  (sha256 `778a35ee…3983`, verified).
- **Mistakes mined.** `corpus/lessons/round-41.md:106-114` carries five rows — calibration (the
  R40-6 seat-gate count written from memory), recurrence (a closure file landing without a
  `corpus/README.md` row, second occurrence), suite blind spot (a suite with no case observing its
  own verdict machinery), misroot (a report written at the fleet root), and untested repair (the
  three attempt-1 repairs with no case that fails without them).
- **Routed defects R40-1 to R40-7.** R40-1 (registry row names `--open REV`), R40-3 (cite-check
  receipt at the tip with its class), R40-5 (S035 named in the K2 section,
  `corpus/knowledge/kimi-skills-plugins.md:218-230`) and R40-6 (seat-gate count correction) land at
  `4e58bb0`; R40-7 (README row) lands at `34fccc1`. R40-2 and R40-4 are not done this round and are
  recorded as open limits (`corpus/lessons/round-41.md:147` at `fae386aa`).
- **Round shape.** The validated 34-seat build payload was never dispatched (the seat gate did not
  grant it in 3600 s; 0 seats spawned, 0 dead). The falsify wave ran 34 seats. The L1 built both
  claims itself (`cb2d8d0`, `68db341`, `2759297`, `4e58bb0`). Gate record
  `.ufo/waves/round-41/evidence-seat-gate.txt`.

## Landed changes

Every landed change is tied to its shipping commit. Lane range `a58b7f72..fae386aa`, 8 commits.

| Shipping commit | Change |
|---|---|
| `34fccc1` | Round-41 plan with frozen counters (`.ufo/waves/round-41/plan.md`); open receipts (`.ufo/waves/round-41/open/receipts.txt`); R40-7 `corpus/README.md` row for `lessons/round-40-verifier-spotcheck.md`; `SCORECARD.md` stanza re-pin. |
| `cb2d8d0` | C1 counter committed before its first run: `.ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt` (16 single-condition mutants); round-41 build dispatch, spec and registry. |
| `68db341` | C1 pins: 11 new hermetic cases in `scripts/cite-check.mjs` (64 → 75) — warn-only default and `--strict`, `citeCheck` map, both text environment labels, the exit contract 0/1/2/2/64 through a child of the same file, and suite self-observation by an injected-failure child in text and `--json`; before receipt `cite-mutants-open-a58b7f72.txt`; `SCORECARD.md` stanza re-pin; seat-gate record. |
| `2759297` | C2 counter committed before the instrument: `.ufo/waves/round-41/probe/wave-recount.sh.txt` (jq recount vs the instrument's listing, capability-row count, R40-6 able-to-fail `--expect` pair); C1 measured receipt `cite-mutants-measured-68db3419.txt`. |
| `4e58bb0` | C2 capability `wave-census`: `scripts/wave-census.mjs` (295 lines); `SKILL.md:607` gate-registry row; `SKILL.md:690-691` checklist items 16–17; `SCORECARD.md:1681` `## Capabilities` row; `corpus/SOURCES.md:51` S038 row; R40-1, R40-3, R40-5, R40-6; `corpus/lessons/round-41.md` draft; `SCORECARD.md` stanza A=9 C=17 C2=92. |
| `02fef27` | Falsify repairs to C2: resume lanes (`resumeSends`), regular-file reports only, `--expect` unknown role / `attack` / round scope; selftest 12 → 20 (WC13–WC20); C1 wording qualified; lesson, `LOG.md`, `SCORECARD.md` round-41 section and calibration corrections; falsify dispatch, spec, registry and 17 falsify reports; C1 and C2 measured receipts at `4e58bb0e`. |
| `5320e0d` | Cite-check self-observation guard (any value of the injection variable marks a child, only `1` injects the failure — a changed literal no longer recurses); re-pin; claim-sizing wording fixes; `CritInjectionBypass.md`. |
| `fae386a` | Attempt 2: the three inherited attempt-1 `wave-census` repairs (no `..` in a `Report:` path, non-string name/agent fails closed, read error exits 2) plus their pins WC21–WC23 (selftest 23/23, 3/3 revert mutants killed, receipt `a2-census-repair-mutants.txt`); S018 re-open (`queued` → `mined`); `SKILL.md`, `corpus/README.md` and lesson wording; 8 falsify reports; misrooted `ReviewCensusCode.md` moved byte-exact into the lane; `## Mistakes` rows. |

## Could not verify

All line references above are against the **committed tree at `fae386aa`** unless stated otherwise.
The lane tip moved to `57269a55e5868ecd99fd2f2b72944b7145343024` while this seat was running; the
L1 landed the verify-wave evidence there. That commit **resolved three findings I had raised
against `fae386aa`**, and the notes below say so rather than claiming them as still open.

- **Resolved by `57269a5` — the two final-tip receipts are now committed.** At `fae386aa`,
  `.ufo/waves/round-41/final/cite-mutants-final-fae386aa.txt` and `wave-recount-final.txt` were
  **untracked** (`git ls-files --error-unmatch` → no output). Their values were reproducible — I
  re-ran both counters at `fae386aa` in a scratch clone and got `survived=0/16 nomatch=0 crash=0
  control=PASS` and `RECOUNT_MISMATCHES=0 CAPABILITY_ROWS=2 EXPECT_4_EXIT=1 EXPECT_3_EXIT=0` — but
  the receipt files themselves were not yet landed. `57269a5` commits both.
- **Resolved by `57269a5` — the lesson over-stated one C1 scope number at `fae386aa`.** At
  `fae386aa`, `corpus/lessons/round-41.md:26-28` read "For 13 of the 16 the run also exits non-zero
  or prints `VERDICT: FAIL`. For the three suite-aggregation mutants (suite-group-verdict,
  suite-any-fail, suite-exit-text) the parent run exits 0". My own run contradicts the grouping:
  `suite-exit-text` exits 0 but **prints `VERDICT: FAIL`**; only `suite-group-verdict` and
  `suite-any-fail` exit 0 with `VERDICT: PASS`. The correct count is 14 of 16 showing a failure in
  the exit code or the verdict line. `57269a5` lands that correction (attributed to verify seat
  `CritC1Final`), and the committed `SKILL.md:599` row now splits the three mutants the same way.
- **Resolved by `57269a5` — `LOG.md` and the lesson credited R40-2 as re-measured.** At `fae386aa`,
  `LOG.md:1827` read "R40-2 recorded and re-measured by the falsify wave" and
  `corpus/lessons/round-41.md:140` read "The 17-recipe re-measure is a falsify-wave item". The
  falsify seat `ReviewHonestReMeasure` died with no report (confirmed by
  `node scripts/wave-census.mjs --round 41`: `absent: … ReviewHonestReMeasure …` among the 7 absent
  falsify seats), so the re-measure was **not** done. `57269a5` corrects both sentences.
- **Still open — the round's own work landed in `a58b7f72..fae386aa` is what the table above
  describes.** `57269a5` is the verify wave's evidence commit (wave-census WC24/WC25/WC26, the tip
  receipts, sibling verify reports and the corrections named above). It is **not** part of round
  41's two claims and is deliberately excluded from the `## Landed changes` table.
- **The 34-seat build payload never spawned**, so no build-seat work is in the range; the L1 built
  both claims. This is a conformance defect the lesson records, not a claim I could measure.
- **R40-2 and R40-4 are not done**; both are recorded open. I did not re-measure either.
- **The round-40 seat-gate file was not edited in this range** (`git log a58b7f72..fae386aa --
  .ufo/waves/round-40/` → empty); the R40-6 correction is recorded in the round-41 lesson and made
  checkable by `wave-census --expect`, not by changing the round-40 prose.
- **Sourcing was not re-opened by me.** S038 was verified only as a file hash and locator
  (`sha256 1d33a03f…f09d0a` for `scripts/ufo-swarm-wave.mjs` at the pin, schema comment at `:51`),
  matching the row's recorded values. S018's arXiv page was not opened by me.
- **I did not verify the 14 unpinned severity decisions, the set-width mutants, the C2 counter's
  empty-listing weakness, or the `~/.kimi-code/locks` drift.** Those are the lesson's open limits
  (`corpus/lessons/round-41.md:147` at `fae386aa`); I read them, I did not re-measure them.

## Evidence

Commands run by me in a scratch clone (`/fast/scratch/hyaku/kumitate-r41a2/seats/ScribeWorkPerformed/lane`,
detached at `fae386aa`). No lane file was written; no tool was installed or updated.

```
$ node --input-type=module - --lane <clone> --rev <rev> < .ufo/waves/round-41/probe/cite-verdict-mutants.mjs.txt
fae386aa: CONTROL unmutated PASS exit=0 cases=75/75 fail_lines=0; 16/16 MUTANT … killed;
           CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS rev=fae386aa…; exit=0
a58b7f72: CONTROL unmutated PASS exit=0 cases=64/64 fail_lines=0; 15 survived, resolved>0 killed;
           CITE_MUTANTS survived=15/16 nomatch=0 crash=0 control=PASS rev=a58b7f72…; exit=0
4e58bb0e: CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS rev=4e58bb0e…; exit=0
$ bash .ufo/waves/round-41/probe/wave-recount.sh.txt
fae386aa:  RECOUNT_MISMATCHES=0  CAPABILITY_ROWS=2  EXPECT_4_EXIT=1  EXPECT_3_EXIT=0
2759297:   RECOUNT_MISMATCHES=7  CAPABILITY_ROWS=1  EXPECT_4_EXIT=1  EXPECT_3_EXIT=1
$ node scripts/wave-census.mjs --selftest          # fae386aa
WAVE_CENSUS_SELFTEST: 23/23 pass / VERDICT: PASS / exit=0
$ node scripts/cite-check.mjs --selftest           # fae386aa
75/75 cases passed (hermetic) / VERDICT: PASS / exit=0
$ awk '/^## Capabilities/{f=1;next} /^## /{f=0} f && /^\| `/' SCORECARD.md | wc -l
fae386aa: 2        # a58b7f72: 1
$ node scripts/wave-census.mjs --round 40 --expect build:mutation-tester=4 ; echo $?
1
$ node scripts/wave-census.mjs --round 40 --expect build:mutation-tester=3 ; echo $?
0
$ (revert each of the three fae386a repairs in a scratch copy, run --selftest)
MUTANT dotdot-guard-dropped       killed exit=1  22/23 pass VERDICT: FAIL  failing=WC21
MUTANT string-agent-check-dropped killed exit=1  22/23 pass VERDICT: FAIL  failing=WC22
MUTANT read-error-rethrown         killed exit=1  22/23 pass VERDICT: FAIL  failing=WC23
$ node scripts/wave-census.mjs --round 41
WAVE round=41 wave=build   seats=34 attack=19 reports=0/34
WAVE round=41 wave=falsify seats=34 attack=29 reports=27/34
  absent: ReviewC1Hermetic CritCensusAdversarial ReviewR40Dispositions ReviewHonestReMeasure
          CritAnchorCapsOpen ReviewLesson ReviewSeatGateRecord
WAVE_CENSUS: CLEAN (rounds=1 waves=2 findings=0)
$ sha256sum /fast/scratch/hyaku/kumitate-pin/src/scripts/ufo-swarm-wave.mjs
1d33a03ffb204bc499310589199590d305b677fbe4fb2dfdb924f7c0f5f09d0a
$ git -C /fast/scratch/hyaku/kumitate-pin/src rev-parse HEAD
31c465f15669f744848bd9f5d56191c5085670f7
$ git -C <lane> ls-files --error-unmatch .ufo/waves/round-41/final/{cite-mutants-final-fae386aa,wave-recount-final}.txt
(no output — both untracked at fae386aa)
```

Out of scope for this seat, noted for the L1: the verify wave's own work (wave-census WC24/WC25/WC26
and its receipts, sibling verify reports) landed in `57269a5` after my read of `fae386aa`. It is
evidence for the round's closure, not part of round 41's two claims, and is deliberately excluded
from the `## Landed changes` table above.

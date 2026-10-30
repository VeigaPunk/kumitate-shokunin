VERDICT: All three mutations trigger the expected additional findings, but all kill verdicts are INCONCLUSIVE because the supplied draft already fails the pristine detector.

## Evidence
Axis: operability; invariants: item coverage, item-specific quote binding, exact answer-line binding.
Fixture: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin archive 9401d8655970d542b81d318bdad558d6dea39397 | tar -x -C "$S/lane"`, then copied the reviewed round-68 v2 tool and snapshotted L1LedgerDraft ledger into their canonical fixture paths. No fixture git writes or runtime other than Node detector.
Durable draft snapshot: `.ufo/waves/round-69/build/K69MutLedgerRows/pristine-ledger.md`.
Detector (identical argv for all seven executions):
```sh
S=/fast/scratch/hyaku/kumitate-r69/K69MutLedgerRows
TMPDIR="$S" node "$S/lane/scripts/routed-ledger.mjs" --root "$S/lane" --from 55 --to 66
```
Each subprocess timeout: 180 seconds; cwd: fixture lane. Complete stdout/stderr, exit codes and SHA256 are retained in build receipts and `results.json`.
Pristine exit 1 (verbatim):
```text
FINDING ROW_MALFORMED line28:cells=9
FINDING ROW_MALFORMED line32:cells=8
FINDING ROW_MALFORMED line71:cells=8
FINDING ANSWER_DEAD R58-V2@line27:answer-quote-not-at-exact-line:SCORECARD.md:1801
FINDING ANSWER_DEAD R66-D2@line73:answer-quote-not-at-exact-line:LOG.md:2324
FINDING ROW_MALFORMED R66-N4@line75:answer-format
FINDING UNLEDGERED round-58-item-3
FINDING UNLEDGERED round-58-item-7
FINDING UNLEDGERED round-65-item-7
FINDING UNLEDGERED round-66-item-4
ROUTED_LEDGER: DRIFT spotchecks=12 sections=12 items=61 rows=58 open=35 closed=22 wontfix=0 findings=10 first=ROW_MALFORMED:line28:cells=9
```
m1: removed only R55-V1 row. Expected UNLEDGERED; exit 1; INCONCLUSIVE (not a killed mutant):
```text
FINDING UNLEDGERED round-55-item-1
ROUTED_LEDGER: DRIFT spotchecks=12 sections=12 items=61 rows=57 open=34 closed=22 wontfix=0 findings=11 first=ROW_MALFORMED:line27:cells=9
```
m2: swapped only R55-V1 and R55-V2 quote cells. Expected QUOTE_ABSENT or QUOTE_AMBIGUOUS; exit 1; INCONCLUSIVE:
```text
FINDING QUOTE_ABSENT R55-V1@line15:round-55-item-1
FINDING QUOTE_ABSENT R55-V2@line16:round-55-item-2
FINDING UNLEDGERED round-55-item-1
FINDING UNLEDGERED round-55-item-2
ROUTED_LEDGER: DRIFT spotchecks=12 sections=12 items=61 rows=58 open=35 closed=22 wontfix=0 findings=14 first=ROW_MALFORMED:line28:cells=9
```
m3: shifted only R55-V2 answer from round-56.md:24 to :25. Expected ANSWER_DEAD; exit 1; INCONCLUSIVE:
```text
FINDING ANSWER_DEAD R55-V2@line16:answer-quote-not-at-exact-line:corpus/lessons/round-56.md:25
ROUTED_LEDGER: DRIFT spotchecks=12 sections=12 items=61 rows=58 open=35 closed=22 wontfix=0 findings=11 first=ROW_MALFORMED:line28:cells=9
```
Restored after EACH mutation in a finally block; each restored detector exit 1 reproduced pristine stdout exactly (10 findings), with the same SHA256. Final byte comparison output: `RESTORATION_EXACT True`.
SHA256 evidence:
```text
pristine/restored-m1/restored-m2/restored-m3 0f1bec5ce74957978717b7a4f493ced6ebede540fce3006457f795573d36d5a0
m1 22f8a90f0d4aee31cb1071fecb393ec5063753ba1f728a885d5dd0596852a308
m2 a38d7ace06dc200f294a5b0d328f18793bd71aa36d919d964f564f7f1ed889c5
m3 f1d7c1ce42948ca8406dc21943356c98ced40b60a7d1bade000eb5887e5bbe38
v2-tool 05aacb5ede6b3389a693bb71c6c1cb74281f8bab9b5bf2309027dd97d83913b1
```

## Findings
1. **K69MutLedgerRows-1 — high, draft operability:** the unmodified draft snapshot is not CLEAN against frozen fixture bytes: embedded table pipes produce malformed rows; R66-N4 has no answer; two exact-line answers are dead. This blocks a clean-baseline mutation-kill claim. Reproduce using fixture construction above, copy the durable `pristine-ledger.md` into fixture `corpus/routed-ledger.md`, then run detector. Evidence: `build/K69MutLedgerRows/pristine.txt:4-14` (under the round-69 directory).
2. **K69MutLedgerRows-2 — informational, gates respond but kills remain inconclusive:** all three requested mutations add their expected item-specific finding; no claim of killed/survived status from an already-failing baseline. Reproduce the same fixture, copy respectively `m1-ledger.md`, `m2-ledger.md`, or `m3-ledger.md` from this seat's build directory to fixture `corpus/routed-ledger.md`, and run the identical detector. Frozen predicates and the shared draft were not changed.

## Artifacts
All paths below are relative to `.ufo/waves/round-69/build/K69MutLedgerRows/`:
- `pristine-ledger.md`, `m1-ledger.md`, `m2-ledger.md`, `m3-ledger.md`: exact tested inputs.
- `pristine.txt`, `m1-drop.txt`, `m2-quote-swap.txt`, `m3-answer-shift.txt`: complete detector receipts.
- `restored-m1.txt`, `restored-m2.txt`, `restored-m3.txt`: restoration detector receipts.
- `results.json`: seven full executions with command, exit, hash, stdout and stderr.
- `cleanup.txt`: cleanup/restoration evidence.
Report: `.ufo/waves/round-69/w1/K69MutLedgerRows.md`.

## Limits
Snapshot only: the concurrently changing draft was copied once; no assertions about later draft revisions. No counter, selftest, integration, live/network check, or answer-adequacy assessment was run. No baseline repair was attempted: that would change the assigned input. All source/frozen bytes unchanged; scratch removed after receipts copied. No tools installed or upgraded.
Self-evaluation: accuracy 4 (raw receipts retained; kill claims withheld); completeness 4 (all probes run, clean baseline unavailable); clarity 4 (three deltas separated); actionability 4 (inputs and construction retained); conciseness 4 (full outputs kept outside report); overall 4.0. Main improvement: repeat after an owner supplies a CLEAN draft. Would the user agree: the observed gate responses are useful, but are not clean-baseline kills.

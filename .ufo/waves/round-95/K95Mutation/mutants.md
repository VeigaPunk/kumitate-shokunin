# K95Mutation — K2 mutation probe (round 95, claim C1)

Seat: K95Mutation. Target of record: the READY-attested candidate
`.ufo/waves/round-95/K95ExecTool/round-gate.mjs`, sha256
`c5a2f8ace8ef3208683b610736961f921a632492eee75b026541e7cbb847e0ab` (READY content, read 21:47).
Base: `scripts/round-gate.mjs` at freeze `ee8479be66acd906f1d2b5f24f1b75a3d9172c1b`, sha256
`11f83a1ac7b539e76bbbfe370b618aaf836f441db48a7d587e4389f3a3c58b0a` (extracted with
`git show ee8479...:scripts/round-gate.mjs`; `base-freeze-round-gate.mjs`). Fallback target: `ctl-positive`
regenerated from those freeze bytes with `probe/make-controls95.py`, sha256
`5c472696a93929d96d3a5a3ade6937e815d8743c0e024a1c0c50620951a99310` — byte-identical to
`controls/controls-sha256.txt` (`controls-regenerated-hashes.txt`).

Detectors per mutant, same form every time:

    node mutants/<label>/m-<name>.mjs --selftest
    node .ufo/waves/round-95/probe/probe95-c1.mjs --tool mutants/<label>/m-<name>.mjs \
         --work <scratch>/work-<label>-<name> --freeze ee8479be66acd906f1d2b5f24f1b75a3d9172c1b

Pristine baseline on the candidate: `runs/cand/baseline-counter.log`
`C95_C1: HELD a=1/1 b=1/1 c=78/78 d=1/1`, selftest `86/86 pass`. Mutant construction is exact
find/replace on the target bytes with an asserted occurrence count (`mutate.py`, spec table); every
mutant sha256 is recorded in `mutant-sha256.txt` and checked against the harness JSON.

## Candidate table (15 mutants, all inside the changed lines of `declaredPins()` / `citations`)

`diff -u` base vs candidate: `diff-base-vs-candidate.txt` (155 lines). The new code is the
`SOURCES_ROW_RE` row block (`fields = line.split('|')`, NF check, `malformed.push(fields[1].trim())`),
the `declaredPins(sourcesText, malformed = [])` signature/call, both `citations` initialisers, and the
header/text disclosure. No mutant touches unchanged code.

| mutant | change | expected catcher | selftest | counter | verdict |
|---|---|---|---|---|---|
| `escapeonly` | `fields.length !== 13` -> `line.includes('\\|')` (ctl-escapeonly) | counter(a) + (xv,xvii,xviii,xix,xx) | 80/86 FAIL | UNMET a=0 b=1 c=78/78 d=0 | KILLED-by-selftest |
| `gt13` | `fields.length !== 13` -> `fields.length > 13` (ctl-gt13) | (xvii,xix,xx) | 82/86 FAIL | UNMET a=0 b=1 c=78/78 d=0 | KILLED-by-selftest |
| `lenient12` | accept NF 12 or 13 (ctl-lenient12) | (xvii,xix,xx) | 82/86 FAIL | UNMET a=0 b=1 c=78/78 d=0 | KILLED-by-selftest |
| `anyrej` | disclose NF!=13, still read them, skip any row with a `rejected` cell (ctl-anyrej) | counter(a) + (xvi,xvii,xviii,xix,xx) | 80/86 FAIL | UNMET a=0 b=1 c=78/78 d=0 | KILLED-by-selftest |
| `nodisclose` | reference rule, nothing pushed (ctl-nodisclose) | (xv..xx) | 79/86 FAIL | UNMET a=0 b=1 c=78/78 d=0 | KILLED-by-selftest |
| `dropall` | one malformed row clears the whole registry (ctl-dropall) | (xix) | 84/86 FAIL | UNMET a=0 b=1 c=78/78 d=0 | KILLED-by-selftest |
| `short12` | `!== 13` -> `!== 12` | base arm (i,ii,iii) + (xvii,xix,xx) | 77/86 FAIL | UNMET a=0 b=1 c=70/78 d=0 | KILLED-by-selftest |
| `lt13` | `!== 13` -> `< 13` (long rows declare) | (xv,xvi,xviii,xx) | 81/86 FAIL | UNMET a=0 b=1 c=78/78 d=0 | KILLED-by-selftest |
| `id2` | push `fields[2]` instead of `fields[1]` | (xv..xx) | 79/86 FAIL | UNMET a=0 b=1 c=78/78 d=0 | KILLED-by-selftest |
| `untrimmed` | push without `.trim()` | (xv..xx) | 79/86 FAIL | UNMET a=0 b=1 c=78/78 d=0 | KILLED-by-selftest |
| `unshift` | `unshift` instead of `push` | (xx) | 84/86 FAIL | UNMET a=0 b=1 c=78/78 d=0 | KILLED-by-selftest |
| `nofailclosed` | drop `malformedRows` from the fail-closed `citations` object only | fail-closed arm | 84/86 FAIL | UNMET a=1 b=1 c=78/78 d=0 | KILLED-by-selftest |
| `status9` | status index 8 -> 9 | base (vi,xiv) + counter(a) | 83/86 FAIL | UNMET a=0 b=1 c=78/78 d=0 | KILLED-by-selftest |
| `checkafterstatus` | count check moved after the status *read* (rejection continue still after it) | none (semantically identical) | 86/86 PASS | HELD a=1 b=1 c=78/78 d=1 | **EQUIVALENT** |
| `checkafterreject` | count check moved after the status *decision* (rejection `continue` first) | missing arm (proposed xxi) | 86/86 PASS | HELD a=1 b=1 c=78/78 d=1 | **SURVIVED** |

Selftest kill count on the candidate: **13/15**. All six forgery-control shapes (escapeonly, gt13,
lenient12, anyrej, nodisclose, dropall) are killed by the shipped selftest — K2's literal condition is
met. Counter-only kills: 0 (every killed mutant also fails selftest; `short12` additionally reds the
no-regression arm c=70/78).

### Survivor 1 — `checkafterreject` (real coverage finding)

`c5243d433f9ec3bb1c68789c91b0d4b07a0acf14865e68914f55d73eefef8425` (candidate target).
Behaviour: the status cell is read and a `rejected` row is skipped **before** the field count is
checked, so an NF!=13 row whose field 8 trims to `rejected` is never disclosed in `malformedRows` —
the frozen rule requires every NF!=13 registry row to append its id.
Differential receipt `runs/cand/differential-checkafterstatus.log`: a 14-field fixture row
(`| S900 | ... | teaches | rejected | extra | ...`, `awk NF=14`, field 9 = `rejected`) gives

- pristine candidate -> `{"declared":[],"unresolved":["aaaaaaaa"],"malformedRows":["S900"]}`
- `checkafterreject`   -> `{"declared":[],"unresolved":["aaaaaaaa"],"malformedRows":[]}`

Both standard detectors miss it because the counter's shifted row S002 and selftest arm (xv) put the
true `rejected` status at index 9, never at index 8. Routed fix: a selftest arm
**(xxi) NF!=13 row whose field 8 reads `rejected` still appends its id to `malformedRows`** (the
count check must precede the status *decision*, not merely the status read). This is a selftest/
counter-fixture coverage gap, not a defect in the candidate's shipped rule: the shipped code checks
the count before reading any cell and passes on all exercised inputs.

### Survivor 2 — `checkafterstatus` (argued EQUIVALENT)

Pure evaluation-order move: `fields[8]` is read before the count check, but the count check's
`continue` still runs before the `rejected` `continue`, and the read is total (`?? ''`), so no input
changes `declared` or `malformedRows`. The same differential fixture above gives the identical
`malformedRows:["S900"]` as the pristine candidate (receipt same file). No arm is owed for an
equivalent mutant; the proposal in (*) also does not kill it (correctly — it is equivalent).

## Fallback table — `ctl-positive` (15 mutants, frozen generator rule)

Run while READY was absent (per seat instruction), then regenerated once the label plumbing was
fixed; results deterministic against the recorded control hashes.

| mutant | selftest | counter | verdict |
|---|---|---|---|
| `escapeonly` | 79/79 | UNMET a=0 b=1 c=78/78 d=1 | KILLED-by-counter-only |
| `gt13` | 79/79 | UNMET a=0 b=1 c=78/78 d=1 | KILLED-by-counter-only |
| `lenient12` | 79/79 | UNMET a=0 b=1 c=78/78 d=1 | KILLED-by-counter-only |
| `anyrej` | 79/79 | UNMET a=0 b=1 c=78/78 d=1 | KILLED-by-counter-only |
| `nodisclose` | 79/79 | UNMET a=0 b=1 c=78/78 d=1 | KILLED-by-counter-only |
| `dropall` | 79/79 | UNMET a=0 b=1 c=78/78 d=1 | KILLED-by-counter-only |
| `short12` | 73/79 FAIL | UNMET a=0 c=70/78 d=0 | KILLED-by-selftest |
| `lt13` | 79/79 | UNMET a=0 b=1 c=78/78 d=1 | KILLED-by-counter-only |
| `id2` | 79/79 | UNMET a=0 b=1 c=78/78 d=1 | KILLED-by-counter-only |
| `untrimmed` | 79/79 | UNMET a=0 b=1 c=78/78 d=1 | KILLED-by-counter-only |
| `unshift` | 79/79 | UNMET a=0 b=1 c=78/78 d=1 | KILLED-by-counter-only |
| `nofailclosed` | 79/79 | HELD a=1 b=1 c=78/78 d=1 | SURVIVED (expected: base has no fail-closed `malformedRows` arm; plan discloses this hole) |
| `status9` | 76/79 FAIL | UNMET a=0 d=0 | KILLED-by-selftest |
| `checkafterstatus` | 79/79 | HELD | EQUIVALENT (same argument as above) |
| `checkafterreject` | 79/79 | HELD | SURVIVED (same fixture gap; differential receipt same) |

Kill count on the fallback target: 12/15 killed (2 by selftest, 10 by counter only). The fallback
selftest is the BASE 79-arm suite and therefore cannot see the new rule's disclosures; this is why the
candidate batch is the K2 evidence of record.

## Restoration / cleanliness

- Mutants were built and executed only in `/fast/scratch/hyaku/kumitate-r95/K95Mutation/`
  (`mutants/{cand,ctl}/`) and copied into this seat dir; the lane file was never written.
  Base bytes re-hash to `11f83a1a…` (`base-freeze-round-gate.mjs`), candidate bytes to `c5a2f8ac…`
  (`targets/candidate-c5a2f8.mjs`); `targets/hashes.txt`.
- No git/jj mutating command was run; the differential fixture was a `mktemp -d -p <scratch>` repo
  whose `rev-parse --show-toplevel` was asserted before its single commit.
- Observed externally after READY: lane `scripts/round-gate.mjs` later changed to sha256
  `7aaf0082…` at HEAD `89215d7` (not this seat; the K2 target of record is the READY-attested
  `c5a2f8…`).

## Receipts

`runs/cand/*.log`, `runs/ctl/*.log` (per mutant: `selftest-<name>.log`, `counter-<name>.log`),
`runs/cand/baseline-counter.log`, `runs/cand/differential-checkafterstatus.log`,
`runs/{cand,ctl}/driver*.log` (harness JSON lines), `mutants-cand.json`, `mutants-ctl.json`,
`mutant-sha256.txt`, `mutate.py`, `render.py`, `controls-regenerated-hashes.txt`,
`diff-base-vs-candidate.txt`.

# Round 91 — lesson draft: the `## Mistakes` table (L1 integrates)

Lane `kumitate-shokunin`, round 91 attempt 1, claim C1 (`receipt-bind` v5, contract
`kumitate-receipt-bind-v5`). Drafted by seat K91ScribeLesson from the frozen round-91 record. The
L1 copies this table into `corpus/lessons/round-91.md`. Draft receipts and the sweep are under
`.ufo/waves/round-91/K91ScribeLesson/evidence/`; every pointer below is checked in
`.ufo/waves/round-91/K91ScribeLesson/pointer-checks.txt`.

Round-91 freeze: lane commit `2b1b8bf3d274db8e608035bffb27bd3b3d4009d4` (plan, frozen probe
`probe91-c1.mjs` sha256 `3bd88e8efe4bb0851b5ef57c90e80792eada34cd0f2450922d75fbe9fc313f4c`, and
14 pre-data controls). The frozen probe is never edited, moved or copied-and-modified as evidence.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| M3 — the mandated scratch root carried the round token into every candidate-visible path: the probe's `--work` path is the contract scratch `/fast/scratch/hyaku/kumitate-r91/<seat>/…` and the probe sets `TMPDIR=<work>` for every call, so the probe header's "no round constant appears in any path the candidate sees" was false and a candidate could gate its behaviour on `kumitate-r91` (or on the `TMPDIR`-is-an-ancestor-of-`--dir` relation) without the probe ever seeing it | `corpus/lessons/round-90.md` M3 row; `.ufo/waves/round-90/w1/K90CriticA.md` (constructions `d-tmpdir-gated-prefix` and `e-round-path-gated-prefix`, 47/47 on two runs each) | none: `K90ExecAudit` (`q82-audit.mjs`) scanned arm labels in path and file names only, never the scratch-root token or the `TMPDIR`/`--dir` relation; Q82 says "a fixture directory named after the arm" and did not reach the ambient path | **fixed in round 91 by the frozen probe's two-context battery.** The parent runs the whole battery twice as children: context A builds fixtures under `--work` with `TMPDIR=--work` (an ancestor of every fixture); context B builds fixtures under `--alt/r-<rand>` with `TMPDIR=--alt/t-<rand>` (a sibling, never an ancestor). An arm PASSES only if it passes in BOTH contexts, so a construction gated on the `TMPDIR`/`--dir` relation or on a path token of `--work` fails (`probe91-c1.mjs:9-14`, `:116-144`, `:146-152`). **Shown able to fail**: the committed pre-data control `controls/ctl-r90-roundpath-gated+ref.txt` — the round-90 critic's construction `e-round-path-gated-prefix.mjs` re-keyed to this round's token (`/kumitate-r91/`) with the positive control's descriptor graft — scores `C91_C1: UNMET held=47/56` and shows the eight prefix arms as `A=PASS B=FAIL`, verified verbatim below. The sibling `controls/ctl-r90-tmpdir-gated+ref.txt` (the `TMPDIR`-gated construction) scores the same `47/56` with the same eight arms failing, so both gate shapes are caught. |
| M6 (new) — the round's own gate was measured before the round's records existed, so the round closed with a red `round-gate` receipt that the report explained away instead of re-measuring: M5's stated fix ("the round-90 close runs `round-gate` on the committed tree") is contradicted by the committed bytes — the round-90 close receipt names the PRE-record revision and reads DRIFT with three errors, and the `## Planned` pointer named the round itself, so the gate's own "names a round later than N" check still warns | `corpus/lessons/round-90.md` M5 row (the fix claim); `.ufo/waves/round-90/close/round-gate.txt` (`rev=82c9c7ef…`, `ROUND_GATE: DRIFT (round=90 lane=kumitate checks=5 errors=3 warnings=1)`, exit 1 — `REPORT_MISSING`, `SCORECARD_ROW_MISSING`, `LOG_ENTRY_MISSING`, warning `SCORECARD_PLAN_MISSING`); the fleet report `.ufo/reports/round-90/kumitate.md:74` ("re-run after this report lands (see Pre-report gate)") against its own `## Pre-report gate` section at `:126-129`, which contains only `ls-remote` and the `SHONEN` grep and no gate re-run; `corpus/lessons/round-90-verifier-spotcheck.md` §6.1 ("re-run `round-gate --round 90` at the landed revision and commit the receipt next round") | none of the lane's own gates: the round-90 close battery has no case that runs after the records land, and `run-close91.mjs` (the round-91 close runner) keeps the same order — its `round-gate` case is one of thirteen run before any `SCORECARD`/`LOG` record for round 91 exists, and the runner writes neither file itself | **round 91 must re-measure and commit the receipt, not explain it.** Two parts, both measured by this seat: (a) the round-90 records land at `bf24587c`, not at the revision the gate ran on — `git show 82c9c7ef:SCORECARD.md \| grep -c '^| 90 \|'` → 0 and `git show 82c9c7ef:LOG.md \| grep -cE '^- [0-9]{4}-[0-9]{2}-[0-9]{2} — round 90'` → 0, while the same two counts at `bf24587c` are 1 and 1 — so the round-90 close gate receipt is red for a reason the round could not fix at that revision, and at the landed revision the gate is CLEAN (`node scripts/round-gate.mjs --round 90` → `ROUND_GATE: CLEAN (round=90 lane=kumitate checks=10 errors=0 warnings=1)` exit 0, receipt `.ufo/waves/round-91/K91ExecCarry/round-gate-r90.txt`); no committed lane receipt of a round-90 gate re-run existed before round 91 (`grep -rn "ROUND_GATE: CLEAN (round=90" .` finds only round-91 seat artefacts). (b) the `## Planned` pointer must name a round LATER than the round being gated, not the round itself: the gate's check is `n > round` over `round[- ]?(\d+)` in the `## Planned` body, and the body names round 90 at most, so round 90's gate still warns `SCORECARD_PLAN_MISSING ## Planned names no round later than 90` at the landed revision. Fix for round 91: land the `SCORECARD` row 91 and the `LOG` round-91 line and the `## Planned` pointer for a round later than 91 BEFORE the close battery's `round-gate` case, or run the gate again after the records land and commit THAT receipt, and name a round later than 91 in `## Planned`. |

## The M3 control lines, quoted verbatim from the committed receipt

`controls/ctl-r90-roundpath-gated+ref.txt` (committed at the round-91 freeze, `2b1b8bf3`; the
control's verdict line and the eight arms):

```
ARM dup-feff: FAIL A=PASS B=FAIL | A: "﻿" exit=2 RECEIPT_BIND: FAIL-CLOSED AMBIGUOUS_FIELD r.txt carries 2 cmd= lines | B: "﻿" exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0
ARM dup-zwsp: FAIL A=PASS B=FAIL | A: "" exit=2 RECEIPT_BIND: FAIL-CLOSED AMBIGUOUS_FIELD r2.txt carries 2 cmd= lines | B: "" exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0
ARM dup-zwnj: FAIL A=PASS B=FAIL | A: "‌" exit=2 RECEIPT_BIND: FAIL-CLOSED AMBIGUOUS_FIELD r3.txt carries 2 cmd= lines | B: "‌" exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0
ARM dup-zwj: FAIL A=PASS B=FAIL | A: "‍" exit=2 RECEIPT_BIND: FAIL-CLOSED AMBIGUOUS_FIELD r4.txt carries 2 cmd= lines | B: "‍" exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0
ARM dup-lrm: FAIL A=PASS B=FAIL | A: "‎" exit=2 RECEIPT_BIND: FAIL-CLOSED AMBIGUOUS_FIELD r5.txt carries 2 cmd= lines | B: "‎" exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0
ARM dup-nbsp: FAIL A=PASS B=FAIL | A: " " exit=2 RECEIPT_BIND: FAIL-CLOSED AMBIGUOUS_FIELD r6.txt carries 2 cmd= lines | B: " " exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0
ARM single-zwsp: FAIL A=PASS B=FAIL | A: exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0 | B: exit=1 RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=1 external=0 first=r.txt
ARM single-nbsp: FAIL A=PASS B=FAIL | A: exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=0 | B: exit=1 RECEIPT_BIND: DRIFT matched=0 mismatched=0 unchecked=1 external=0 first=r.txt
C91_C1: UNMET held=47/56
exit=1
```

The eight `A=PASS B=FAIL` lines are the M3 shape: in context A the gated construction performs the
K89-V1 prefix tolerance (context A's `--dir` lies under a path containing `/kumitate-r91/`), and in
context B the same construction skips it and reads the same receipt CLEAN or DRIFT. The count of
`A=PASS B=FAIL` lines in this receipt is 8, and the headline is `UNMET held=47/56` — the
construction is at 47/56, exactly the round-90 score it reached under the round-90 probe, so the
two-context battery costs it the eight prefix arms and no more.

The sibling control `controls/ctl-r90-tmpdir-gated+ref.txt` (the `TMPDIR`-is-an-ancestor gate,
unre-keyed) reads `ARM dup-feff: FAIL A=PASS B=FAIL` and the same headline
`C91_C1: UNMET held=47/56`, so the second gate shape M3 names — the `TMPDIR`/`--dir` relation,
not only the path token — is caught by the same battery.

## The M6 measurements, quoted verbatim

`.ufo/waves/round-90/close/round-gate.txt` (committed at `bf24587c`):

```
rev=82c9c7efb9d9567341c209ad888012646590e99f
cmd=node scripts/round-gate.mjs --round 90
ROUND_GATE  error  REPORT_MISSING  /home/vgpnk/Projects/shokunin/.ufo/reports/round-90/kumitate.md
ROUND_GATE  error  SCORECARD_ROW_MISSING  no table row starting "| 90 |" in /home/vgpnk/Projects/shokunin/kumitate-shokunin/SCORECARD.md
ROUND_GATE  warning  SCORECARD_PLAN_MISSING  ## Planned names no round later than 90
ROUND_GATE  error  LOG_ENTRY_MISSING  no "- YYYY-MM-DD — round 90" line in /home/vgpnk/Projects/shokunin/kumitate-shokunin/LOG.md
ROUND_GATE: DRIFT (round=90 lane=kumitate checks=5 errors=3 warnings=1)
exit=1
```

`node scripts/round-gate.mjs --round 90` run by this seat on the landed lane
(`.ufo/waves/round-91/K91ExecCarry/round-gate-r90.txt`, byte-identical output):

```
ROUND_GATE  warning  SCORECARD_PLAN_MISSING  ## Planned names no round later than 90
ROUND_GATE: CLEAN (round=90 lane=kumitate checks=10 errors=0 warnings=1)
exit=0
```

So at the landed revision the gate is green on the records and still warns on the `## Planned`
pointer, and the lane holds no committed receipt of the green run — the only `ROUND_GATE: CLEAN
(round=90` occurrences in the tree are round-91 seat artefacts.

## Sweep of the `## Mistakes` sections (rounds 87-90 lessons + verifier spot-checks)

Command (read-only, lane root): for each file, `awk '/^## Mistakes/{f=1} f&&/^## /&&!/^##
Mistakes/{exit} f' <file>`; the four verifier spot-checks have no `## Mistakes` section, so their
headings are listed instead. Full transcript:
`.ufo/waves/round-91/K91ScribeLesson/evidence/evidence-sweep-mistakes.txt`.

```
===== corpus/lessons/round-87.md
  | attribution | R86-D1: `.ufo/waves/round-86/run-close.mjs:24` computes `sha256(scripts/counter-receipt.mjs)` inside the per-case loop … | Q79 … | `scripts/receipt-bind.mjs` re-derives the pair from the receipt's own `cmd=` …
  | landing | the round-86 non-author spot-check again landed without its `corpus/README.md` map row … | Q80's predecessor … | adopted in-round through `scripts/spotcheck-adopt.mjs …`
  | survivor | the frozen 12 arms cannot see a worktree-vs-revision hash substitution … | the frozen kill rule … | disclosed as the reason C1 is UNMET …
  | number-drift | the plan's own count of "four same-directory fixtures" is right, but the arm table's `clean-r87` arm also requires `matched>=8` … | the L1's post-data re-read of `probe/probe87-c1.mjs:112` | recorded here as a descriptive limit of the frozen arm …
  | number-drift | the frozen plan and this round's first knowledge draft said "229 receipts carry neither `cmd=` nor `tool_sha256=`" … | the scribe seat's field-state census … | corrected in `corpus/knowledge/receipt-subject-binding.md`, `corpus/QUALITY.md` Q80 and this lesson …
  | reference-drift | the frozen plan and the first knowledge draft cited `.ufo/waves/round-86/run-close.mjs:20` for the digest; line 20 is the `plan` case entry and the digest is line 24 … | the scribe seat re-opened the file at `19b4e440` … | corrected in the knowledge entry and Q80 …
  | provider | one seat (`K87ExecSources`) reported no artifact before the wave settled … | the wave's tranche spawning under a shared 60-seat fleet cap | disclosed in the report …
===== corpus/lessons/round-88.md
  | survivor (predicate power, recurrence of round 87) | nine seat constructions at `C88_C1: HELD held=20/20` … | the frozen kill rule … | Q81 round-88 amendment …
  | attribution (K87-V1, mined from round 87) | round 87 cited `RECEIPT_BIND: CLEAN matched=12` for its close receipts; the committed `.ufo/waves/round-87/close/bind.txt` prints `matched=10` … | Q80 (subject binding) does not cover "the bind receipt counted every other receipt" | close runner v3 (`run-close.mjs`) runs `bind` last …
  | ordering (K87-V2) | round 87's plan commit read `PLAN_BEFORE_READY: FAIL … MAP_DRIFT` … | `plan-before-ready` map arm (it caught it) | the round-87 spot-check was adopted inside the round-88 freeze commit …
  | provider/process | the L1 wrote the integration target before the wave so attack seats had one fixed target … | — | — |
===== corpus/lessons/round-89.md
  | **survivor** (round 88, mined here) | `build/K88Critic/SCORES.md` + `build/K88Critic/discriminate.mjs`: nine constructions reached 20/20 … | `none` at the time … | Q81's round-88 amendment … and the pre-data control table this round committed …
  | **vacuous** (round 89, this round) | `build/K89Review/probe-cand-probe-keyed.txt` — a tool that computes nothing prints `C89_C1: HELD held=30/30` … | `none` — the plan's limit (a) asserted an output-text oracle could not be gamed this way; it was wrong | **Q82** (new) …
  | **survivor** (round 89, this round) | `build/K89Review/probe-cand-skip-mode.txt` (30/30 …) and `build/K89ExecInst/abs-symlink-check.txt` … | Q82, written this round after the finding … | the Q82 twin requirement …
  | **reference-drift** (round 89, this round) | `probe/probe89-c1.mjs` header still says A25 runs "under a 256 MiB address-space cap"; the code uses a mode-0000 sparse file … | Q82's "the scorer's docstring names the fixture it actually builds" | disclosed; the frozen probe is not edited after data |
===== corpus/lessons/round-90.md
  | M1 — the scorer hands the candidate its fixture identity in the path … | `corpus/lessons/round-89-verifier-spotcheck.md` §2; `.ufo/waves/round-89/build/K89Review/probe-cand-probe-keyed.txt` (30/30) | none before the freeze: Q82 entered the corpus at `7a8afb5f` … | round-90 probe uses per-run random fixture labels and arm-free counters …
  | M2 — the invisible-prefix class was never armed: a duplicate field behind U+200B/U+FEFF reads CLEAN (K89-V1) | `.ufo/waves/round-89/build/K89Sentinel/attacks.txt` rows B2, B3, B7 … | none: the round-89 probe had only the file-leading `bom-rev` arm | probe90 arms `dup-feff` … `dup-nbsp` and `single-zwsp`/`single-nbsp` …
  | M3 — the probe header's no-round-token claim is false: the mandated scratch root `/fast/scratch/hyaku/kumitate-r90/…` is the `--work` path the candidate sees, and the probe sets `TMPDIR=<work>` for every call | `.ufo/waves/round-90/w1/K90CriticA.md` (constructions d, e: 47/47 on two runs) | none: `K90ExecAudit` checked arm labels in path and file names only, not the scratch root token | **not fixed in round 90** (the probe is frozen …). Routed to round 91: a counter version that runs each arm under two `TMPDIR` values and two work roots with no round token …
  | M4 — the counter cannot tell field-line scoping from a whole-text strip (no arm places an invisible code point mid-token) | `.ufo/waves/round-90/w1/K90Reviewer.md` candidate 1 (47/47) and step 4 … | none | **not fixed in round 90** (frozen). Routed to round 91: mid-token arm with a positive twin …
  | M5 — round 89 closed with the round-gate's required record lines absent (`SCORECARD` row 89, `LOG` round-89 line, `## Planned` naming no later round) | `node scripts/round-gate.mjs --round 89` at base `7218699c` (`.ufo/waves/round-90/w1/K90Scout.md` §3) | none: the closure ran the proxy and checklists, not the round gate on the base commit | appended the row, the LOG line and the round-90 `## Planned` pointer (`SCORECARD.md`, `LOG.md`); the round-90 close runs `round-gate` on the committed tree. |
===== corpus/lessons/round-87-verifier-spotcheck.md
  (no '## Mistakes' section; routed-defect headings: 0)
  1:## 1. Conformance (step 1)
  2:## 2. Claims
  3:## 3. Discernment spot-check
  4:## 4. Trend verdicts
  5:## 5. Routed defects (lane fixes next round)
===== corpus/lessons/round-88-verifier-spotcheck.md
  (no '## Mistakes' section; routed-defect headings: 0)
  1:## 1. Conformance (step 1)
  2:## 2. Claims
  3:## 3. Per-axis verdicts (non-author grading)
  4:## 4. Discernment spot-check (LEARNING.md — checked from outside)
  5:## 5. Trend verdicts (this closure's, with evidence)
  6:## 6. Routed defects — kumitate must fix in round 90
===== corpus/lessons/round-89-verifier-spotcheck.md
  (no '## Mistakes' section; routed-defect headings: 0)
  1:## 1. Conformance (step 1)
  2:## 2. Claims
  3:## 3. Axis verdicts (non-author grading)
  4:## 4. Discernment spot-check (LEARNING.md, from outside)
  5:## 5. Trend verdicts
  6:## 6. Routed defects — kumitate must fix in round 90
===== corpus/lessons/round-90-verifier-spotcheck.md
  (no '## Mistakes' section; routed-defect headings: 0)
  1:## 1. Step-1 conformance
  2:## 2. Claim re-check — C1 operability, capability acquisition `receipt-bind` v4 (UNMET confirmed)
  3:## 3. Per-axis verdicts (non-author grading)
  4:## 4. Discernment spot-check (LEARNING.md — checked from outside)
  5:## 5. Trend verdicts (this closure's, with evidence)
  6:## 6. Routed defects (lane must fix in round 91; status-neutral here)
```

## Why M6 is a second row and not a repeat of M5

M5 (round-90 lesson) is the round-89 defect: round 89 closed without the gate's required record
lines, and the fix appended them. M6 is what happened when the fix was applied in round 90
itself, and it is a different object: the records DID land (row 90 and the LOG line are both at
`bf24587c`), but the round-90 close battery had already measured the gate at the earlier
revision `82c9c7ef`, so the committed round-90 close receipt is red for a reason that has nothing
to do with the round's work, and M5's fix text asserts a property ("the round-90 close runs
`round-gate` on the committed tree") that the committed receipt contradicts. The round-90
verifier spot-check §6.1 already routed it ("re-run `round-gate --round 90` at the landed
revision and commit the receipt next round"); it was never mined into a lesson row, and the
lane still held no committed green receipt at the round-91 freeze. The second half of M6 —
the `## Planned` pointer naming the round itself rather than a later round, so the gate's
`n > round` check still warns — is not in any spot-check either; it is measured here.

## Note on scope

The M6 row is a finding about the round's own CLOSE EVIDENCE, not about claim C1's instrument.
It does not bear on the kill rule and is not a claim about `receipt-bind` v5. It is reported
because the L1's close for round 91 repeats the same order: `run-close91.mjs` runs its
`round-gate` case (line 178) among thirteen cases and writes neither `SCORECARD.md` nor `LOG.md`
itself, so the same red receipt will be produced unless the records land first or the gate is
re-run and that receipt committed.

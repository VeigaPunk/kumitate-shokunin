# K91ScribeLesson — round 91 wave evidence: knowledge entry, lesson Mistakes table, QUALITY candidate

Seat: K91ScribeLesson (scribe, leaf). Lane `kumitate-shokunin`, round 91 attempt 1, hyaku run 15.
Claim C1 = capability acquisition `receipt-bind` v5 (contract `kumitate-receipt-bind-v5`).

Lane is **detached**; the frozen round-91 commit is `2b1b8bf3d274db8e608035bffb27bd3b3d4009d4`
(plan + frozen probe `probe91-c1.mjs` sha256 `3bd88e8efe4bb0851b5ef57c90e80792eada34cd0f2450922d75fbe9fc313f4c`
+ 14 pre-data controls). Nothing under `scripts/`, `corpus/`, `.ufo/pins/`, `.ufo/waves/round-91/probe/`,
`plan.md` or `controls/` was written. The frozen probe was never edited, moved or copied-and-modified.

Node v24.21.0 (already installed; **no tool was installed or upgraded** this seat — the task
needed none).

## Deliverables (all under `.ufo/waves/round-91/K91ScribeLesson/`)

| file | what it is |
|---|---|
| `knowledge-receipt-bounded-external-reads.md` | knowledge-entry draft for the L1: what v5 refuses and why (non-regular external instruments, the `st_size` cap, descriptor-based `fstat`), the do-nothing evidence, the control-table summary, Limits. Sources cited as `S###` placeholders named by URL (fifo(7), open(2), Node `fs`) for the L1 to fill with the ids the sources seat assigns. |
| `lesson-mistakes.md` | the round-91 `## Mistakes` table: **M3** (the required row, with the M3 control receipt lines quoted verbatim) and **M6** (a second row, see below), plus the pasted `## Mistakes` sweep for rounds 87-90. |
| `quality-candidate.md` | **Q84** candidate for `corpus/QUALITY.md` (next free id: `grep -oE "^#{1,4} Q[0-9]+" corpus/QUALITY.md` ends at `Q83`), generalising M3, with its red/green command. |
| `pointer-checks.txt` | `ls`/`grep` receipt for **every** pointer cited in the three drafts (28 lane paths + 1 fleet path + the line-level content greps behind each claim). |
| `evidence/probe-base-v4-at-rev.txt` | this seat's own frozen-probe run on the v4 bytes at the freeze rev. |
| `evidence/probe-v5-run1.txt` | this seat's own frozen-probe run on the executor's v5 candidate. |
| `evidence/evidence-sweep-mistakes.txt` | the `## Mistakes` sweep transcript. |
| `evidence/round-gate-90-at-head.txt` | this seat's read-only round-gate run for round 90 on the landed lane. |

## Commands run and what they printed

```
$ node .ufo/waves/round-91/probe/probe91-c1.mjs --lane <lane> --work <scratch> --alt /fast/scratch/hyaku \
      --rev 2b1b8bf3d274db8e608035bffb27bd3b3d4009d4 --tool <scratch>/base-v4-at-rev.mjs
C91_C1: UNMET held=52/56   exit=1
ARM ext-zero:    FAIL A=FAIL B=FAIL | A: bound=OUT exit=null   | B: bound=OUT exit=null
ARM ext-null:    FAIL A=FAIL B=FAIL | A: bound=in exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=1 | (same in B)
ARM ext-fifo:    FAIL A=FAIL B=FAIL | A: bound=OUT exit=null   | B: bound=OUT exit=null
ARM ext-overcap: FAIL A=FAIL B=FAIL | A: bound=in exit=0 RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=1 | (same in B)
   (also PASS: ext-empty-twin, ext-dir, ext-atcap)
```
This reproduces the committed do-nothing control `.ufo/waves/round-91/controls/ctl-base-v4-at-rev.txt`
(`C91_C1: UNMET held=52/56`) byte-for-byte on the same four arms.

```
$ node .ufo/waves/round-91/probe/probe91-c1.mjs --lane <lane> --work <scratch> --alt /fast/scratch/hyaku \
      --rev 2b1b8bf3d274db8e608035bffb27bd3b3d4009d4 --tool .ufo/waves/round-91/K91ExecInst/receipt-bind-v5.mjs
C91_C1: HELD held=56/56    exit=0     (every arm A=PASS B=PASS)
```
This is a **candidate** measurement of the executor's file (sha256 `33ee29eb…63013d`), NOT the
integrated instrument. The L1 measures the integrated bytes at M.

```
$ node .ufo/waves/round-91/controls/run-controls91.mjs --lane <lane> --rev 2b1b8bf3… \
      --work <scratch> --alt /fast/scratch/hyaku --out <scratch> --only r90-roundpath-gated+ref
r90-roundpath-gated+ref	C91_C1: UNMET held=47/56	selftest,dup-feff,dup-zwsp,dup-zwnj,dup-zwj,dup-lrm,dup-nbsp,single-zwsp,single-nbsp
```
plus the probe run on that tool: **8** arms printed `FAIL A=PASS B=FAIL`. This is the M3
shown-able-to-fail, re-derived by this seat (the committed receipt
`controls/ctl-r90-roundpath-gated+ref.txt` reads the same `47/56` with the same 8 diverging arms;
the sibling `ctl-r90-tmpdir-gated+ref.txt` reads the same, so the `TMPDIR`-relation gate is caught
too). The Q84 command on this tool prints `Q84: FAIL exit=1 diverging_arms=8`.

```
$ node scripts/round-gate.mjs --round 90
ROUND_GATE  warning  SCORECARD_PLAN_MISSING  ## Planned names no round later than 90
ROUND_GATE: CLEAN (round=90 lane=kumitate checks=10 errors=0 warnings=1)      exit=0
$ node scripts/round-gate.mjs --round 91
ROUND_GATE: DRIFT (round=91 lane=kumitate checks=5 errors=3 warnings=1)       exit=1
```

## The second Mistakes row (M6) — the one judgement call

The sweep of the `## Mistakes` sections of rounds 87-90 lessons (the four verifier spot-checks have
no such section; their headings are listed in the sweep) is pasted in `lesson-mistakes.md` and in
`evidence/evidence-sweep-mistakes.txt`. Every class in it is already mined or already repaired
**except** one that is real, unmined, and measured by this seat:

**M6 — the round's own gate is measured before the round's records exist, so the round closes with
a red `round-gate` receipt that the report explains away instead of re-measuring.** Round-90
lesson M5's fix text claims "the round-90 close runs `round-gate` on the committed tree". The
committed bytes contradict it: `.ufo/waves/round-90/close/round-gate.txt` names `rev=82c9c7ef…`
and reads `ROUND_GATE: DRIFT (round=90 lane=kumitate checks=5 errors=3 warnings=1)` exit 1 with
`REPORT_MISSING`, `SCORECARD_ROW_MISSING`, `LOG_ENTRY_MISSING`. The records DID land — but at
`bf24587c`, not at `82c9c7ef` (measured: `SCORECARD` row 90 count 0→1 and `LOG` round-90 line count
0→1 between the two revisions). At the landed revision the gate is CLEAN (exit 0), yet the lane
held **no committed receipt** of that green run at the round-91 freeze (`grep -rn "ROUND_GATE:
CLEAN (round=90" .` finds only round-91 seat artefacts). The fleet report says "re-run after this
report lands (see Pre-report gate)" (`:74`) but its own `## Pre-report gate` section (`:126-129`)
contains only `ls-remote` and the `SHONEN` grep — no gate re-run. The round-90 verifier spot-check
§6.1 already routed this; it was never mined into a lesson row. A second half is new and mine: the
`## Planned` pointer must name a round LATER than the round being gated (the gate's check is
`n > round`), and the body names round 90 at most, so round 90's gate still warns
`SCORECARD_PLAN_MISSING` even when green.

**This bears on round 91's own close**: `run-close91.mjs` runs its `round-gate` case (line 178)
among thirteen cases and writes neither `SCORECARD.md` nor `LOG.md` itself (`grep -c "SCORECARD.md"`
→ 0), so the same red receipt will be produced unless the records land first or the gate is re-run
afterwards and THAT receipt committed. The L1 should read this before closing.

Scope note: M6 is about the round's close EVIDENCE, not about claim C1's instrument; it does not
bear on the kill rule.

## Out of scope (not claimed, not adjudicated here)

- The round-90 M4 class (mid-token invisible code point) — the round-91 probe arms it
  (`midtoken-invisible` + twin `midtoken-twin`, probe91 lines 821/828) and the committed control
  `ctl-r90-global-strip+ref.txt` shows it killing the whole-text strip (`UNMET held=54/56`,
  `midtoken-invisible` FAIL). Not my row to adjudicate; recorded here for the L1.
- The sentinel's RD-1/RD-3/RD-4/RD-5 defects and DESIGN-1 — routed, out of class for C1.
- The v5 candidate's own quality — the executor's and the L1's business.

## Hygiene

- Lane writes: **only** `.ufo/waves/round-91/K91ScribeLesson/` and this report
  (`.ufo/waves/round-91/w1/K91ScribeLesson.md`). `git status --porcelain` shows no change of mine
  to `scripts/`, `corpus/` or `.ufo/pins/` — the `M scripts/receipt-bind.mjs`, `M corpus/README.md`
  and `M .ufo/pins/readme-map.json` entries in the worktree are **other seats'** in-flight work,
  not mine.
- Scratch: `/fast/scratch/hyaku/kumitate-r91/K91ScribeLesson/`, created with `mkdir -p`, passed
  explicitly as `--work <scratch>/pN` and `--alt /fast/scratch/hyaku` exactly; probe runs used
  `TMPDIR=<scratch>`. No `/tmp` path is cited as evidence. Scratch removed before yield.
- No git mutation anywhere (only `git show`/`git log`/`git status` on the detached lane; no
  `commit`/`add`/`stash`/`checkout`/`reset`/`push`, no `jj` command). No fixture repo was created
  (the frozen probe makes its own).
- No message to `agent://all`. No fleet-root tracked file touched.

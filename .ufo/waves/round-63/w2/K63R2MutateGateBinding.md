VERDICT: The gate's binding logic is strongly covered — 28 of 43 single-edit mutants die on the existing selftest+44 controls+real wave — but 15 mutants survive, all in shape-floor/binding-detail code (rows, distinctTs, subRole, nameMismatch, idRows, initTools, candidate suffix digits, marker newline, finished()'s exitKind, dead-seat report exemption, results agent cell, spawned word-boundary, ready round and dispatch-path binding); 14 new controls under build/K63R2MutateGateBinding/new-controls/ kill all 15, verified against pristine and mutant.

## Evidence

Measured revision a9531c8e617338fd16cb69c61344ef8f17711117 (HEAD, worktree file identical: `git status --porcelain scripts/inline-dispatch-evidence.mjs` empty). Pristine copy sha256
`290baa65611a6a935f463b46aeccc0c0bd5940f0329264955fd448c3e62660af` (= lane file before and after the run; restored copy re-hashed identical).

Baseline (pristine copy, detector = selftest + all 44 committed controls + real wave):
```
INLINE_DISPATCH_SELFTEST: PASS (48/48)          exit 0
real wave: 0  INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)
controls: 44/44 exit as their expect file (fails=0)  # 14 frozen + 30 wave-1 ratchet cases
```
Detector per mutant: `node gate.mjs --selftest`; per control `node gate.mjs --root <case>/lane --round 7 --wave w1 --sessions-root <case>/sessions --dispatcher-log <case>/dispatcher.log`; real wave `node gate.mjs --root /home/vgpnk/Projects/shokunin/kumitate-shokunin --round 63 --wave w1`. "Reads as before" = byte-identical normalized selftest output, all 44 control exit+finding lines, real-wave exit+line. Driver: /tmp/kumitate-r63/K63R2MutateGateBinding/work/run-detector.sh; per-mutant diffs in work/mutants/M*.diff.

43 mutants (one minimal edit each, applied to the scratch copy only):

| # | mutation (site → change) | verdict | killed by |
|---|---|---|---|
| M01 | SHAPE.rows 10→2 | SURVIVED | new mutk-rows-floor |
| M02 | SHAPE.spanSec 120→0 | KILLED | rich-thin-transcript |
| M03 | SHAPE.distinctTs 8→1 | SURVIVED | new mutk-ts-dup |
| M04 | SHAPE.assistants 2→0 | KILLED | rich-toolcalls-no-results |
| M05 | TIMELINE `spanSec >= SHAPE.spanSec`→`>= -1` | KILLED | rich-thin-transcript |
| M06 | ROWGRAPH `runtimeRows >= rows-2`→`>= 0` | KILLED | rich-untimed |
| M07 | ROWGRAPH `dangling === 0`→`<= 1` | KILLED | selftest + rich-broken-rowgraph |
| M08 | HEADER `subRole >= 1`→`>= 0` | SURVIVED | new mutk-subrole |
| M09 | TOOL_JOIN `nameMismatch === 0`→`<= 1` | SURVIVED | new mutk-toolname-once |
| M10 | `t.dangling = filter(...)`→`= 0` | KILLED | selftest + rich-broken-rowgraph |
| M11 | `t.norm = sha(...)`→`null` | KILLED | selftest + cheap-padded-bytes, template-renamed-transcript, 12 mut-* |
| M12 | norm fingerprint keeps seat name (drop `.split(stem).join('@')`) | KILLED | selftest + cheap-padded-bytes, template-renamed-transcript |
| M13 | `idRows += 1`→`= t.rows` (inflation) | SURVIVED | new mutk-idrows-partial |
| M14 | candidates: drop `/^\d+$/` suffix test | SURVIVED | new mutk-candidate-suffix |
| M15 | candidates order: prefix stems before exact stem | KILLED | selftest + duplicate-spawn |
| M16 | identity: marker `# Seat N\n`→`# Seat N` (no newline) | SURVIVED | new mutk-marker-nonewline |
| M17 | identity: `ctxHead`→`ctxHead.slice(0,24)` | KILLED | selftest (context-names-another-round) |
| M18 | identity: task tail 120→20 chars | KILLED | mut-task-body-swapped |
| M19 | corrupt/foreign counters both incremented | KILLED | selftest (corrupt-transcript) |
| M20 | missing-selection CORRUPT↔ABSENT swapped | KILLED | selftest + forged-no-sessions |
| M21 | ambiguity threshold `>1`→`>2` | KILLED | selftest + duplicate-spawn |
| M22 | chosen transcript = last candidate (not first finished) | KILLED | selftest (dead-earlier-try) + duplicate-spawn |
| M23 | SESSION_ID_DUP check disabled | KILLED | selftest + session-id-dup |
| M24 | PARENT_MISMATCH `>1`→`>2` | KILLED | selftest + parent-mismatch |
| M25 | `parents.add(tr.parent)`→`parents.add(tr.sessionId)` | KILLED | selftest (honest) + 40 controls |
| M26 | SESSION_TEMPLATE check disabled | KILLED | selftest + cheap-padded-bytes, template-renamed-transcript |
| M27 | `finished()` drops exitKind (yielded only) | SURVIVED | new mutk-dead-aborted-report/-noreport |
| M28 | NOT_A_DISPATCH `sessions===0`→`<0` | KILLED | selftest + forged-no-sessions |
| M29 | `!tr.sessionId`→FOREIGN check disabled | KILLED | mut-session-id-absent |
| M30 | MIN_REPORT_BYTES 64→32 | KILLED | mut-report-63-bytes |
| M31 | REPORT_DUP check disabled | KILLED | selftest + reports-identical |
| M32 | REPORT_ABSENT exemption `!s.dead` dropped | SURVIVED | new mutk-dead-aborted-noreport |
| M33 | DEAD_UNNAMED check disabled | KILLED | selftest (dead-unnamed-in-report) |
| M34 | ctxHead slice 200→12 | KILLED | selftest + mut-context-head-truncated |
| M35 | results agent compare `!==t.agent`→`===undefined` | SURVIVED | new mutk-results-agent |
| M36 | results extra-row check disabled | KILLED | results-name-swap |
| M37 | spawned regex word boundary `\b` dropped | SURVIVED | new mutk-spawn-boundary |
| M38 | spawned count `!==tasks.length`→`!==tasks.length+1` | KILLED | selftest (honest) + 40 controls |
| M39 | doneRe round pinned `round-99999` | KILLED | selftest (honest) + 40 controls |
| M40 | ready.round check dropped | SURVIVED | new mutk-ready-round |
| M41 | ready.dispatch endsWith check dropped | SURVIVED | new mutk-ready-dispatch-path |
| M42 | HEADER `initTools >= 1`→`>= 0` | SURVIVED | new mutk-init-tools |
| M43 | TIMELINE `tsDistinct >= SHAPE.distinctTs`→`>= 1` | SURVIVED | new mutk-ts-dup |

No mutant was inconclusive: the baseline detector passes everything, so every non-empty diff is a kill, every empty diff a survival. No equivalence claims needed: every survivor changed observable output on some input once its killing control ran (equivalence would have required an argument; none arose).

Survivor kills verified in both directions (pristine → expect holds; mutant → differs), e.g.:
```
mutk-rows-floor        pristine: 1 SESSION_ROWGRAPH   M01: 0 CLEAN
mutk-ts-dup            pristine: 1 SESSION_TIMELINE   M03/M43: 0 CLEAN
mutk-subrole           pristine: 1 SESSION_HEADER     M08: 0 CLEAN
mutk-toolname-once     pristine: 1 SESSION_TOOL_JOIN  M09: 0 CLEAN
mutk-idrows-partial    pristine: 1 SESSION_ROWGRAPH   M13: 0 CLEAN
mutk-candidate-suffix  pristine: 1 SESSION_ABSENT     M14: 1 NOT_A_DISPATCH,SESSION_FOREIGN
mutk-marker-nonewline  pristine: 1 SESSION_FOREIGN    M16: 0 CLEAN
mutk-dead-aborted-report    pristine: 0 CLEAN (done=0 dead=1)   M27: 0 CLEAN (done=1 dead=0)
mutk-dead-aborted-noreport  pristine: 0 CLEAN (done=0 dead=1)   M27: 1 REPORT_ABSENT   M32: 1 REPORT_ABSENT
mutk-results-agent     pristine: 1 RESULTS_MISMATCH   M35: 0 CLEAN
mutk-spawn-boundary    pristine: 1 SPAWN_LOG_ABSENT   M37: 0 CLEAN
mutk-ready-round       pristine: 1 READY_MISMATCH     M40: 0 CLEAN
mutk-ready-dispatch-path pristine: 1 READY_MISMATCH   M41: 0 CLEAN
mutk-init-tools        pristine: 1 SESSION_HEADER     M42: 0 CLEAN
```

## Findings

1. **K63R2MutateGateBinding-1 (medium, ratchet)** — the four shape floors `rows`, `distinctTs`, `subRole`, `initTools`, plus `nameMismatch===0` and the `idRows` count, have no committed control isolating each floor: M01/M03/M08/M09/M13/M42/M43 all survived the 48-case selftest, 44 controls and the real wave. A forged transcript tuned just under one floor while satisfying the others passes the gate. Repro: apply any of those edits to a copy of scripts/inline-dispatch-evidence.mjs and run the detector. Killers (new controls): mutk-rows-floor, mutk-ts-dup, mutk-subrole, mutk-toolname-once, mutk-idrows-partial, mutk-init-tools.
2. **K63R2MutateGateBinding-2 (high, ratchet)** — `finished()` ignores `session_exit.kind` (M27): a seat that yields and then records `kind:"aborted"` is credited done. The real wave currently reads `dead=0`, so this arm is unexercised on live data; the 6-idle-seat comment in the code shows the author relies on exitKind semantics. Killed by mutk-dead-aborted-report (line `done=0 … dead=1` → `done=1 … dead=0`) and mutk-dead-aborted-noreport (CLEAN → REPORT_ABSENT).
3. **K63R2MutateGateBinding-3 (medium, ratchet)** — dead seats are exempt from REPORT_ABSENT (M32): a dead seat with no committed report reads CLEAN. Killed by mutk-dead-aborted-noreport.
4. **K63R2MutateGateBinding-4 (medium, ratchet)** — results.json binds seat names but not their `agent` cell (M35): a row with the right name and a wrong agent reads CLEAN. Killed by mutk-results-agent.
5. **K63R2MutateGateBinding-5 (medium, ratchet)** — transcript candidates accept any `<Seat>-<anything>.jsonl` stem once the digit test is dropped (M14); the harness label-dedupe contract (`<name>-<n>`, digits only) is load-bearing but uncontrolled. Killed by mutk-candidate-suffix (SESSION_ABSENT → SESSION_FOREIGN).
6. **K63R2MutateGateBinding-6 (medium, ratchet)** — the seat marker is matched without its trailing newline (M16): `# Seat A1x` binds a transcript to seat A1. Killed by mutk-marker-nonewline.
7. **K63R2MutateGateBinding-7 (medium, ratchet)** — the spawned log line is matched without a word boundary (M37): `respawned demo 7 w1 1` satisfies the gate. Killed by mutk-spawn-boundary.
8. **K63R2MutateGateBinding-8 (medium, ratchet)** — the ready marker's `round` field (M40) and its dispatch-path suffix (M41) are each unbound: a ready file claiming round 9 (path round-7) or pointing at another round/wave's dispatch passes once the corresponding check is dropped. Killed by mutk-ready-round and mutk-ready-dispatch-path.
9. **K63R2MutateGateBinding-9 (info, positive)** — the matched/foreign/corrupt discriminator, ambiguity, session-id/parent/template arms, report arms and log-count arms are well covered: 28 mutants died, most on multiple independent detectors. The committed 44-case control set matches its expect files at the measured revision (baseline fails=0), so the frozen receipts still hold at a9531c8e.
10. **K63R2MutateGateBinding-10 (process, self-reported)** — my first detector driver had two defects (baseline-dir existence tested with `-f` so diffs never ran; selftest output embeds a random mkdtemp path). Fixed before any verdict was recorded; M01–M07 were re-run after the fix and the table above reflects only post-fix verdicts.

## Artifacts

- Report: .ufo/waves/round-63/w2/K63R2MutateGateBinding.md (this file)
- New controls (ratchet proposals for controls/inline/, L1 to integrate): .ufo/waves/round-63/build/K63R2MutateGateBinding/new-controls/{mutk-rows-floor, mutk-ts-dup, mutk-subrole, mutk-toolname-once, mutk-idrows-partial, mutk-candidate-suffix, mutk-marker-nonewline, mutk-dead-aborted-report, mutk-dead-aborted-noreport, mutk-results-agent, mutk-spawn-boundary, mutk-ready-round, mutk-ready-dispatch-path, mutk-init-tools} — each with dispatcher.log, expect, lane/, sessions/orch/ (14 expect files, 14 transcripts).
- Scratch (restoration evidence): /tmp/kumitate-r63/K63R2MutateGateBinding/work/ — gate.mjs (restored, sha256 290baa65…660af), pristine.mjs, run-detector.sh, verify-new.sh, gen-controls.mjs, base/ (baseline outputs), mut/baseline/, mutants/M01–M43.diff (+ .newctl.txt kill proofs for survivors).

## Limits

- Not mutated: fail-closed paths (REV_UNREADABLE/WAVE_ABSENT/LOG_UNREADABLE…), parseArgs/usage, makeSource rev-mode (`git show`), indexSessions depth bound, the 64 MB transcript size guard, selftest harness internals, doneRe's lane/wave components (only its round was pinned), spawn regex's lane/wave components, `--report` reading beyond M33. Rev-mode was exercised only via the selftest's fixture repo, not against the real wave.
- Each new control was verified against the pristine gate and its targeted mutant only — not re-run against the other 42 mutants (a control may kill more than its target; mutk-dead-aborted-noreport demonstrably kills both M27 and M32).
- The 14 new controls are proposals under build/; controls/inline/ itself was not touched (L1 owns it). No SCORECARD/LOG/scripts edits; no subagents; no tool installs (node v24.21.0 already present; pacman untouched per the 2026-10-20 pause).
- One scratch-generator bulk edit used `perl -0pi` to insert a repeated `names:` field across 13 call sites of my own scratch file (not a lane file); all resulting controls were regenerated and re-verified afterwards.

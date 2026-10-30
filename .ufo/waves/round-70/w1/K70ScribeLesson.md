# K70ScribeLesson — round 70 Gate/Mistakes draft (C1 replay isolation, operability)

Seat: scribe, leaf. Judged on: operability. Milestone: ScribeLesson.
Draft artifact: `.ufo/waves/round-70/build/K70ScribeLesson/lesson-draft.md` (private build path; not production).
No production file was edited. No commits, pushes, or mutating git/jj. No scratch directory created; nothing to clean.

## Axes (named)

1. Accuracy of the Gate: every quoted source line checked against the frozen bytes, read-only.
2. Accuracy of the Mistakes: each routed round-69 item traced to its named evidence.
3. Red/green requirements: stated as observables to be recorded, not as results.

## Commands and observed outcomes

Only read-only tools were used. No frozen script was executed. Nothing below is an executed verification.

| # | Command (tool) | Observed |
|---|---|---|
| 1 | `read skill://godspeed` | godspeed posture loaded |
| 2 | `read .ufo/waves/round-70/plan.md` | C1 frozen predicate, R1–R10, target 10/10 from 2/10 base; scratch/ownership contract |
| 3 | `read /home/vgpnk/.omp/agent/RULES.md` | tooling directive; no install needed for this seat |
| 4 | `glob .ufo/waves/round-70/**`, `round-69/**` | round-70 w1 holds other seats' reports; round-69 close and controls present |
| 5 | `read corpus/lessons/round-70.md` | existing Gate and Mistakes draft (Mistakes lines 13–14 cite routed items 3 and 2) |
| 6 | `glob corpus/lessons/*` | lesson convention files confirmed; round-69.md and round-69-verifier-spotcheck.md exist |
| 7 | `read round-69/build/K69ReviewBaseReceipts/comparison.json` | `match` true for `base/deprec69-base.txt` and `base/ledger69-base.txt`; `match` false for `controls/c1-autoledger.txt`, `controls/c1-donothing.txt`, `controls/c2-autoorigin.txt`, `controls/c2-donothing.txt`, `controls/c2-forgecapture.txt`. `payload_match_except_rev_seed` is true for all seven. Recorded as observed field values, not re-derived. |
| 8 | `read round-69-verifier-spotcheck.md` | routed items 1–6; items 2 and 3 are the ones the round-70 lesson cites |
| 9 | `read round-69.md` | Freeze errata (fixed-output replay overwrote two frozen receipts, restored byte-exact); Scratch-policy erratum (`/tmp/forge-sed.txt` regardless of TMPDIR) |
| 10 | `read .ufo/waves/round-69/probe/c2-controls.sh:15-90` and `:95-119` | line 24 `W=` fixed lane path; line 80 `/tmp/forge-sed.txt` inside `forgecapture)`; lines 102–108 fixed `$W` writes |
| 11 | `read base/freeze-map.txt` | `README_MAP: CLEAN files=169 rows=169 covered=169`, `exit=0` (receipt read, not re-run) |
| 12 | `grep` over `round-69/probe/c1-controls.sh` and `c2-controls.sh` for `$W`, `/tmp`, `> "$` | c1 fixed writes lines 74–77; c2 fixed writes lines 102–108; the only `/tmp` hit is c2 line 80 |
| 13 | `grep` over `corpus/lessons/round-6*.md` for red/green | prior convention: "no red-before → fixed-only-delta → green control pair was committed" (round-62 lesson, line 25) |

## Draft (summary; full text in the build artifact)

Gate:
- Admit: versioned private-output replay of the five frozen controls, with unique work directory and exclusive output.
- Red before: frozen base `REPLAY70_UNMET held=2/10` exit 1; R9 existing-output refusal must be shown failing against an overwriting replay, digests before and after recorded.
- Green after: `REPLAY70_HELD held=10/10` exit 0 at a measured revision, from a committed receipt. Not yet observed.
- Limits: replay isolation only; no semantic-remediation or universal forgery claim; live c2 forgecapture is network-dependent and failure is reported, not waived.
- Reject: re-running originals in the production checkout. Flip: private-output successor preserving frozen bytes.

Mistakes:
- landing (round-69 routed item 3): replays wrote into the fixed lane path, temporarily overwriting two frozen receipts (restored byte-exact). Captured-by scratch discipline only. Fix: unique mkdtemp work root, copy receipts out before cleanup, exclusive output, refuse existing output with bytes unchanged; R9 must demonstrate refusal.
- scope (round-69 routed item 2): frozen c2 line 80 writes unused `/tmp/forge-sed.txt` in the forgecapture arm, ignoring TMPDIR. Captured-by rule 7.4, unenforced. Fix: private copy removes the write; frozen source bytes preserved.

## Discrepancies found for L1

1. `corpus/lessons/round-70.md` line 13 says replays "overwrote two frozen receipts". The round-69 closure says "temporarily overwrote ... restored byte-exact". The draft uses the closure wording.
2. `round-70.md` line 13 says the counter's existing-output arm "must demonstrate failure". The plan's R9 specifies "existing output is unchanged after refusal" and gives no exit code. The draft states the observable as refusal plus unchanged bytes; no exit code is asserted.
3. `round-70.md` line 14 says the `/tmp` write is "captured-by campaign scratch rule 7.4". Verified the write exists at line 80 only in the forgecapture arm; the draft notes that scope.

## Unrun / not verified

- No `replay70-probe.mjs`, `control-replay.mjs`, or any frozen control was executed.
- The red and green receipts named in the draft do not yet exist in the lane; they are requirements, not results.
- Round-69 routed items 1, 4, 5, 6 are deliberately excluded from the repair claim, as in the existing draft.

## Tooling

No installs or updates were performed by this seat. Recorded: none.

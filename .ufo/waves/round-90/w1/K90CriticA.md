# K90CriticA — round 90 C1 kill-rule falsification (context exploitation)

Seat: K90CriticA (critic, leaf). Lane `kumitate-shokunin`, base `7218699cfbdec702ba42f35ceac0a8e52d1bd564`.
Frozen probe `probe90-c1.mjs` sha256 `70622333ca6946c73564e1236f7c19a8efa110200e09043bf2fd3b24d2f2b694`
(read-only, not edited). Instrument v3 `scripts/receipt-bind.mjs` sha256 `37201ad0…1bb3` (matches the base).
Node v24.21.0 (already installed; no tools installed or updated).

Evidence directory: `.ufo/waves/round-90/K90CriticA/` (candidates `cand/`, probe outputs `scores/`,
scores `scores.txt`, non-probe demonstration `np/`, drivers `driver/`).

## Result

KILL_RULE: FIRED

Constructions reaching 47/47: `d-tmpdir-gated-prefix` and `e-round-path-gated-prefix`. Kill-rule verdict for
C1: **UNMET** (rejected-honest-stop) under the frozen plan's kill rule.

Both fire by context, not by instrument behaviour. Each is a copy of v3 that applies the K89-V1 prefix
tolerance only when a context key is present; otherwise it runs plain v3 (which skips the claimed behaviour).

## Scores (frozen probe, `--rev 7218699…`, two independent runs each; full arm lists in `scores.txt`)

| candidate | run1 | run2 | arms that failed (run1) and the arm that caught it |
|---|---|---|---|
| base-v3-copy (do-nothing control, calibration) | 39/47 | 39/47 | the 8 K89-V1 arms `dup-feff`…`dup-nbsp`, `single-zwsp`, `single-nbsp` (matches `controls/table.txt`) |
| a-count-oracle (answers from `git rev-list --count HEAD` mod 3 + receipt listing) | 13/47 | 13/47 | `selftest` (held 25/68: the selftest's own subprocess calls get the count verdict), then `detect-r86-at-rev` (FAIL-CLOSED UNRESOLVED where CLEAN/DRIFT expected) and 33 more |
| b-hex12-clean (CLEAN for any dir/lane basename with 12 hex) | 38/47 | 38/47 | `dir-missing`: the probe's absent-dir name `absent-<12-hex nonce>-dir` matches the rule and returns `CLEAN` (exit 0); plus the 8 K89-V1 arms |
| c-memo-first (replays the first `--dir` verdict from TMPDIR) | 3/47 | 3/47 | `selftest` (held 23/68; the memo was written by the selftest's own first subprocess), `clean-r87-at-rev`, `unchecked`, `unresolved`, … and all 8 K89-V1 arms (replayed CLEAN) |
| **d-tmpdir-gated-prefix** (K89-V1 tolerance only if `TMPDIR` is an ancestor of `--dir`) | **47/47** | **47/47** | none |
| **e-round-path-gated-prefix** (K89-V1 tolerance only if `--dir` contains `/kumitate-r90/`) | **47/47** | **47/47** | none |
| ref-prefix-ungated (calibration, not a construction: K89-V1 tolerance in every context) | 47/47 | 47/47 | none |

Notes on the calibration: the base copy reproduces the committed control (39/47, the same 8 arms). The
ungated prefix fix reaches 47/47, so the probe does discriminate exactly the K89-V1 classes it claims;
it does not discriminate *where* the fix runs.

## Arms passed by context (d and e)

The 8 arms that base v3 fails — `dup-feff`, `dup-zwsp`, `dup-zwnj`, `dup-zwj`, `dup-lrm`, `dup-nbsp`,
`single-zwsp`, `single-nbsp` — are the only arms whose verdict depends on the context gate. Under the probe
the gate is always on, because the probe sets `TMPDIR=<work>` (`cleanEnv()`) and every fixture `--dir` lies
under `<work>` (`mk()`); under the contract's mandated scratch path `/fast/scratch/hyaku/kumitate-r90/<seat>/`
the `/kumitate-r90/` gate is also always on. The other 39 arms are base-v3 behaviour in every context.

## Non-probe demonstration (the skip is real outside the probe)

Receipt `np/d1/r.txt`: `cmd=node scripts/receipt-bind.mjs --selftest` followed by a line
`U+200B cmd=node scripts/nonexistent-tool.mjs --run` (a hidden second `cmd=`). Driver `driver/nonprobe.sh`,
output `np/summary.txt`:

```
base-v3-copy            TMPDIR=.../np-other : CLEAN matched=1 ... exit=0
base-v3-copy            TMPDIR=.../np      : CLEAN matched=1 ... exit=0
ref-prefix-ungated      TMPDIR=.../np-other : FAIL-CLOSED AMBIGUOUS_FIELD r.txt carries 2 cmd= lines exit=2
ref-prefix-ungated      TMPDIR=.../np      : FAIL-CLOSED AMBIGUOUS_FIELD r.txt carries 2 cmd= lines exit=2
d-tmpdir-gated-prefix   TMPDIR=.../np-other : CLEAN matched=1 ... exit=0      <- skips K89-V1 outside the gate
d-tmpdir-gated-prefix   TMPDIR=.../np      : FAIL-CLOSED AMBIGUOUS_FIELD ... exit=2  <- same tool, gate on
e-round-path-gated-prefix TMPDIR=.../np-other : CLEAN matched=1 ... exit=0      <- skips K89-V1 off the /kumitate-r90/ path
e-round-path-gated-prefix TMPDIR=.../np      : CLEAN matched=1 ... exit=0
```

So `d` and `e` score 47/47 on the frozen probe while failing the claimed behaviour (`AMBIGUOUS_FIELD` for
an invisible-prefix duplicate) in every context the probe never builds. The probe cannot see this, because
it never runs the tool in a context where the gate is off.

## Why the probe's CONTEXT is a lever (Q82 field, checked)

- The probe header states "no round constant … appears in any path the candidate sees". The candidate does see
  `kumitate-r90` and the seat name on every arm: `--work` is the contract scratch path
  `/fast/scratch/hyaku/kumitate-r90/K90CriticA/`, and each fixture `--dir` is
  `<work>/run-…/r-<hex>/d-<hex>`. Evidence: the candidate's own detail output in `scores/base-v3-copy.run1.out`
  contains `/fast/scratch/hyaku/kumitate-r90/K90CriticA/…` (7 lines).
- `TMPDIR` is set to `--work` for every probe call, so any gate of the form "TMPDIR is an ancestor of --dir" is
  constant-true under the probe.

Both are instances of the Q82 class ("a capability scorer may not hand the candidate its own fixture's
identity"), now in the environment and the path, not only in the fixture names. The probe is frozen, so this
round cannot repair it; it is routed for the next round's scorer.

## The other constructions (below 47, caught by named arms)

- a-count-oracle: caught by `selftest` and by the first verdict arm `detect-r86-at-rev` (count oracle emits
  FAIL-CLOSED UNRESOLVED); 34 arms fail in total.
- b-hex12-clean: caught by `dir-missing` (the probe's own per-run nonce is 12 hex and names the absent
  directory, so the rule returns CLEAN) and the 8 K89-V1 arms as in the base.
- c-memo-first: caught by `selftest` (23/68 held: the memo was filled by the selftest's first subprocess) and
  by every arm expecting a verdict other than the replayed CLEAN, including all 8 K89-V1 arms.
- The 12-hex basename rule (b) is dead for the probe's own `d-<8 hex>` directories; the `dir-missing` hit is
  the only way it touches the probe.

## Smallest safe correction (for the lane, not applied here)

1. Do not accept a v4 that varies behaviour by `TMPDIR`, the work path, or any `kumitate-r*` segment. A static
   check (`grep -nE 'TMPDIR|kumitate-r|process\.env' scripts/receipt-bind.mjs`, excluding the `GIT_*` drop list)
   is cheap and catches the d/e shape.
2. Add a context-invariance check outside the frozen probe: run the same invalid-prefix receipt
   (`driver/`/`np/` shape) with `TMPDIR` and `--dir` placed in unrelated trees and require the same verdict.
   This is a new control, not an edit to the probe; the probe itself stays as frozen.
3. Route to the scorer author: the probe should run each arm under at least two `TMPDIR` values and a work path
   without any round token, and it should compare the verdict across them.

## Limits of this falsification

- Constructions are mine and cheap by design; they falsify the frozen probe, not the executor's real v4.
- `a` and `c` include selftest-induced failures (their `--selftest` subprocess calls route through the same
  cheat); their low scores are therefore not evidence about a count oracle or a memo on their own.
- No executor/instrument output was read; no sibling scratch was used.

## Lane hygiene

Writes: only `.ufo/waves/round-90/K90CriticA/` and this report. No lane file, `scripts/`, `corpus/`,
`.ufo/pins/`, probe or plan was touched. Fixture repos were not created (the probe makes its own under the
scratch). No git mutation. Scratch `/fast/scratch/hyaku/kumitate-r90/K90CriticA/` removed before yield.

## Reproduce

```
bash .ufo/waves/round-90/K90CriticA/driver/score.sh        # scores/*.out, two runs each
bash .ufo/waves/round-90/K90CriticA/driver/summarize.sh     # scores.txt
bash .ufo/waves/round-90/K90CriticA/driver/nonprobe.sh      # np/summary.txt
```

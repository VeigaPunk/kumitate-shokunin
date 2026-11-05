# K89ExecClose — close battery runner v4 (round 89)

Seat: K89ExecClose (executor, leaf). Claim: C1 `receipt-bind` v3 (contract `kumitate-receipt-bind-v3`).
Deliverable: `.ufo/waves/round-89/build/K89ExecClose/run-close.mjs`, sha256
`e1502e18411e0e84e05588200ec84d66bbb3db2dac6612220e53d1bac64bfba0` (`evidence/run-close.sha256`).
Not committed to git (the mutating-git rule forbids it); the file and its evidence sit in the build
dir for the L1 to integrate and commit.

## What v4 does (against round-88 v3)

- Bind-last ordering kept: every case writes its receipt, then the final `scripts/receipt-bind.mjs
  --dir <out> --rev <rev> --lane <lane>` runs over the whole close dir (bind.txt included), then `DONE`.
- `--rev` is mandatory, full-hex, must resolve; echoed as `RUN_CLOSE: REV <rev>` before any case.
- `BIND_CASE` per receipt: the final bind is run a second time with `--json`, and each row prints as
  `RUN_CLOSE: BIND_CASE <file> <MATCH|MISMATCH|UNCHECKED>`. The text-mode verdict and the JSON tallies
  must agree (`BIND_JSON_TALLY_MISMATCH` otherwise).
- The frozen probe `probe89-c1.mjs` runs twice (`probe1`, `probe2`). The runner prints both
  `C89_C1:` lines and `PROBE_DETERMINISM SAME|DIFFERENT`; a difference fails the run.
- The twin uses round-88's committed `make-worktree-variant.mjs` (round 89 ships none); kill
  threshold is 30/30 (`KILL_RULE_FIRED`).
- Writes only into `--out` (the close dir on argv) and `--work`; runs with cwd = the lane root.
- Exit 0 requires: bind counted every other receipt (`BIND_CASE … ALL`), final bind CLEAN with
  matched = cases, the probe pair identical, the JSON tallies agree, and no worktree instrument
  changed. Exit 3 refuses before anything is written; exit 64 is usage.

## Evidence (all exits as observed)

Scratch lane: `git clone` of the fleet lane into `$HYAKU_SCRATCH/kumitate-r89/K89ExecClose/lane`;
`rev-parse --show-toplevel` equal to it before the runs; clean worktree. Scratch removed after the
receipts were copied (below). No git mutation was run in the lane or the scratch lane.

**A. Judged at the stated base `a5d2503`: refused.**
`evidence/transcript-a-base-a5d2503-refused.txt`
```
RUN_CLOSE: REV a5d2503393fc5646acb6468888d8b12a445bf62d
RUN_CLOSE: REFUSED INSTRUMENT_UNRESOLVED a5d2503393fc5646acb6468888d8b12a445bf62d:.ufo/waves/round-89/probe/probe89-c1.mjs
exit=3
```
The frozen probe is not in `a5d2503`; it landed in the freeze commit `adfc2f5`. The runner judges every
lane instrument at REV, so it correctly refuses rather than digest a file that REV does not carry.
The runner therefore cannot produce a transcript at `a5d2503` by design. The spec's acceptance
asks for a run "at rev a5d2503"; I proved it at the two revs that do carry the probe (B, C).

**B. Judged at `9c3b64e4` (lane tip; probe and v2 instrument present): DONE OK, exit 0.**
`evidence/transcript-b-tip-9c3b64e4.txt`, receipts in `evidence/close-tip-9c3b64e4/` (14 files).
```
RUN_CLOSE: REV 9c3b64e44024869937a827d588fe1b75e6692ef7
probe1: exit=1 C89_C1: UNMET held=26/30
probe2: exit=1 C89_C1: UNMET held=26/30
twin: exit=1 C89_C1: UNMET held=14/30
bind: exit=0 RECEIPT_BIND: CLEAN matched=13 mismatched=0 unchecked=0 external=1
RUN_CLOSE: BIND_CASE RECEIPT_BIND: CLEAN matched=13 mismatched=0 unchecked=0 external=1 counted=13 others=13 ALL
RUN_CLOSE: PROBE1 C89_C1: UNMET held=26/30 exit=1
RUN_CLOSE: PROBE2 C89_C1: UNMET held=26/30 exit=1
RUN_CLOSE: PROBE_DETERMINISM SAME
RUN_CLOSE: TWIN C89_C1: UNMET held=14/30 exit=1
RUN_CLOSE: BIND RECEIPT_BIND: CLEAN matched=14 mismatched=0 unchecked=0 external=1 exit=0
RUN_CLOSE: BIND_CASE <14 files> MATCH   (14 lines)
RUN_CLOSE: BIND_JSON verdict=CLEAN receipts=14 matched=14 mismatched=0 unchecked=0 external=1
RUN_CLOSE: DONE cases=14 rev=9c3b64e4… out=… bind_exit=0 OK
```

**C. Judged at `adfc2f5` (freeze commit, first rev carrying the frozen probe): DONE OK, exit 0.**
`evidence/transcript-c-freeze-adfc2f5.txt`, receipts in `evidence/close-freeze-adfc2f5/`. Same
structure and the same lines as B, with `REV adfc2f55…`. The instrument and probe bytes at
`adfc2f5` and `9c3b64e4` are identical (`git diff --stat` empty over `scripts/`,
`.ufo/waves/round-88/controls/`, `.ufo/waves/round-89/probe/`), so the worktree-equality preflight passes
at both.

**Probe determinism.** Both runs printed identical `C89_C1:` lines (`UNMET held=26/30`), identical
exits, and the same FAIL arm set in each: `clean-r87`, `alias-proc-root`, `bom-rev`, `symlink-instrument`
(the arm lines differ only in run-time nonces; `PROBE_DETERMINISM SAME` compares the line and exit).

**Evidence that the scratch score is not a verdict on the instrument.** `evidence/clean-r87-*.txt`:
the `clean-r87` arm copies the round-87 close receipts (minus `census.txt`). One of them, `c1-probe.txt`,
names the probe by absolute path under the REAL lane
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/probe/probe87-c1.mjs`.
- Against the real lane path: `RECEIPT_BIND: CLEAN matched=11 mismatched=0 unchecked=0 external=0`
  (the arm's `external=0` expectation holds).
- Against the scratch clone path: `RECEIPT_BIND: CLEAN matched=11 mismatched=0 unchecked=0 external=1`
  (the probe is outside the scratch lane, so it counts as external and the arm fails).
So the 26/30 in B and C is 27/30 (the do-nothing v2 control, `controls/table.txt`) minus this
location artefact. The three genuine v2 failures (`alias-proc-root`, `bom-rev`, `symlink-instrument`)
match the table.

## Findings (for the L1; nothing edited)

1. **Probe defect: `clean-r87` is location-dependent.** Its expected `external=0` only holds when the
   lane path is the real lane (or any path that contains the absolute round-87 probe path). A correct
   instrument run in a scratch copy reads 26/30 and the arm reads FAIL. The verdict must be read at the
   real lane path. Reported, not edited (probe frozen).
2. **`ready` and `plan` in a scratch copy are location-bound or gate-state bound, not runner defects.**
   `ready-handoff` reads `DISPATCH_OUTSIDE` because `--policy`/dispatch absolute paths name the fleet root;
   `plan-before-ready` reads `MAP_DRIFT` (`uncovered:lessons/round-88-verifier-spotcheck.md`) and
   `proxy-check --strict` reads `DRIFT` (A_wave, C2, AXES coverage) at both revs. The L1's integration
   must bring these to MATCH/CLEAN at M (harm rules H1, H3); the runner reports them honestly.
3. **The real lane worktree is not at tip.** `scripts/receipt-bind.mjs` is modified in the lane
   (`M`, sha256 `70dbcd5d…`, not the tip's blob). Running the runner there with `--rev <HEAD>` would
   refuse `WORKTREE_DIFFERS`. Other sibling modifications are also present (`.ufo/pins/*.json`, `SKILL.md`,
   `corpus/README.md`, `corpus/SOURCES.md`); I did not touch them.
4. **The runner's exit does not gate on C1.** It is kill-rule visibility: exit 0 means the battery is
   honest, not that C1 is HELD. The C1 verdict is the `C89_C1:` line.
5. **Child cases write nothing into the lane.** `git status --porcelain` in the scratch lane after all
   runs was empty.

## Checks for the main agent (after integration, at M, in the real lane)

- `node .ufo/waves/round-89/run-close.mjs --lane . --rev <M> --out .ufo/waves/round-89/close --work <scratch>`
  (the `--out` dir must not exist; the runner refuses otherwise). Expect `RUN_CLOSE: DONE … OK`,
  `PROBE_DETERMINISM SAME`, one `BIND_CASE` per receipt, and the bind-last `BIND` line.
- The `C89_C1:` verdict is the only C1 evidence; expect `HELD held=30/30` only if the candidate passes all
  30 arms at the real lane path.

## Tools

None installed or upgraded. `node`, `git`, `bash` were used as present on the host.

## Limits

- No git commit of the runner or transcripts (rule). Evidence is in the build dir with sha256s.
- `a5d2503` cannot be proved (the probe is absent there; the runner refuses honestly).
- No fresh run in the real lane (the seat must not write there); the real-lane verdicts are the L1's.

# K88ExecClose — round-88 close runner v3

Seat: executor, leaf. Nothing committed and no subagent used. Scratch `/fast/scratch/hyaku/kumitate-r88/K88ExecClose` was removed before yield. I installed no tools.

## Files changed (write scope only)

- `.ufo/waves/round-88/build/K88ExecClose/run-close.mjs`: the round-88 close runner v3, derived from `.ufo/waves/round-87/build/K87ExecClose/run-close.mjs`. sha256 `808840ee7dd1f36cbc330b2c4b8457f226c66c214c0f02702d405470210c7a82`.
- `.ufo/waves/round-88/build/K88ExecClose/emitted/*.txt`: the 13 receipts the runner emitted from the scratch clone at `0ff3562f…`. They were copied from scratch `out2`.
- `.ufo/waves/round-88/build/K88ExecClose/evidence/*.txt`: the evidence receipts listed below.
- This report.

## Behaviour (v3 vs v2)

- **Round 88.** The cases run in this order: `selftest, proxy, proxy-selftest, map, map-selftest, spotcheck, ready, plan, census, bind-selftest, c1-probe, twin, bind`. That is every case the round-87 runner ran, with the round number set to 88, plus `twin`. `bind` now runs last.
- **Where `tool_sha256=` comes from.** It is the digest of the case's own `cmd=` token 2. For lane-relative or lane-absolute paths it is read from `git cat-file blob REV:<rel>`, not from the worktree. An absolute token outside the lane is external: it is hashed from disk and `receipt-bind` counts it as `external=` (this is `census`).
- **Refusals, before anything is written.** The runner exits 3, creates no out dir or work dir and writes no receipt when it hits any of these:
  - `REV_NOT_FULL`, `OUT_EXISTS`, `LANE_UNREADABLE`
  - `LANE_NOT_GIT`: `--lane` is not its own git toplevel
  - `REV_UNRESOLVED`
  - `ESCAPES_LANE`: a relative token resolves outside the lane
  - `INSTRUMENT_UNRESOLVED`: a lane instrument is absent at REV
  - `INSTRUMENT_UNREADABLE`: an external instrument is missing
  - `WORKTREE_DIFFERS`: the worktree bytes of any lane instrument the run executes differ from REV, or are absent. This includes the twin generator `controls/make-worktree-variant.mjs` and the twin source `scripts/receipt-bind.mjs`.
- **`twin`.** The runner writes the REV bytes of `scripts/receipt-bind.mjs` into `<work>/twin/` and runs the frozen generator on them. It then runs the frozen probe with `--tool <twin>`.
  - The receipt's `cmd=` names the probe, and `tool_sha256=` is the probe's digest at REV.
  - The extra line `twin_sha256=` comes right after `cmd=`, followed by the generator's output line.
  - The runner prints `KILL_RULE_FIRED` if the twin reads `held=20/20`.
- **`bind` last (fixes K87-V1).** `bind` runs `scripts/receipt-bind.mjs --dir <out> --rev REV --lane <lane>` after every other receipt exists. The runner checks that `matched+mismatched+unchecked` equals cases−1 and prints `BIND_CASE … counted=N others=N ALL|SHORT`. A final receipt-bind over all of `<out>` (bind.txt included) is printed but not written.
- **Exit codes.** Exit 0 needs three things: bind counted every other receipt, the final bind is CLEAN with `matched=13`, and no lane instrument changed during the run (re-checked after the cases). Otherwise it exits 1; refusals exit 3 and usage errors 64.

## Acceptance evidence (all exits as observed)

| check | receipt | result |
|---|---|---|
| runner on `git clone --shared` checked out at `0ff3562f15c18d0ca01dc6a76c9f827d30c26950`, `--out $S/out2` | `build/K88ExecClose/evidence/run-transcript.txt` | exit=0, `RUN_CLOSE: DONE cases=13 … OK` |
| bind case counts every other receipt | `emitted/bind.txt` | `CLEAN matched=12 mismatched=0 unchecked=0 external=1`; runner prints `counted=12 others=12 ALL` |
| `node scripts/receipt-bind.mjs --dir <out2> --rev 0ff3562f… --lane <clone>` | `evidence/accept-bind-out2.txt` | exit=0 `RECEIPT_BIND: CLEAN matched=13 mismatched=0 unchecked=0 external=1` |
| same over the copied `build/K88ExecClose/emitted/` | `evidence/accept-bind-emitted-copy.txt` | exit=0 `CLEAN matched=13 mismatched=0 unchecked=0 external=1` |
| first run (`--out $S/out`, same result) | `evidence/accept-bind.txt` | exit=0 `CLEAN matched=13 … external=1` |
| dirty gate instrument (`scripts/readme-map.mjs` appended) | `evidence/refuse-dirty-gate.txt` | exit=3 `REFUSED WORKTREE_DIFFERS scripts/readme-map.mjs …`; out and work dirs absent |
| dirty twin generator | `evidence/refuse-dirty-twin-gen.txt` | exit=3 `WORKTREE_DIFFERS .ufo/waves/round-88/controls/make-worktree-variant.mjs` |
| dirty frozen probe | `evidence/refuse-dirty-probe.txt` | exit=3 `WORKTREE_DIFFERS .ufo/waves/round-88/probe/probe88-c1.mjs` |
| instrument deleted from worktree (`scripts/proxy-check.mjs`) | `evidence/refuse-missing.txt` | exit=3 `WORKTREE_DIFFERS scripts/proxy-check.mjs` |

After each dirty demo the clone was restored (`git -C <clone> checkout -- <file>`, with the toplevel asserted first), and `status --short` showed 0 lines.

## Findings the L1 needs

1. **The frozen probe cannot read 20/20 from a clone; it does at the real lane path.** In the clone, `c1-probe` reads `C88_C1: UNMET held=19/20`. The only failing arm is `clean-r87`, which shows `CLEAN matched=11 … external=1` where the arm requires `external=0` (probe line 188). The cause is that the round-87 `close/c1-probe.txt` names its probe by the absolute path `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/probe/probe87-c1.mjs`. Under a clone `--lane` that path is outside the lane, so it counts as external.
   - Against the real lane at the same REV, `evidence/probe-real-lane.txt` reads exit=0 `C88_C1: HELD held=20/20`, with `clean-r87: PASS … external=0`. The worktree matched REV for `scripts/receipt-bind.mjs` and the probe (`git diff --quiet` → equal).
   - Consequence: the C1 measurement at M is valid only with `--lane /home/vgpnk/Projects/shokunin/kumitate-shokunin`. Any replay from a clone scores 19/20 by construction. This is a portability limit of the frozen probe and should be disclosed; the probe was not edited.
2. **The worktree twin stays below 20/20.**
   - Clone: `emitted/twin.txt` reads `UNMET held=11/20`, `twin_sha256=bbe4a196c546aa0a45b3ff52de8d0677332f3678499f15e6f21d406f35db999d`.
   - Real lane: `evidence/twin-real-lane.txt` reads exit=1 `UNMET held=11/20`, same twin sha.
   - The twin fails `selftest` (36/39), `clean-r87`, `rev-receipt-wins`, `worktree-forgery`, `default-rev`, `untracked-instrument`, and the positive sub-runs of `symlink-dir`, `oversize` and `duplicate-field`. The kill rule did not fire for the twin.
3. **`proxy --strict` reads DRIFT at `0ff3562f` (exit=1, `emitted/proxy.txt`).**
   - `GATE_PIN_DRIFT pin.receipt-bind declared=b640ff31… computed=098a6713…`: the v2 integration did not re-pin.
   - `A_wave` 1012→1016.
   - `C2` 222→223.
   - The L1 must re-pin and refresh the declared values before M, or the close `proxy` receipt will be red.
4. **`ready` exit=2 `READY_ABSENT` and `plan` exit=2 (`na=1`) in the clone.** `.ufo/waves/round-88/w1.ready` is untracked in the lane, so it is absent at `0ff3562f`. At M these depend on the committed marker.
5. **`census` exit=0** (`kumitate ok …/corpus/SOURCES.md`). This is fleet-root validation of the real lane, not of the clone.
6. **The lane worktree is currently dirty from other seats** (`M corpus/SOURCES.md`, `M .ufo/pins/source-captures.json`, untracked `open/*.html`). None of these are runner instruments, so they would not trip `WORKTREE_DIFFERS`. Any lane instrument edit left uncommitted at M will trip it: the runner refuses and the L1 must commit first.

## Risks

- A case whose own output contains a line starting `rev=`, `cmd=` or `tool_sha256=` would make its receipt `FAIL-CLOSED AMBIGUOUS_FIELD`. None of the 13 cases did at `0ff3562f`. The runner does not rewrite output, so this would surface as red rather than be hidden.
- The worktree-vs-REV equality is checked before the run and again after it; a change that is made and then reverted during the run is not detected.
- For L1 use at M: `node .ufo/waves/round-88/build/K88ExecClose/run-close.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --rev <M> --out .ufo/waves/round-88/close --work <scratch>`. It refuses with exit 3 if `close/` already exists.

## Checks for the L1/main to run
- Run the runner at M against the real lane path, then `receipt-bind --dir .ufo/waves/round-88/close --rev <M> --lane <lane>`.
- Run census validate.
- Re-pin `pin.receipt-bind` and refresh the `proxy` values.

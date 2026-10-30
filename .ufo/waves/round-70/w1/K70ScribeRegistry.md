# K70ScribeRegistry — round-70 C1 operability: draft SKILL registry row for `control-replay`

Seat: K70ScribeRegistry (scribe, leaf). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Base B 78b98d762ccf3e3a0961f94c4042eaabd2bcb706. Frozen plan 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a. Predicate: `.ufo/waves/round-70/probe/replay70-probe.mjs`, sha256 `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1` (matches `counter-pins.json` pin `replay70-probe`; unchanged by this seat).

Scope: draft the exact SKILL gate-registry row for `control-replay`, choose its kind from behavior, and return a draft in this private report. No production file was edited, no tool was run against the tool (it does not exist yet), no outcome is asserted as observed for the unbuilt script.

## Verdict

1. **Kind = `gate`.** Exit 1 is a real defect in the replay surface; the exit map is 0/1/2/64 with no child-code passthrough. It is not `runner` (cap-run passes its child's code through), not `probe` (no run-to-run agreement), not `demo` (it has an exit-1 arm), not `helper` (it is a CLI).
2. **Name cell must be the bare word `control-replay`** in SKILL.md and in the SCORECARD capability row. The frozen counter R10 tests the substring `| control-replay |`. A backticked name fails R10. I confirmed the draft row contains that substring (see Commands).
3. **Exit map:** 0 `CONTROL_REPLAY: CLEAN` (replay reproduced the frozen expectation); 1 `DRIFT` (receipt label or exit mismatch, round-69 receipt digest changed, frozen source bytes differ, scrub check failed, work child not reclaimed); 2 `FAIL-CLOSED` (lane/work unreadable, git/fixture/mkdtemp failure, `--out` exists, child cannot spawn or writes no receipt, including a live `forgecapture` network failure); 64 usage.
4. **Counter-compatibility arms** the row and script must satisfy are listed in the draft (R2 column-0 selftest line; R3–R7 `--out` must contain the label and `CONTROL-PASS <mode>`; `--work` must exist and be empty afterward; R8 `--family junk` → 64; R9 existing `--out` → nonzero and untouched).
5. **Frozen-counter limits, observed in the attack report F2–F4 and reproduced in the design:** the counter's HELD is a text predicate. A non-executing stub that writes the expected receipt text reaches 10/10. The live forgecapture arm is only printed (`live=`), never required. Round-69 receipt preservation is checked against the scored commit's own files. The row must not claim control execution, forgery resistance, or live-arm exercise. This matches the plan's "limits disclosed, predicate not amended after scoring".

## Draft (full text in build)

Artifact: `.ufo/waves/round-70/build/K70ScribeRegistry/control-replay-registry-row.md` (sections: SKILL row, SCORECARD companion row, count paragraph, exit table, kind rationale, pin sequence).

Gate row (insert as last row of the §Gate registry table, after `routed-ledger`, SKILL.md line 638):

```
| control-replay | gate | `node scripts/control-replay.mjs --lane <dir> --family c1\|c2 --mode donothing\|autoledger\|autoorigin\|forgecapture --out <new-file> --work <existing-dir>` → `CONTROL_REPLAY: CLEAN\|DRIFT\|FAIL-CLOSED` (0 clean · 1 a real defect · 2 fail-closed · 64 usage), contract `kumitate-control-replay-v1`; … | `--selftest` (hermetic `mkdtemp` fixtures with synthetic controls only; `CONTROL_REPLAY_SELFTEST: PASS (n/n)` + `VERDICT: PASS`, exit 0; never executes the originals) | `.ufo/pins/counter-pins.json` entry for `scripts/control-replay.mjs`; frozen source sha256 c1 `01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12`, c2 `679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4`; `pin.control-replay` in `kumitate-gate-pins-v1`; predicate `.ufo/waves/round-70/probe/replay70-probe.mjs` |
```

The full row (with the complete description cell) is in the build artifact; the description cell names the five modes per family, the private-copy transform (LANE/PROBE/W/S substituted once, the unused `/tmp/forge-sed.txt` write at c2 line 80 removed, git environment scrubbed, explicit `git -C`), the exclusive `--out`, the single `mkdtemp` child, and the rule that a network-failed live arm is FAIL-CLOSED and never CLEAN.

SCORECARD companion row (bare name, matching `counter-pins` / `routed-ledger` rows around SCORECARD.md line 1795) and a round-70 count paragraph (after landing: 26 gate rows over 25 gate files, expected from current arithmetic, not observed) are in the artifact.

## Observed commands and outcomes (all run in this seat)

- `read /home/vgpnk/.omp/agent/RULES.md` — read first; no install, update or pacman was needed for this draft.
- `read .ufo/waves/round-70/plan.md` — C1 contract, counter, freeze, close sequence.
- `read .ufo/waves/round-70/probe/replay70-probe.mjs` — frozen counter, read only.
- `sha256sum .ufo/waves/round-70/probe/replay70-probe.mjs` → `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1`; matches `.ufo/pins/counter-pins.json` `replay70-probe`.
- `cat .ufo/waves/round-70/base/replay70-base.txt` → `REPLAY70_UNMET held=2/10 checks=10 rev=78b98d… rule=R70 live=no-live(vacuous-declared)`; R1 PASS, R9 PASS, others MISS, exit 1.
- `cat .ufo/waves/round-70/base/freeze-map.txt` → `README_MAP: CLEAN files=169 rows=169 covered=169`, exit 0.
- `git -C <lane> rev-parse --show-toplevel` → `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (lane confirmed, read only).
- `git -C <lane> show 78b98d…:.ufo/waves/round-69/probe/c1-controls.sh | sha256sum` → `01efd6dd…56aeda12`; `c2-controls.sh` → `679b7d96…66f4`. Both equal the working-tree hashes. Originals were read (`read`) and `grep`'d, not executed.
- `grep -c '^| [^|]* | gate |' SKILL.md` → `25`; `grep -c '^| plan-before-ready' SKILL.md` → `2`.
- `grep -n '^| [^|]* | \(probe\|runner\|helper\|demo\) |' SKILL.md` → counter-rerun probe (621), cap-run runner (618), cap-spawn helper (623), jj-seat-demo demo (637); used to confirm the kind vocabulary.
- `read scripts/counter-pins.mjs` (header 1–52) — exit map and selftest format convention (`*_SELFTEST: PASS (n/n)` + `VERDICT: PASS`), registry format.
- `read .ufo/waves/round-69/probe/c1-controls.sh` — read only, not executed. Confirms the wrapper prints `CONTROL-PASS <mode>` only on `LEDGER69_UNMET* && RC=1`, which the counter's `--out` text check depends on.
- `grep -n 'forge-sed\|^W=\|^S=\|^LANE=\|^PROBE=' .ufo/waves/round-69/probe/c2-controls.sh` → fixed `W` (line 24), fixed `S` (25), fixed `LANE` (22), fixed `PROBE` (23 `deprec69-probe.mjs`), and `printf … > /tmp/forge-sed.txt` at line 80, confirming the unused fixed temp write.
- `grep -rl 'control-replay' …` (excluding round-70) → only `LOG.md:2340`, the claim line. No existing `control-replay` row in SKILL.md or SCORECARD.md.
- Draft row substring check (`node -e` on the build file): `ROW_FOUND true`, `SUBSTR true` (`| control-replay |` present), `ROW_LEN 1562`; SCORECARD companion prefix present (`SC_SUBSTR_OK true`). These are checks on my draft text only, not on any tool.

Not run: the tool (does not exist), the frozen counter against a candidate, any fixture, any selftest, any c1/c2 original.

## Scratch, fixtures, tooling, lane integrity

- No scratch directory was created (`/fast/scratch/hyaku/kumitate-r70/K70ScribeRegistry/` absent; no fixture built).
- No install, update, or pacman transaction. Tool versions not recorded because none was invoked beyond coreutils/grep/`node -e` for string checks; `node` and `git` were already present.
- No git mutation in lane or fleet; no commit; no push; no `agent://all`; no task or background job; no subagent.
- Production files not written. Only writes: this report and `.ufo/waves/round-70/build/K70ScribeRegistry/control-replay-registry-row.md`.

## Open decisions for L1 (not decided by this seat)

1. Frozen-source byte mismatch: draft uses exit 1 DRIFT (source-capture convention); alternative is exit 2.
2. Existing `--out`: draft uses exit 2 (exclusive create refused, io-type refusal); R9 accepts any nonzero.
3. Missing or absent `--work`: draft says exit 2; usage (64) is an alternative for a missing flag.
4. The R10 pin is self-authenticating (attack F5): the `counter-pins.json` entry must be added in the same scored commit, so the pin proves self-consistency, not provenance. Disclose in SCORECARD/LOG.

## Checks for the main agent (after the tool lands; none run here)

1. `node scripts/control-replay.mjs --selftest` → exit 0, `CONTROL_REPLAY_SELFTEST: PASS` at column 0.
2. Confirm the private copy contains no `/tmp/forge-sed.txt`, and no fixed `W`/`S`/`LANE`/`PROBE` assignment other than the single substituted one (counter does not check this; attack F8).
3. Run the frozen counter once against the candidate; record `live=` honestly; expect HELD only as a text-predicate result, not as proof that controls ran.
4. Add the SKILL row, SCORECARD row, `pin.control-replay`, and the `counter-pins.json` entry in the same commit, and check the row count paragraph.
5. Disclose the frozen-counter limits (attack F2–F4) in SCORECARD/LOG without amending the predicate.

## Findings summary

- The draft row is ready to insert; kind `gate`; bare name; exit map 0/1/2/64; selftest contract explicit.
- The frozen counter cannot distinguish a real replay from a text stub (attack F2). The row must describe `CLEAN` as "replay matched the frozen expectation", not as proof the control executed.
- This seat did not re-run the frozen counter or any sibling attack; F2–F9 are cited from K70AttackPrintStub, not re-observed here.

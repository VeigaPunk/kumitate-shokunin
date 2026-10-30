# K70ScoutSource217 — S217 frontier scout (round 70, C1 operability)

Seat: K70ScoutSource217 (scout, leaf, no subagent dispatch). Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Base B: 78b98d762ccf3e3a0961f94c4042eaabd2bcb706 (`round-69 verifier spot-check`). Frozen plan: `.ufo/waves/round-70/plan.md`, plan sha 3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a per orchestrator.

Axes named: (a) operability of the replay repair, judged axis; (b) source fidelity (quotes reproduce at B); (c) scope minimality (no production edit, no frozen-byte change).

## Frozen source at B (observed)

Source: `.ufo/waves/round-69/probe/c2-controls.sh`, read only via `git show 78b98d76…:<path>` into private scratch. Not executed.

- blob sha256 `679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4`, 119 lines.
- Working-tree file in the lane has the same sha256 (`sha256sum` run). Frozen bytes unchanged.
- Per `corpus/lessons/round-70.md` Gate: line 24 `W=` and line 80 temporary write. Both confirmed verbatim.

Locator quotes (≤25 words each):

1. Fixed output assignment, line 24: `W="$LANE/.ufo/waves/round-69/controls"`
2. Unused fixed temporary write, line 80: `printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt`

Verification of "unused": `grep -n forge-sed` over the whole file returns one hit (line 80). Nothing reads `/tmp/forge-sed.txt` later in the script or in the probe. Since `/tmp/forge-sed.txt` does not exist on this host (`ls` → no such file), the write has not been observed on this host; removing it is safe by source reading only.

Other lane-bound/fixed items in the same file (for the generator's substitution list):

| line | content (abridged) | note |
|---|---|---|
| 22 | `LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin` | fixed lane |
| 23 | `PROBE="$LANE/.ufo/waves/round-69/probe/deprec69-probe.mjs"` | fixed probe path |
| 24 | `W="$LANE/.ufo/waves/round-69/controls"` | fixed receipt dir (frozen) |
| 25 | `S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/c2-controls-$MODE"` | env-dependent, not per-run unique |
| 27 | `git -C "$LANE" archive 14057f3e3899180c95713bace088fb9c0d0046e3 \| tar -x …` | archives **14057f3e**, not B 78b98d76 |
| 80 | `… > /tmp/forge-sed.txt` | unused fixed temp write |
| 106 | `TMPDIR="${HYAKU_SCRATCH:-…}/kumitate-r69" node "$PROBE" … > "$W/c2-$MODE.txt"` | fixed TMPDIR and fixed receipt target |
| 108 | `>> "$W/c2-$MODE.txt"` | fixed receipt append |

Observation (not a finding against the predicate): the frozen c2 fixture is built from `14057f3e`, while the plan's base is B `78b98d76`. The successor generator must keep the frozen counter's own fixture logic; it must not silently substitute B for 14057f3e in the archive step. Flag for L1 when wiring the generator.

## Proposed S217 registry row (own-work, tier A, scope-bound) — NOT written

Not written to `corpus/SOURCES.md` (production file, L1-only). L1 may append after integration.

`| S217 | round-69 frozen C2 control, .ufo/waves/round-69/probe/c2-controls.sh at B 78b98d762ccf3e3a0961f94c4042eaabd2bcb706 — own-work: opened read-only via git show on 2026-10-30 (blob sha256 679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4) | own-work | A | the fixed-output assignment (line 24) and the unused fixed temporary write (line 80) that a private successor must replace; scope: this one script, not the counter | :22–25, :27, :80, :106 @ 78b98d76 | W="$LANE/.ufo/waves/round-69/controls" (:24); printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt (:80) | mined | 2026-10-30 | — | corpus/lessons/round-70.md (Gate, Mistakes); .ufo/waves/round-70/plan.md:27 |`

Tier reasoning: own-work source, tier A only for its own text (what the script does at a pinned blob), not for the behaviour of the replay counter. No external authority inferred; no community/tier-C row. QUALITY tier rule: "community is never tier A" is not engaged (own-work).

Row cells (11) match the header `id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by`. `recheck` is `—` because the frozen blob is immutable at B.

## Lesson used-by (proposed)

- `corpus/lessons/round-70.md` Gate (line 5) already names this source and both lines; Mistakes item 2 names line 80. Already consistent with the observed bytes.
- Precedent: `.ufo/waves/round-69/build/K69ReviewBaseReceipts/c2-controls-safety-adapter.sh` at B, line 83 writes the same temporary file to `"$S/forge-sed.txt"` (private scratch, not `/tmp`). This is the only observed private-path form of the same line; a useful precedent for the successor's private-temp rule. Not an authority for the counter.
- Implementation consumer (not yet present in the lane): `scripts/control-replay.mjs` per plan "Implementation contract". Its generator must: (a) substitute LANE/PROBE/W/S exactly once each; (b) remove the line-80 write; (c) rewrite line 106 TMPDIR and the receipt target into the private work dir; (d) rewrite line 27 with explicit fixture-root git; (e) refuse unexpected source bytes (sha 679b7d96…). Item (e) is what makes the S217 pin load-bearing.

## Sibling cross-check (read-only, by grep of their reports; not re-judged)

- `K70AttackSourceDrift.md` lines 21, 23, 36, 50, 70: the naive first-match generator accepts an unquoted `W=` or `/var/tmp` retarget silently; fail-closed generator refuses. Matches this scout's item (e).
- `K70AttackPrintStub.md` line 60: line-80 removal is not checked by the counter. Matches "unused temporary write" claim above.
- `K70AttackReceiptOverwrite.md` lines 15–16: `--lane` resolves to the live lane, so the W write is real. Matches line 24.

## Commands and observed outcomes

1. `mkdir -p /fast/scratch/hyaku/kumitate-r70/K70ScoutSource217` → directory created (verified by `ls -ld`, owner vgpnk, 12:19).
2. `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse --show-toplevel` → `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (lane root confirmed; no mutation).
3. `git -C <lane> ls-tree -r --name-only 78b98d76… | grep -i c2-controls` → `.ufo/waves/round-69/build/K69ReviewBaseReceipts/c2-controls-safety-adapter.sh`, `.ufo/waves/round-69/probe/c2-controls.sh`.
4. `git -C <lane> show 78b98d76…:.ufo/waves/round-69/probe/c2-controls.sh > scratch/c2-controls.B.sh` → 119 lines, sha256 `679b7d96…66f4`.
5. `grep -n` over the B copy for `forge-sed`, `/tmp`, `round-69/controls`, `HYAKU_SCRATCH`, `TMPDIR` → lines 24, 25, 80, 106 as tabulated.
6. `git -C <lane> show 78b98d76…:.ufo/waves/round-69/build/K69ReviewBaseReceipts/c2-controls-safety-adapter.sh | sed -n` (read-only) → precedent at line 83 (`"$S/forge-sed.txt"`); its archive step pins `14057f3e` (the same pin as frozen c2 line 27), seen in the 20–30 window of that print.
7. `git -C <lane> cat-file -t 14057f3e…` → `commit` (exists).
8. `git -C <lane> show 78b98d76…:corpus/SOURCES.md | grep -c '^| S[0-9]'` → 155 rows at B; highest id S216; `grep -c S217` → 0 at B. Census before: 155 rows, next free id S217. Census after: unchanged (no write to SOURCES).
9. `sha256sum` of the working-tree `c2-controls.sh` → `679b7d96…66f4` (equal to B blob).
10. `sha256sum corpus/SOURCES.md` at lane working tree → `ed345143…10f4f3` (recorded; not modified).
11. `ls -ld /tmp/forge-sed.txt` → "No such file or directory".
12. Read `corpus/lessons/round-70.md` (1834 bytes) and `.ufo/waves/round-70/plan.md`, `base/freeze-map.txt` (`README_MAP: CLEAN files=169 rows=169 covered=169 exit=0`).
13. Wrote `.ufo/waves/round-70/build/K70ScoutSource217/S217-source-extract.txt` (1398 bytes, sha verified above).

Two early bash calls (`K70ScoutScratchMk`, `K70ScoutLocateC2`) returned only process-start text and no stdout; the same checks were re-run as plain calls (item 1–3 above) and returned the stated output. Recorded for honesty; the second run's results are the ones relied on.

No installs or updates performed (no tooling change). Tool versions: none recorded because no tool was installed or upgraded.

Not run: the original `c1-controls.sh` / `c2-controls.sh` (never executed); `deprec69-probe.mjs`; the frozen counter; any fixture commit. No git mutation, no commits, no pushes, no task delegation, no background jobs. `agent://all` not used.

## Remaining unknowns

- Whether the 14057f3e vs B difference matters for R1–R7 is a counter question; not resolved here.
- The `/tmp/forge-sed.txt` write has not been observed on this host; this scout reasons from source only.
- The S217 row and the lesson used-by are proposals; L1 must write and commit them.

## Outputs

- Report: `.ufo/waves/round-70/w1/K70ScoutSource217.md` (this file).
- Build artifact (own dir only): `.ufo/waves/round-70/build/K70ScoutSource217/S217-source-extract.txt`.
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70ScoutSource217/` removed before yield (the B copy held only frozen bytes and is not a receipt).

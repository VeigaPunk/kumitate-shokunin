# Seat K70AttackTmpLiteral — round-70 w1 attack report

Scope (assigned edge): **known c2 hardcoded temporary write removal without changing frozen bytes.**
Candidate checked: `.ufo/waves/round-70/build/K70ExecRunner/control-replay.mjs` — **absent** at
inspection time (only sibling `K70ExecFixtureTests/` existed under `build/`), so per seat spec the
contract/counter was attacked directly. No waiting/polling performed.

Axes named: (1) isolation containment — does the write stay inside a private TMPDIR/work root?
(2) predicate observability — can the frozen counter see whether removal happened? (3) frozen-byte
integrity — does the removal mechanism keep r69 bytes bit-exact under R1? (4) removal minimality —
does removal disturb neighbouring load-bearing lines? (5) shared-namespace safety — fixed-path write
hazards in `/tmp`.

## Ground truth (commands + observed output)

- `grep -n 'forge-sed' .ufo/waves/round-69/probe/c2-controls.sh` →
  `80:    printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt`
  (exactly one occurrence in the file; the plan's "line 80" and lessons `corpus/lessons/round-69.md:39`
  "writes an unused `/tmp/forge-sed.txt` regardless of TMPDIR" both confirmed).
- Lane-wide `grep -rn 'forge-sed'` → only lesson/report/sibling-attack references; **no reader exists**
  in any control, probe, or production script. The write is genuinely dead.
- `sha256sum` of frozen c2 working-tree file = `679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4`,
  equal to `git show 78b98d762ccf3e3a0961f94c4042eaabd2bcb706:.ufo/waves/round-69/probe/c2-controls.sh`
  (frozen == base == worktree before this seat).
- `/tmp/forge-sed.txt` was **absent** before this seat's runs (host had no leftover today).

## Counterexample harness (isolated, runnable)

Location: `.ufo/waves/round-70/build/K70AttackTmpLiteral/harness/` (also the executed receipts under
`receipts/`). Never executed the originals `c1-controls.sh`/`c2-controls.sh`; every execution used a
generated private copy from `harness/make-copy.mjs` — exact-once LANE/PROBE/W/S substitution to
private scratch paths (`--wdir`/`--sdir` under this seat's scratch), optional strip of line 80,
git env scrubbed (`GIT_DIR/WORK_TREE/INDEX_FILE/OBJECT_DIRECTORY/...` unset), fixture git contained
(post-run `git -C $S/fx rev-parse --show-toplevel` == `$S/fx`, observed per case), pinned
`GIT_AUTHOR_DATE/GIT_COMMITTER_DATE` for deterministic fixture rev `b38ab58e…` across cases. The
probe was replaced by a hermetic `probe-stub.mjs` reproducing only the observable deprec69 contract
(first line `DEPREC69_UNMET`, body line `S210:origin-sha-mismatch`, exit 1) so no network and no
frozen counter execution were involved. Orchestrator: `harness/run-all.sh`.

## Findings

### D1 — removal is invisible to the frozen counter (predicate observability gap; tradeoff, not fixable in-counter)

`receipts/invariance.txt`:
```
c169bba08acd2e6d7d0a2c2ee1890aa8aff8fbaaa16d6d49667c747dce6408a8  .../ce1-unstripped/w/c2-forgecapture.txt
c169bba08acd2e6d7d0a2c2ee1890aa8aff8fbaaa16d6d49667c747dce6408a8  .../ce2-stripped/w/c2-forgecapture.txt
receipts: BYTE-IDENTICAL (removal is invisible to the receipt, and to probe checks R3-R7)
```
CE1 (unstripped) and CE2 (stripped) both exit 0 with `CONTROL-PASS forgecapture`, identical fixture
rev, byte-identical receipts. The line-80 write has no receipt surface, so R3–R7 cannot distinguish
a removing candidate from a non-removing one; R2 only regex-matches a `CONTROL_REPLAY_SELFTEST: PASS`
banner and does not inspect selftest finding ids. Consequence: a candidate that skips removal but
prints the banner still scores REPLAY70_HELD 10/10. This is a **disclosed tradeoff of the frozen
counter** (counter bytes are frozen; the plan routes enforcement to contract text + hermetic selftest
finding ids + seat attacks). Smallest safe correction: none inside the counter; candidate selftest
must carry a stable finding id asserting the generated copy lacks the `/tmp/forge-sed.txt` write, and
seat attack reports (this one) supply the external evidence. Do not amend the predicate after scoring.

### D2 — isolation escape + cross-run persistence (why removal is required)

`receipts/ce1-unstripped/summary.txt`: `exit=0 … tmp_forge_sed=present … forge_sed_under_workdir=0`.
The copy ran with `TMPDIR=<private work root>`, yet the 41-byte file appeared in the **shared** `/tmp`
and nothing in the control ever deletes it (`receipts/ce1-unstripped/leak.txt`: mode 644, sha256
`721535c6…`, content `- S207 — capture 2026-10-30 — pinned`). In the first (attribution-broken) run,
CE1's leftover was still present when CE2 observed its window — i.e. **leaks persist across
independent replays** and can contaminate a later seat's selftest. Because the path is absolute, the
probe's own `TMPDIR=private-root` scrub (R7's `env:{...process.env,TMPDIR:root}`) cannot contain it.
Fixable defect class: any replay that keeps the line re-introduces the escape; contract-required
removal is the correct and only complete fix.

### D3 — fixed-path write is a symlink-clobber primitive (shared-namespace safety)

`receipts/ce3-symlink/summary.txt`: with `/tmp/forge-sed.txt` pre-planted as a symlink to a scratch
canary containing `CANARY-ORIGINAL`, the unstripped copy's `printf > /tmp/forge-sed.txt` followed the
symlink: `canary_after=- S207 — capture 2026-10-30 — pinned` (truncated+rewritten). Any operator-
writable file at a predictable path could be clobbered by a forged replay. Symlink removed
immediately after observation (`post: /tmp/forge-sed.txt absent` in `run-all.sh` output). Same
correction as D2: remove the line in the private copy; retargeting (e.g. `/var/tmp`) is the known
mutation (sibling `K70AttackSourceDrift/needle-counterexample.mjs` M3) and does **not** satisfy the
contract.

### D4 — over-removal failure class IS counter-visible (removal minimality, partially defended)

`receipts/ce4-overstrip/summary.txt`: a range-delete remover (`/forge-sed/,/PY/` style) that also eats
the comment and the second heredoc opener leaves bare Python body lines for bash → `exit=2`, receipt
MISSING, `CONTROL-PASS` count 0. The R7-shaped status check catches total breakage. Static
simulation of the subtler variant (drop only the rewrite block, `receipts/semdelta/tree.diff`):
fixture trees differ **only** in `corpus/knowledge/mcp-deprecation-registry.md` — faithful transform
has all seven bullets `capture 2026-10-30 — pinned`; dropped-block tree keeps `2026-10-27` values
with `mirror S214/S215/S216`. In the live forgecapture arm this shifts the M11 receipt body while
the first line stays `DEPREC69_UNMET` — R7's checks could still pass, so this variant leans on the
live network arm ("failure is reported, never waived" per plan). Minimal correct removal is **exactly
line 80**; the generated stripped copy demonstrates it (frozen diff = one deleted line only).

### D5 — frozen-byte guard holds; removal must never touch the frozen path (frozen integrity)

`receipts/r1needle/summary.txt`:
```
frozen_B_sha256=679b7d96…  lane_worktree_sha256=679b7d96…  compare(frozen B, lane worktree)=EQUAL (R1 PASS-shaped today)
compare(tampered 1-byte path change)=DIFFER -> R1 would MISS
compare(line-80 removed in frozen copy)=DIFFER -> R1 would MISS
```
R1's compare (`git show B:path` vs archived tree bytes) catches both a 1-byte tamper and the
line-80 removal if applied to the frozen path. Freeze consequence of this seat: **none** —
`frozen-pre.txt` == `frozen-post.txt` (`679b7d96…`), `git status --porcelain -- .ufo/waves/round-69
scripts` empty (recorded in `receipts/lane-r69-status.txt`).

## Actual defects vs tradeoffs

- Defect (candidate-facing, fixable): any replay that retains line 80 re-opens D2/D3; the contract
  already mandates removal, so this is enforcement surface for candidate review, not a counter change.
- Tradeoff (canonical-judge level, must reject any fix attempt inside the frozen counter): D1 —
  predicate blindness to non-removal. The frozen counter cannot and should not be amended post-hoc;
  honesty is preserved by reporting it here and by the plan's existing "seats attack
  implementation-forgery controls" clause.

## Commands exercised (all observed; unrun = none)

Generation/runs: `node harness/make-copy.mjs --lane <lane> --strip none|line|range …` (per-case
`make-copy.json` recorded), `bash harness/run-case.sh <case> <strip> forgecapture` (summaries above),
`node harness/semantic-delta.mjs`, `bash harness/r1-needle.sh`, orchestrated by
`bash harness/run-all.sh` (full transcript reproduced in this report). Fixture git was created only
inside this seat's scratch with cwd under it; lane git used read-only (`archive`, `show`,
`status`, `ls-tree`). `/tmp` writes were limited to the demonstrated leak/symlink cases and cleaned.

## Tooling record (per RULES.md; no installs)

No installs/updates performed. Used existing system tools only: node v24.21.0 (harness), python
3.14.8 (exercised inside the generated copies' forgecapture heredocs), git 2.56.0, bash, coreutils.
Pacman remained paused; no host service touched; no PATH directories written.

## Boundaries

Originals never executed. No production/fleet/sibling/operator writes; unique artifacts only under
`.ufo/waves/round-70/build/K70AttackTmpLiteral/` and this report. Scratch
`/fast/scratch/hyaku/kumitate-r70/K70AttackTmpLiteral/` deleted after receipts were copied
(verified absent). Sibling artifacts (`K70ExecFixtureTests/fixtures/synth-controls/c2-controls.sh`
with its own `/tmp/r70synth-forge-sed.txt`, `K70AttackSourceDrift/needle-counterexample.mjs`)
observed read-only; they are sibling-private and outside this seat's judgment.

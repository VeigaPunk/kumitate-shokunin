# K70ConnectPatterns — w1 report

- Seat: K70ConnectPatterns (connector, leaf; no subagent dispatch, no background jobs)
- Milestone: ConnectPatterns
- Judged axis: **operability (C1 replay isolation)** — predicate `REPLAY70_HELD`, target 10/10
- Lane artifacts: `build/K70ConnectPatterns/connect-design.md`, `build/K70ConnectPatterns/connect-design.json` (unique to this seat)
- Frozen read, never executed: `.ufo/waves/round-69/probe/c1-controls.sh`, `c2-controls.sh`, `replay70-probe.mjs`; frozen plan `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a`. No production or sibling files touched.

## Axes named

Round axis: operability. Seat working axes: hazard-fidelity (all three named hazards closed
by one mechanism), minimality (one tool, one transform table, one env constructor, embedded
pins), verifiability (each hazard maps to a counter check *and* a counter-independent edge
probe), honesty (misses preserved; no registration overclaim).

## Evidence (commands → observed)

All commands run from fleet root with absolute paths; lane worktree @ `1e00955a`.

1. Frozen bytes pinned and matching:
   `git show 78b98d76:…c1-controls.sh | sha256sum` vs worktree → `01efd6dd…aeda12` both, match=YES;
   c2 → `679b7d96…3a66f4` both, match=YES. Counter sha `63f52b75…bf0c1` matches `.ufo/pins/counter-pins.json`.
2. Hazard lines located in the frozen originals:
   - fixed-output: `W="$LANE/.ufo/waves/round-69/controls"` then `> "$W/<family>-$MODE.txt"` (both files).
   - scratch: `S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/<family>-controls-$MODE"` + `rm -rf "$S"` (both files); inline `TMPDIR="…" node` prefix (both).
   - c2 line 80: `printf '%s\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt` — `grep -n forge-sed` → single hit at line 80; **no reader anywhere in the frozen body** (verified by full read): the write is unused, removal is behaviour-preserving.
3. Exact-once substitution needles verified against frozen bytes (`grep -F -c`): LANE, PROBE, W, S,
   `git init -q`, `git add -A`, the `git -c user.name=ctl … commit -q --no-verify` line,
   `REV=$(git rev-parse HEAD)`, the inline `TMPDIR=… node ` prefix — **all count = 1 in both
   scripts**; c2 `git -C "$LANE" archive 14057f3e…` count = 1.
4. Pattern to reuse: r69 probes' `CHILD_ENV = {PATH, TMPDIR, LANG}` (ledger69-probe.mjs:77,
   deprec69-probe.mjs:87) — the lane-maintained env allow-list.
5. Sibling evidence absorbed: K70AttackGitEnv live demo — exported
   `GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE` reach fixture git writes **despite explicit `-C`**
   (`GIT_INDEX_FILE` has no CLI override; foreign commit landed on the host repo). The frozen
   r70 counter is env-blind in benign runs, so HELD does not by itself evidence the scrub
   clause (their defect A). K70ExecRunner candidate exit map 0/1/64/65/70/73 with block-list
   GIT_* scrub (`GIT_CONFIG_PARAMETERS` not in its list); K70ExecTransform pins
   REFUSE-SOURCE-DRIFT on needle count ≠ 1.
6. Read-only context: `base/replay70-base.txt` (2/10, R9 PASS vacuous at base — tool absent,
   MODULE_NOT_FOUND satisfies `status!==0` without opening the file); `base/freeze-map.txt`
   CLEAN; plan §Controls keeps c2 line 80's frozen bytes as evidence; R3–R7 require receipts
   containing the UNMET label **and** `CONTROL-PASS <mode>`, preserved prior receipt digests,
   and an empty `--work` root.

## Proposed move (one, bounded)

The three named hazards are one shape — the frozen scripts hold **ambient authority over
shared mutable state** (shared receipt dir, shared scratch namespace, caller git
environment). The smallest maintained design is a single mechanism: **run a byte-pinned
private copy of the frozen script inside a unique mkdtemp child, under a constructed
minimal environment, producing exactly one outward artifact created exclusively.**

1. Verify frozen bytes against embedded sha256 pins first; mismatch → exit 65 before any output or fixture work.
2. Generate the versioned private copy: header (version, source sha256) + frozen body with the
   nine common substitutions + c2-only `/tmp/forge-sed.txt` cut — all exact-once, refusal on
   drift (K70ExecTransform convention). Receipt content: prefer the runner appending the
   captured stdout `CONTROL-PASS`/`CONTROL-FAIL` line to the private receipt over the frozen
   tail-rewrite — smaller pinned-needle surface, identical R3–R7 receipt contract.
3. Child env = allow-list `{PATH, TMPDIR=$CHILD/tmp, HOME=$CHILD/home, LANG}` +
   `GIT_CONFIG_NOSYSTEM=1` (extends the r69 CHILD_ENV pattern; a block-list scrub rots and
   is counter-invisible — see evidence 5).
4. `openSync(--out,'wx')` **before** mkdtemp/run; refuse `--out` inside `--work` (64); copy
   receipt out, fsync, reclaim child in `finally` (work root left empty). Exit map
   0/1/64/65/70/73; exit-1 UNMET receipts are delivered as honest misses, never patched.

Full design, JSON contract and per-hazard mapping: `build/K70ConnectPatterns/connect-design.{md,json}`.

## Second-order trace

- **Runtime:** the counter spawns the tool with `{...process.env, TMPDIR:root}` — the tool must
  not forward it (allow-list). Probe per-run timeout 300 s: if `--selftest` executes a real
  control arm, it must fit under R2's 300 s (keep selftest offline or budget it).
- **Contract:** frozen bytes untouched (R1; c2 line 80 preserved in the original per plan); no
  semantic remediation — controls must still reach UNMET.
- **Substrate:** fixture REVs vary per run (commit timestamps) → new receipts byte-unique; fine,
  predicate never pins fixture revs. `forgecapture` stays network-dependent (disclosed: failure
  reported, never waived); proxy-var stripping could perturb a proxied live fetch — disclosed
  limit on this host's direct egress, not a contradiction to fix.
- **Verification:** R1–R10 cannot see a missing scrub in a benign env → the tool's selftest must
  carry the env-poison and pre-existing-out cases or HELD does not evidence those clauses.

## Cross-axis non-harm concern (exactly one)

**R10 registration wording vs the coverage/honesty axis.** R10 greps only for `| control-replay |`
presence in SKILL.md/SCORECARD.md plus a pins row; the plan claims no coverage score and no new
knowledge entry. An overclaiming registration row (general replay runner, implied forgery
resistance) would inflate coverage without evidence while HELD still prints 10/10 — harming
coverage/honesty, adding nothing to operability. Mitigation within scope: registration text
bounded to "replays the five frozen round-69 capability controls in private isolation" with the
live-arm limit quoted. Non-harm: the presence-only grep is satisfied either way.

## Strongest independent edge probes (ranked)

1. **Env-poison containment** (git-env; the counter-blind clause): exported
   GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE + GIT_CONFIG_GLOBAL(hooksPath/templateDir/identity) +
   GIT_CONFIG_COUNT/KEY/VALUE + GIT_AUTHOR_* → assert child-contained commits, hook canary never
   created, host repo HEAD unchanged, receipt + empty-work invariants. Reuse the K70AttackGitEnv
   poison set. Highest signal per cost.
2. **Exclusive-out matrix** (fixed-output; maps R9 exactly): pre-existing regular file,
   symlink→existing, symlink→dangling, out-inside-work, missing parent → refusal exit,
   byte-unchanged target, refusal *before* fixture work (no child created).
3. **Scratch confinement**: HYAKU_SCRATCH garbage/unset (substituted S ignores it), read-only
   TMPDIR parent, umask 077/022, two modes sharing one work root → canaries intact, child reclaimed.
4. **Frozen-byte refusal**: 1-byte flip per frozen file in a fake `--lane` → exit 65, no out created.
5. **Selftest env-isolation**: `--selftest` under poisoned env, `cwd=/` → stable ids + expected exit map.
Not strongest: live-network probes of `forgecapture` (network-dependent by disclosure).
Sibling-covered (no duplication): output-symlink, work-symlink, cleanup-permissions, umask,
timeout/group-kill, cross-root, missing-tools, header-modes, readonly.

## Risks / stated contradictions

- Allow-list env strips proxy vars: could break a proxied live forgecapture fetch — disclosed
  limit; do not "fix" by special-casing proxies.
- Recommended runner-append receipt content diverges from the K70ExecRunner candidate's
  tail-rewrite: both satisfy R3–R7; integrator must pick one and pin it in the selftest map
  (contradiction between minimality and consistency with the existing candidate — stated, not smoothed).
- Base R9 PASS is vacuous (evidence 6): the exclusive-out probe family must therefore test
  ordering, not just exit status.

## Verification performed

- sha256 agreement frozen-vs-worktree for both controls (match=YES ×2); counter pin matches registry.
- grep count = 1 for every substitution needle in both frozen scripts (observed above).
- `forge-sed` single-occurrence/no-reader verified by full read of c2-controls.sh.
- `connect-design.json` parses (`python3 -m json.tool` → JSON-VALID).
- No originals executed; no lane/fleet/sibling/operator writes; no git/jj mutations.

## Tooling record

Read-only inspection only. No installs/updates required or performed (pacman paused per
directive; `uv`/`npx`/official-binary channels unused). Tools used: `read`, `grep` (tool),
`bash` builtins (`sha256sum`, `git show/rev-parse`, `grep -F -c`, `mkdir`, `python3 -m
json.tool`, `ls`), Node v24.21.0 and git 2.56.0 preexisting (versions recorded, no changes).
Scratch `/fast/scratch/hyaku/kumitate-r70/K70ConnectPatterns/` created explicitly, left empty,
removed before yield. No receipts produced (no copies of frozen files taken).

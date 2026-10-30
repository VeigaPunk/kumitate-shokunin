# K70ConnectPatterns — connective replay design (round-70 C1)

Connector seat. Axis: operability (C1 replay isolation). One bounded proposal: the smallest
maintained replay design that remediates the three named hazards with **one** mechanism.

## Axes (named)

- **Round axis:** operability, predicate `REPLAY70_HELD` = 10/10 (base 2/10).
- **Seat working axes:** hazard-fidelity (all three named hazards closed), minimality
  (one mechanism, one tool, one transform table), verifiability (each hazard maps to a
  counter check *and* a counter-independent probe), honesty (misses preserved, no overclaim).

## The three hazards are one hazard

Read frozen (never executed; bytes pinned, sha256 below):

1. **Fixed-output overwrite** — both scripts assign `W="$LANE/.ufo/waves/round-69/controls"`
   and redirect `> "$W/<family>-$MODE.txt"`: every replay truncates the committed receipt in
   the live lane. (Round-69 lesson: replays overwrote two frozen receipts.)
2. **Scratch hardcoding** — `S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/<family>-controls-$MODE"`
   with `rm -rf "$S"` (shared namespace, cross-run/cross-mode collision), inline
   `TMPDIR="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69"`, and in c2 line 80 a fixed
   write `> /tmp/forge-sed.txt` — verified single-occurrence and never read (grep: 1 hit,
   no reader anywhere in the frozen body).
3. **Inherited git-env** — the fixture's `git init/add/commit/rev-parse` run under whatever
   GIT_* / HOME the caller exports. Demonstrated live by seat K70AttackGitEnv: with
   `GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE` exported, explicit fixture-root `-C` args do
   **not** contain the leak (GIT_INDEX_FILE has no command-line override); a foreign commit
   lands on the host repo and the fixture child gets no `.git`.

Unified shape: the frozen scripts hold **ambient authority over shared mutable state**
(shared receipt dir, shared scratch namespace, caller git environment). One mechanism
remediates all three: **run a byte-pinned private copy of the frozen script inside a unique
mkdtemp child, under a constructed minimal environment, producing exactly one outward
artifact created exclusively.**

## Smallest maintained design

`scripts/control-replay.mjs` (contract CLI: `--lane DIR --family c1|c2 --mode MODE
--out NEWFILE --work DIR`; `--selftest`):

1. **Pin + refuse first.** Read frozen bytes from `<lane>/.ufo/waves/round-69/probe/`;
   verify against two embedded sha256 pins
   (c1 `01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12`,
   c2 `679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4` —
   both verified against `git show 78b98d76:…` and the worktree, 2026-10-30).
   Mismatch → exit 65, before any `--out` or fixture work.
2. **Generate the versioned private copy.** Frozen body + a generated header (version,
   source sha256, "do not edit"). Exactly-once substitutions — every needle verified
   count=1 in the frozen bytes (grep table in the round report):
   - `LANE=<lane>` ; `PROBE=<lane>/.ufo/waves/round-69/probe/<probe>` (double-quoted);
   - `W="$CHILD/receipts"` ; `S="$CHILD/scratch/<family>-$MODE"`;
   - inline `TMPDIR="…" node ` prefix → `TMPDIR="$CHILD/tmp" node `;
   - `git init -q` / `git add -A` / `git -c user.name=ctl … commit` / `REV=$(git rev-parse HEAD)`
     → `git -C "$S/fx" …` forms (c2's `git -C "$LANE" archive 14057f…` already explicit);
   - c2 only: cut the `/tmp/forge-sed.txt` write (unused; the frozen original keeps it —
     "scratch-before offending source is preserved at r69 c2 line 80").
   Transform refuses (exit 65, `REFUSE-SOURCE-DRIFT`-style) on any needle count ≠ 1, so
   frozen drift can never produce a half-substituted private copy.
3. **Receipt content without editing the frozen tail.** R3–R7 require the receipt to contain
   the UNMET label *and* `CONTROL-PASS <mode>`. The frozen scripts echo CONTROL-PASS to
   stdout only. Two minimal options: (a) pinned tail rewrite with `tee -a "$W/…"` (the
   K70ExecRunner candidate's choice — an extra ~11-line pinned needle per family);
   (b) leave the tail byte-identical and have the runner append the captured stdout
   CONTROL-PASS/FAIL line to the private receipt before copy-out. **Recommend (b):** smaller
   pinned-needle surface, identical receipt contract. Either satisfies R3–R7; pick one and
   pin it in the selftest expected exit map.
4. **Allow-list child environment.** Bash child env = `{PATH, TMPDIR=$CHILD/tmp,
   HOME=$CHILD/home, LANG}` + `GIT_CONFIG_NOSYSTEM=1`. This is the lane-maintained pattern
   the r69 probes already use (`CHILD_ENV = {PATH, TMPDIR, LANG}` — ledger69 line 77,
   deprec69 line 87) plus one private HOME so global/system gitconfig
   (hooksPath / templateDir / identity) cannot reach the fixture commit. A block-list scrub
   of GIT_* names is the same ambient-authority hazard in miniature: a future git var (or
   `GIT_CONFIG_PARAMETERS`, not in the K70ExecRunner candidate's scrub list) slips through
   and the counter cannot see it (K70AttackGitEnv defect A: in a benign env, scrubbing and
   not scrubbing are byte-identical on every axis R1–R10 measure).
5. **Exclusive outward artifact, refusal before work.** `openSync(out, 'wx')` *before*
   mkdtemp/run; guard `--out` resolving inside `--work` (usage 64 — otherwise the receipt
   is reclaimed with the child or the probe's empty-work check fails). Copy the private
   receipt out, fsync, close; reclaim the child in `finally`, leaving `--work` empty
   (R3–R7 `readdirSync(work).length===0`).
6. **Exit map (pinned in selftest).** 0 control pass; 1 control fail / honest predicate
   MISS (never translated); 64 usage (R8); 65 frozen-source or transform refusal; 70
   internal; 73 exclusive-out conflict (R9). Misses stay misses: a receipt showing
   UNMET-without-CONTROL-PASS is delivered with exit 1, never patched toward HELD.

## One cross-axis non-harm concern

**R10 registration wording vs the coverage/honesty axis.** R10 checks only substring
presence — `skill.includes('| control-replay |') && score.includes('| control-replay |')`
plus a pins row. The plan declares "No coverage score or new knowledge entry is claimed",
and the SCORECARD capabilities table admits rows only for demonstrated capability. Nothing
in R10 can detect a row that *overclaims* — e.g. wording implying a general replay runner
or forgery resistance. An overclaiming registration row would inflate the coverage/honesty
axis while adding zero operability, and the predicate would still print HELD 10/10.
Mitigation (no new scope): the SKILL.md gate row, SCORECARD capability row and pin name
stay bounded to "replays the five frozen round-69 capability controls in private isolation",
and quote the disclosed live-arm limit verbatim. Non-harm: presence-only grep is satisfied
either way; the concern is purely about the words above the minimum.

## Second-order trace

- **Runtime:** the frozen counter spawns the tool with `{...process.env, TMPDIR:root}`;
  the tool must not pass that env through (allow-list in §4). The probe's per-run timeout
  is 300 s; if `--selftest` runs a real control arm (e.g. an exclusive-out case that
  executes c1 donothing), the total must fit under R2's 300 s — budget the selftest cases
  or keep selftest arms offline (bash -n + transform checks + refusal cases only).
- **Contract:** frozen bytes untouched (R1; lesson Gate keeps c2 line 80 in the original);
  substitutions exact-once with drift refusal; no semantic remediation — the controls must
  still reach UNMET, and an UNMET receipt is delivered as a MISS, not "fixed".
- **Substrate:** fixtures commit under the scrubbed env; fixture REVs vary per run
  (commit timestamps) so new receipts are byte-unique per run — fine, the predicate never
  pins fixture revs. The c2 `forgecapture` arm stays network-dependent (plan-disclosed:
  failure is reported, never waived); stripping proxy vars from the child env could perturb
  a proxied live fetch — a disclosed limit on this host's direct egress, not a
  contradiction to fix.
- **Verification:** R1–R10 are env-blind in benign conditions, so the scrub and the
  out-before-work ordering must be evidenced inside the tool's own selftest (env-poison
  and pre-existing-out cases), or HELD does not evidence the contract clauses.

## Strongest independent edge probes (ranked)

1. **Env-poison containment** (git-env; the counter-blind clause). Export
   `GIT_DIR=<host repo> GIT_WORK_TREE=<child> GIT_INDEX_FILE=<outside>
   GIT_CONFIG_GLOBAL=<hooksPath+templateDir+user.name> GIT_CONFIG_COUNT/KEY/VALUE
   GIT_AUTHOR_*`; assert fixture commits inside the child, a hook canary is never created,
   host repo HEAD is unchanged, receipt + empty-work invariants hold. Reuse the poison set
   from `build/K70AttackGitEnv/demo-transcript.txt`. Highest signal per cost (env vars only).
2. **Exclusive-out matrix** (fixed-output; maps R9 exactly). Pre-existing regular file;
   symlink→existing; symlink→dangling; out inside `--work`; missing out parent. Assert
   refusal exit, byte-unchanged target, and that refusal happens *before* fixture work
   (no child created — the ordering gap the base R9 PASS leaves vacuous).
3. **Scratch-confinement** (scratch hardcoding). `HYAKU_SCRATCH` set to garbage / unset
   (private copy must ignore it — substituted `S` contains no `HYAKU_SCRATCH`), read-only
   TMPDIR parent, hostile umask (077/022), two modes sharing one `--work` root. Assert
   canaries intact, child reclaimed, work root empty.
4. **Frozen-byte refusal.** One-byte flip in each frozen file inside a fake `--lane`;
   assert exit 65, no `--out` created, lane originals' sha unchanged.
5. **Selftest env-isolation.** `--selftest` under the §1 poison set with `cwd=/`; assert
   stable finding ids and the expected exit map (pins R2 non-vacuity).

Already covered by siblings (do not duplicate): output-symlink, work-symlink,
cleanup-permissions, umask, timeout/group-kill, cross-root, missing-tools, header-modes,
readonly. **Not strongest:** live-network probes of `forgecapture` — network-dependent by
disclosure, non-deterministic, and the plan forbids waiving their failure.

## Evidence anchors (all observed 2026-10-30, lane worktree @ 1e00955a)

- Frozen pins: c1 `01efd6dd…aeda12`, c2 `679b7d96…3a66f4`; `git show 78b98d76:…` and
  worktree sha256sum agree (match=YES both).
- Every substitution needle grep-count = 1 in both frozen scripts (table in the w1 report).
- `/tmp/forge-sed.txt`: exactly 1 occurrence in c2 (line 80), no reader — removal is
  behaviour-preserving.
- r69 probes' CHILD_ENV allow-list at ledger69-probe.mjs:77, deprec69-probe.mjs:87.
- K70AttackGitEnv demo: `-C` args do not contain GIT_INDEX_FILE; scrub is required.
- K70ExecRunner candidate exit map: 0/1/64/65/70/73; K70ExecTransform: REFUSE-SOURCE-DRIFT.

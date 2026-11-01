source: S218 — CWE-59: Improper Link Resolution Before File Access (Base) — https://cwe.mitre.org/data/definitions/59.html — § Description ("The product attempts to access a file based on the filename, but it does not properly prevent that filename from identifying a link or shortcut that resolves to an unintended resource") and § Common Consequences (Modify Files or Directories) — fetched 2026-11-01, 197612 bytes, sha256 4fae5c5e7444b5e2f58b126e966640a41d1a055bd60a40b16a5e4ad9b5a7a038
source: S219 — CWE-367: Time-of-check Time-of-use (TOCTOU) Race Condition (Base) — https://cwe.mitre.org/data/definitions/367.html — § Description ("The product checks the state of a resource before using that resource, but the resource's state can change between the check and the use") and § Potential Mitigations ("to not perform a check before the use") — fetched 2026-11-01, 164988 bytes, sha256 a39970c0d78b30307c4efc90bbf1db9faeb91ae31ce35e427c9bbf829be32611
verified-at: 2026-11-01 (both pages fetched to `.ufo/waves/round-70/close/captures/` and pinned in `.ufo/pins/source-captures.json`; the lane-side attack half re-measured this round by `scripts/control-replay.mjs --selftest` and v2 probe arms V10/V11/V12)
recheck: 180d — `curl -fsSL https://cwe.mitre.org/data/definitions/59.html | grep -c 'resolves to an unintended resource'` → 1 and `curl -fsSL https://cwe.mitre.org/data/definitions/367.html | grep -c "state can change between the check and the use"` → 1; a changed abstraction (Base → different) or missing sentence is a new CWE revision, not a stale row
coverage-map: frontier band "Isolation substrates for parallel agents" (PROVINCE.md §Frontier)
ground: PROVINCE.md §Frontier — `corpus/knowledge/agent-isolation-substrates.md` (round 45) maps seat-containment mechanisms; this entry adds the output/work-path half of that band for replay instruments: the named link-following and TOCTOU weakness classes behind the round-70 seat attacks, and the construction the lane now uses against them.

# Replay output isolation: link following and TOCTOU at the instrument boundary

## Scope

- **Subject.** The two attack surfaces a replay/receipt tool exposes at its output boundary — `--out` and
  the work root — mapped to CWE-59 (link following) and CWE-367 (TOCTOU), with the lane's measured
  instances and the construction that closes them.
- **Measured instances (this round's seats, committed evidence).** `K70AttackOutputSymlink` showed a
  dangling `--out` symlink defeats an `existsSync` gate (an `exists`-then-write check passes while the
  write follows the link); `K70AttackWorkSymlink` and `K70AttackTmpLiteral` showed fixed or caller-named
  work paths redirect child writes; `K70ReviewCounterR8` showed a mutate-then-refuse bug (files written
  before an invalid-args exit) that no refusal-only check catches.
- **Why the class, not the instance.** Each instance is one shape of S218's definition: the filename is
  attacker-influenced and the write resolves it at use time. The counter-class is in the construction,
  not in banning one shape.

## The construction (what the lane now ships)

- **Exclusive create, not check-then-write (S219's mitigation).** `scripts/control-replay.mjs` refuses a
  pre-existing `--out` (`replay()` early return, exit 3) and writes the receipt with `{flag: 'wx'}`, so a
  path that appears between the check and the write — including a link created into that window — fails
  the create instead of being followed. The selftest arms `refuse-existing-out` and `refuse-out-race`
  hold the refusal open for inspection (`CONTROL_REPLAY_SELFTEST: PASS (20/20)`).
- **Unique child root, never a fixed path (S218 at the directory level).** Every run builds under
  `mkdtemp` (`ctl-*`), so two concurrent runs (v2 arm V13) cannot collide and a pre-planted symlink at a
  predictable path has nothing to pre-empt; the child is reclaimed through a retrying `rmTree` because
  Windows AV scans hold transient handles.
- **Refusals must be side-effect-free (the R8 lesson).** Argument validation completes before any
  filesystem mutation (`parseArgs` before `replay()` touches the disk); v2 arm V10 runs a six-shape
  invalid-args matrix and asserts exit 64 **and** an untouched work dir **and** no `--out` created.
- **The link arm is measured where the host allows it.** V11 creates a dangling `--out` symlink and
  requires refusal without target creation; on hosts where the runtime denies symlink creation the arm
  records `n/a` and the denominator shrinks (printed in the verdict line) rather than silently passing.
- **Environment redirection is the same class at process level.** GIT_DIR/GIT_WORK_TREE poisoning
  redirects the fixture's git writes (K70AttackGitEnv); the child environment is an explicit allow-list
  (`ENV_ALLOW`, scrub record in every receipt) and v2 arm V12 holds a poisoned decoy repo byte-identical.

## Limits

- Windows file symlinks need developer mode or admin; the v2 probe degrades the V11 link arm to `n/a`
  there instead of weakening it. Directory junctions (`junction` reparse points) need no privilege and
  are not separately armed — a disclosed gap, not a claimed absence.
- `wx` closes the creation race for the receipt; it does not make the tool a general sandbox — the
  replayed control still executes with the caller's user, and no universal forgery-resistance is claimed
  for receipts (a stub that fully implements the receipt format and output shape is the disclosed
  residual of v2; see `corpus/lessons/round-70.md`).
- S218/S219 are definition pages (tier A for the weakness vocabulary only); they carry no tool-specific
  guidance beyond the mitigation sentence quoted in the rows.

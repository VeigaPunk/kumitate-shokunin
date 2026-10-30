# K70AttackGitConfig — attack report: global hooksPath/template/signing config vs fixture writes

Seat: K70AttackConfig (attack role, leaf). Axis: operability (C1 replay isolation). Milestone: AttackGitConfig.
Candidate at `.ufo/waves/round-70/build/K70ExecRunner/control-replay.mjs`: **absent at attack time** (build dir empty), so the
contract/counter edge was attacked directly with a runnable isolated counterexample. No original
control was executed; the harness is a fresh simulation of the contract's stated private-copy
transforms (explicit `git -C` fixture-root args, limited env scrub, identity/signing `-c` pins,
`--no-verify`). Frozen r69 bytes and lane files untouched.

## The contract edge under attack

The implementation contract requires the generated private copy to "use explicit fixture-root
git arguments and scrub inherited repository environment". The frozen originals pin identity and
signing (`-c user.name/user.email/commit.gpgsign=false`, `--no-verify`) but pin **nothing** for
`init.templateDir`, `core.hooksPath`, or config *file loading*. Claim attacked: on a host whose
git config (global/system/env) sets these, fixture writes can be redirected or denied despite the
scrub.

## Local evidence (read-only)

- `probe/replay70-probe.mjs:20` — control-replay is spawned with `env:{...process.env,TMPDIR:root}`:
  full operator env (HOME, XDG_CONFIG_HOME, GIT_CONFIG_*, GIT_DIR, ...) reaches control-replay and
  whatever env it passes to the private copy.
- r69 counters' `CHILD_ENV` (`ledger69-probe.mjs:77`) is an allowlist `{PATH,TMPDIR,LANG}` — it
  protects the *counter's* children, but the private copy constructs the fixture *before* the
  counter runs, under control-replay's env, not the counter's. The allowlist never covers fixture
  construction. (`/etc/gitconfig` would also be read by git regardless of HOME handling.)
- Host global config `/home/vgpnk/.config/git/config` already embeds command-executing config:
  `credential.helper=!/home/vgpnk/.local/bin/gh auth git-credential`, `filter.lfs.clean=git-lfs clean`
  (git-lfs installed at /usr/bin/git-lfs). No hostile hooksPath/templateDir today — the gap is the
  contract's guarantee, not this host's current config.
- No `/etc/gitconfig` on this host; tested via `GIT_CONFIG_SYSTEM` override instead.

## Counterexample (runnable, isolated)

Harness: `/fast/scratch/hyaku/kumitate-r70/K70AttackGitConfig/` (copied to
`build/K70AttackGitConfig/` with observed receipts). `mini-control.sh` mimics the generated
private copy under the flawed scrub (only GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE/GIT_OBJECT_DIRECTORY/
GIT_COMMON_DIR unset). Evil post-commit hooks amend the fixture with an attacker file, so
`git rev-parse HEAD` — the REV the frozen counter measures — names an attacker-amended tree.

Observed (git 2.56.0, node v24.21.0, bash; `bash run-all.sh`):

| Arm | Config delivery | Hook fired | Fixture HEAD | Result |
|---|---|---|---|---|
| A global templateDir | `$HOME/.gitconfig` `init.templateDir` → template hooks only | yes (under `--no-verify`) | `attacker-controlled.txt` present, subject `evil: redirect fixture revision` | **redirect proven** |
| A2 template config injection | template `config` file sets `core.hookspath` → copied into `.git/config` (local scope, verbatim comments observed) | yes (via injected hooksPath) | `attacker-hookspath.txt`, subject `evil: hookspath redirect` | **template→local config→redirect chain proven** |
| B system hooksPath | `GIT_CONFIG_SYSTEM` file `core.hooksPath` | yes | `attacker-hookspath.txt`, `evil: hookspath redirect` | **survives any HOME scrub** |
| C env injection | `GIT_CONFIG_COUNT=1` + `GIT_CONFIG_KEY_0=init.templatedir` (no config file) | yes | `attacker-hookspath.txt`, `evil: hookspath redirect` | **survives unless env scrubbed** |
| D corrected vs A's global | neutralized env + `-c` empty pins | no | `README.md scripts/tool.mjs`, subject `c1-donothing fixture` | fix holds |
| E corrected vs B+C combined | neutralized env + `-c` empty pins | no | clean control tree | fix holds |

Signing arm — disclosed as **pinned, not a defect**: global `commit.gpgsign=true` +
`gpg.program=/bin/false` makes an unpinned `git commit` fail (`rc=128`, "fatal: failed to write
commit object"), but the frozen originals' `-c commit.gpgsign=false` overrides it (commit succeeds,
observed). Template/hooksPath have **no** equivalent pin anywhere in the frozen originals.

## Defects

- **D1 — `init.templateDir` is unpinned** (global file, system file, or `GIT_CONFIG_COUNT` env):
  `git init` in the private copy copies template hooks that run on commit despite `--no-verify`,
  and a template `config` file is copied into the fixture's local config (arm A2 — verbatim copy
  observed). Redirects the measured fixture revision.
- **D2 — `core.hooksPath` is unpinned** (global/system): post-commit runs under `--no-verify`
  (observed), amends the fixture, redirects the measured tree.
- **D3 — env config injection (`GIT_CONFIG_COUNT/KEY/VALUE`)** reaches `git init` (no `-c` pin on
  init) unless control-replay scrubs it; the probe forwards full env to control-replay.
- **D4 — availability class**: any config that breaks fixture `git init/add/commit` (signing
  policy, required filters, hostile hooks) makes the private copy exit non-zero, so R3–R7 MISS
  permanently — honest 10/10 becomes unreachable on such a host.
- **D5 — contract ambiguity**: "scrub inherited repository environment" does not say config
  *files* (global/system/template) must be neutralized; the r69-style reading (repo vars only)
  leaves D1–D3 open.

## Freeze consequence

- **Integrity**: fixture-write redirection means the REV measured by the frozen c1/c2 counters is
  not the control's tree. A config-delivered hook (same delivery as arms A/A2/B/C) runs arbitrary
  code as the invoking user for the whole probe lifetime; a resident watcher can rewrite
  `result-*.txt` and self-consistently patch the archived tree's tool+pins, faking R2–R7, R9,
  R10 while R1 stays genuine (lane-side `git show`) → **REPLAY70_HELD achievable without any real
  capability** on a hostile-config operator host. (Watcher-tier forge asserted as consequence of
  arbitrary exec; only the revision-redirect tier was executed live.)
- **Availability**: on a host with legitimate-but-strict config, R3–R7 can never pass (D4) —
  the frozen predicate silently depends on operator git config in both directions. This
  environmental assumption is undeclared in the plan/contract.

## Smallest safe correction

In `control-replay.mjs`, run the private copy (and every git it transitively spawns) with:

1. `GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_SYSTEM=/dev/null`,
   `GIT_CONFIG_COUNT=0`, and all inherited `GIT_*` vars removed (keep PATH/TMPDIR/LANG); and
2. explicit `-c init.templateDir=<empty-dir> -c core.hooksPath=<empty-dir>` on every git call,
   empty dirs under the private work root;
3. keep the originals' identity/signing `--no-verify` pins unchanged.

Verified: arms D and E fully neutralized (no hook, clean control tree, control receipt semantics
intact, exit codes unchanged). Minimal-sizing probes: env-nulls alone stops arms B and C; `-c`
pins alone stop arm A (with a cosmetic "templates not found" warning). Either layer suffices
empirically; apply both.

## Process notes

- No installs/updates (git 2.56.0, node v24.21.0 preinstalled; pacman paused, none needed).
- No originals executed; no lane/fleet writes outside this report and `build/K70AttackGitConfig/`.
- No frozen bytes modified. No delegation, no background jobs, no git/jj mutations.
- Artifacts: `build/K70AttackGitConfig/` (harness, evil fixtures, receipts, run-observed.txt).
  Scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackGitConfig` cleaned before yield.

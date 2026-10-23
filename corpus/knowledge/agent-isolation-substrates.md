source: S062 https://git-scm.com/docs/git-worktree; S063 https://git-scm.com/docs/gitrepository-layout; S064 https://raw.githubusercontent.com/git/git/v2.56.0/Documentation/githooks.adoc; S065 https://git-scm.com/docs/git/2.56.0; S066 https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/git-compatibility.md; S067 https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/working-copy.md; S068 oh-my-pi 45c35e40 task isolation; S069 bwrap.xml v0.13.1; S070 bubblewrap.c 362936ae; S071 proc_pid_environ(5); S072 systemd 262 resource-control and systemd-run; S073 Node v24.21.0 cli/buffer and getrlimit(2); S074 `jj status --help` 0.45.1; S013 Kimi Tower; S027 git 2.55.0 release notes
verified-at: 2026-10-23 (host git 2.56.0, jj 0.45.1-7c41cdeb, bubblewrap 0.13.1, systemd 262, node v24.21.0, omp/18.12.6 = oh-my-pi 45c35e40; every demo ran in fresh scratch repositories under /fast/scratch/hyaku/kumitate-r45/seats/a2-*/, receipts in `.ufo/waves/round-45/a2-control/`; every source row re-opened by an attempt-2 seat, receipts `a2-control/Reopen*.md`)
recheck: on a release of git, jj, bubblewrap, systemd, node or omp — re-open the matching S### at the new version and re-run the demo whose row cites it

# Isolation substrates for parallel agent seats — which guard stops which failure

## Scope and province

What a seat of this lane's swarms may write, where, and under which guard, derived from the mechanism each guard
defeats. Orchestration-level only: which substrate an orchestrator hands to which seat. The mechanics belong to
sibling lanes and are cited, not absorbed (seat ConnOverlapRecheck, each file checked at the sibling's committed
HEAD):

- jj and git substrate internals → souji: `souji-shokunin/corpus/knowledge/jj-colocation-receipts.md` (jj snapshot,
  ref import, staging area ignored; its S051–S053), its SOURCES S089 (`-C` is not a repository-selection guarantee),
  and `git-auto-maintenance-prunes-worktrees.md` (linked worktrees pruned by maintenance, which this entry does not
  cover);
- the bwrap probe envelope as a test method (`env -i`, private /tmp, PID and network namespaces) → tameshi
  `corpus/knowledge/guard-kill-closure.md` and `hermetic-env-differential.md`;
- systemd transient units and memory pressure → tsukuroi `corpus/knowledge/memory-pressure-r25.md` (its S072 is the
  same systemd-run page as S072 here);
- OOM attribution and victim selection → mori `corpus/knowledge/userspace-oom-killers-r26.md`,
  `kernel-oom-line-attribution-r12.md`, `oom-victim-selection-r27.md`;
- path containment → kagi `corpus/knowledge/adjacency-scope.md`; threat models of escape → kasegi and kagi.

This entry states no security guarantee: the substrates below bound an honest seat's accidents. S013, § Safety and
resource cost: «Worktrees isolate writes, but they are not a security sandbox.»

What the corpus held before this entry, and is not restated here: the OMP task tool's isolation backends and merge
modes as documented on `main` (`knowledge/omp-task-contract.md:90-102`, S001); the ambient-`GIT_DIR` redirect and the
allowlisted child environment of the pinned clone (`knowledge/pinned-evidence.md:98-101`); the round-44 counter's
PID-1 environ leak and the Node spawn `env` option it called for (`lessons/round-44.md:129,138`); a wider `GIT_*`
scrub required by round-42 `SentinelGateMutants.md:130` and round-36 `ScoutPinDesign.md:63` for gate selftests.
New here: the mechanism behind each containment rule, a demo with a do-nothing control for each, and the
rule → substrate → guard table.

## Host facts the table assumes (measured 2026-10-23; not sourced mechanisms)

- OMP task isolation is **off**: `task.isolation.enabled` defaults to `false`
  (`packages/coding-agent/src/task/settings.ts:26-36` @ 45c35e40, S068, re-opened by ReopenS068), and
  `~/.omp/agent/config.yml` has no `isolation` key (L1 `grep -n isolation` printed nothing). Every swarm seat shares
  the parent's filesystem and cwd; any isolation is the orchestrator's manual work.
- Seat tools start at the fleet root, not the lane (round prompt §6, "your tools start at the fleet root"). No OMP
  document states the spawn cwd. The rule that follows from it (absolute paths in every write, the L1 misroot sweep,
  QUALITY Q27) rests on this host record and the lane's misroot history, not on a demo, so it is listed here and not
  in the decision table.
- The lane repo is jj-colocated (jj 0.45.1, git backend) on btrfs; `/fast/scratch` is xfs.

## Mechanisms, each with its demonstration

Absolute counts in the demos are fixture-dependent; the deltas and the effect/control contrast are what carry over.

**M1 — jj snapshots the working copy before almost every command.** S074 (`jj status --help` lines 34-41): «By
default, Jujutsu snapshots the working copy at the beginning of every command.» S067 :14-16: a new file «will be
automatically committed once you run e.g. `jj st`». Demo (RedoDemoJjSnapshot, fresh colocated repo): with a stray
file present, each of `jj st`, `jj log -r @` and `jj diff -r @ --stat` adds one op-log entry, one commit, three git
objects (four on the first snapshot), one keep-ref, rewrites `.git/index`, and puts the file in `@`'s diff; the
unflagged `jj op log` snapshots too, `jj root` does not. With `--ignore-working-copy` every counter and the index
hash are unchanged (10→10 ops, 19→19 objects, 9→9 keep-refs). Do-nothing control (clean tree, `jj st` and `jj log`):
every delta 0, index identical, second run identical. A `.gitignore` match is never tracked;
`snapshot.auto-track = "none()"` stops new paths (zero delta) but not an edit to a tracked file (one op, `M base.txt`
in `@`); a fresh clone carries no auto-track key (S067 :19-22, :69-71). Same-effect hazard (CtlDemoSameEffect): a
control run in a dirty sandbox, or after a git ref move, also adds an op, so a valid receipt prints the control's
before/after counts from a printed clean pre-state.

**M2 — raw git writes in a colocated repo are imported, and re-anchor `@`.** S066 :104-106: «Jujutsu will import and
export from and to the Git repo on every `jj` command automatically.» :119-121: git changes appear as an «"import
git refs" operation»; :48-51: «The staging area will be ignored.» Demo (RedoDemoJjGitStray): a raw `git commit` lands
on the detached HEAD; the next jj command imports it, prints `Reset the working copy parent to the new Git HEAD.`,
abandons the old `@` and re-anchors a new empty `@` on the foreign-author commit. With pending work in `@`,
`git add -A && git commit` copies that work into the detached git commit, and the old jj change survives only as an
abandoned sibling that still holds it: the work is duplicated across an abandoned change and a foreign commit, not
moved. With disk content and staged content differing, `jj commit` commits the disk content. Do-nothing control
(jj commands only): no import, linear log, no staged content disturbed — the index file itself does change (a new
file is registered intent-to-add by `jj st`), so "index untouched" is not a property of jj either.

**M3 — git's repository-locating variables beat `-C` and `cd`, and config variables survive a local-variable scrub.**
S065 (git(1) § Environment Variables, The Git Repository): «If the GIT_DIR environment variable is set then it
specifies a path to use instead of the default .git for the base of the repository.»; `-C` only sets the starting
directory. S064 githooks.adoc:30-31: «Environment variables, such as `GIT_DIR`, `GIT_WORK_TREE`, etc., are exported so
that Git commands run by the hook can correctly locate the repository.» Demo (RedoDemoGitEnvLeak): with
`GIT_DIR=<A>/.git` exported, `git -C <B> commit` and `cd <B> && git commit` both commit into A (A 1→2→3 commits, B
stays 1), index writes follow A too; `git clone` under the exported `GIT_DIR` leaves A untouched, but the next
`git -C <clone> commit` commits into A, and so does a clone whose clone line alone was scrubbed. Control (variables
unset): commits land in B and the clone, A unchanged. `git rev-parse --local-env-vars` lists 15 names; round-44 wave
contexts unset three (`GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`) on the clone and checkout lines (CtlCheckK5Baseline).
The number of `GIT_*` names a hook sees depends on the caller's environment (8 under `env -i`, 12–13 from a seat
shell), so no fixed count is a property of git. The 15 local names omit config redirection: after
`unset $(git rev-parse --local-env-vars)`, a planted `GIT_CONFIG_GLOBAL` or a planted `$HOME/.gitconfig` still runs a
hook on the next scratch commit (SentinelSeatEnvScrub), and with git off `PATH` the substitution is empty, so the
scrub silently does nothing. Lane record of the failure: round 37 `falsify/Sec3.md:48`, round 42
`CritManifestDesign.md:7,30` (a gate selftest committed 1,032 files onto the caller clone's HEAD).

**M4 — a linked worktree is not a separate repository.** S062 § COMMANDS `add`: «The new worktree is linked to the
current repository, sharing everything except per-worktree files such as HEAD, index, etc.»; § REFS: refs other than
refs/bisect, refs/worktree and refs/rewritten are shared; the repository config is shared. S063 `common`: «All files
under common however will be shared between all working trees.» — `info/`, `hooks/` and `config` resolve to
`$GIT_COMMON_DIR` (S027: `.git/info/exclude` is shared across linked worktrees). OMP's own `rcopy` backend runs
`git worktree add --detach` and then detaches the task's git metadata into «a private, frozen repo»
(`task/worktree.ts:677-678` @ 45c35e40, S068): the harness itself does not treat a bare linked worktree as a seat
boundary. Demo (RedoDemoWorktreeShared, git 2.56.0): an `info/exclude` pattern written in the main worktree is
honoured in the linked one (`check-ignore -v` names the main `.git/info/exclude`); a hook written from the linked
worktree, config edits in both directions, branches and objects are all visible to the other side; HEAD, index,
refs/bisect, refs/worktree and refs/rewritten are per-worktree; checking out a branch used elsewhere fails
`fatal: 'main' is already used by worktree at '…'` (exit 128) unless `--ignore-other-worktrees`. In a colocated jj
repo, `jj log` imports a linked worktree's branch commit (an `@git` bookmark) but never a detached worktree HEAD.
Do-nothing control (`git clone --no-hardlinks`, same script): none of the exclude pattern, branches, config, later
commits or inodes are shared (six negative probes).

**M5 — `--clearenv` does not empty bwrap's PID 1.** S069 bwrap.xml:62-67: with a PID namespace «bwrap is running a
minimal pid 1 process»; :233-235: `--clearenv` unsets variables for the command it runs. S070 bubblewrap.c:2490
(`xclearenv`) clears bwrap's own environment before `execvp` of the command (:3555); PID 1 is the forked reaper
(:3487-3495) that runs `do_init` and never execs. S071: `/proc/<pid>/environ` holds the environment «set when the
currently executing program was started via execve(2)». Demo (RedoDemoBwrapEnv, planted markers only, no values
printed):

| mode | command `env` | `/proc/1/environ` | launcher marker |
|---|---|---|---|
| plain bwrap | 263 names | 264 names | in both |
| `--clearenv --setenv` | 4 names | 264 names | gone from `env`, still in `/proc/1/environ` |
| `env -i` + bwrap | 3 names | 0 names | in neither |
| `env -i` + `--clearenv --setenv` | 4 names | 0 names | in neither |
| control, no marker | 262 | 263 | 0/0 |

A marker injected only by `--setenv` never appears in `/proc/1/environ`: PID 1 holds exactly the environment bwrap was
exec'd with. From Node, `spawnSync('bwrap', args, {env})` with a two-name env leaves two names in `/proc/1/environ`.
This is round 44's HIGH finding (SentinelSandboxEscape) explained: p44d passed `--clearenv` and `spawnSync` had no
`env` option (`.ufo/waves/round-44/probe/p44b-count.mjs:225,233`; 263 names at PID 1, CtlCheckK5Baseline).
`systemd-run --user --scope` outside `env -i` hands the caller's environment to the scope (S072 systemd-run § Description:
«will thus inherit the execution environment of the caller»), so `env -i` must be bwrap's immediate parent. Channels
that remain even then (SentinelBwrapEnvI): `/proc/1/cmdline` shows bwrap's argv, inherited file descriptors (the
launcher's tty) stay open, and any explicitly bound runtime directory is readable.

**M6 — a V8 heap cap does not bound native memory; a cgroup does.** S073: `--max-old-space-size` «Sets the max memory
size of V8's old memory section.»; a Buffer's backing store is an ArrayBuffer outside that section. S072
resource-control `MemoryMax=`: «out-of-memory killer is invoked inside the unit». Demo (RedoDemoNativeMemCap, node
v24.21.0, outer scope MemoryMax=1G): `node --max-old-space-size=64` allocates and touches a 512 MiB Buffer and prints
`ALLOC_OK 512` (exit 0; arrayBuffers 537,008,379 bytes, heapUsed 3,921,064); the same flag does stop a JS string loop
(`Reached heap limit`, exit 134), so it is live in its own domain. Inside
`systemd-run --user --scope -p MemoryMax=256M -p MemorySwapMax=0` the 512 MiB allocation is OOM-killed: exit 137,
unit result `oom-kill`, kernel `constraint=CONSTRAINT_MEMCG`, six of six runs. Do-nothing control (no allocation)
and a 16 MiB Buffer in the same scope: exit 0. RLIMIT_AS is a poor cap for node: `prlimit --as=805306368` (768 MiB;
prlimit 2.42.4 rejects the `768M` spelling) kills node before the script runs (V8 reserves about 1.34 GiB of address
space at start, VmPeak 1.41 GiB; `Failed to reserve virtual memory for CodeRange`, exit 133), and at 1600 MiB the
allocation fails in-process (`ERR_MEMORY_ALLOCATION_FAILED`, exit 1); RLIMIT_AS bounds address space, not resident
memory (S073, getrlimit(2)). Round 44's counter relied on the V8 flag alone
(`corpus/lessons/round-44-verifier-spotcheck.md` § Routed defects 3, SentinelProcLeak).

**M7 — jj workspaces share one repository.** S067 § Workspaces: «You can have multiple working copies backed by a
single repo.»; rewriting a commit another workspace has checked out makes that workspace stale. Not demonstrated
this round; no table row relies on it.

## Decision table — seat write pattern → substrate → guards

Every row names one mechanism above, the committed attempt-2 demo receipt that shows its effect with a clean
do-nothing control, and the failure it prevents.

| seat action | substrate | required guards | failure prevented | mechanism · demo receipt |
|---|---|---|---|---|
| read lane files or history | the live jj-colocated lane, read-only | `--ignore-working-copy` on every jj command; read-only git (`log`, `show`, `diff`, `ls-files`) | a "read-only" `jj st`/`jj log` recording the working copy into `@` (new files under default auto-track; edits to tracked files even under `auto-track = "none()"`) | M1 · `a2-control/RedoDemoJjSnapshot.md` |
| any git write in the lane | none: the lane helper `jj-lane.sh` is the only writer | no `git add/commit/stash/checkout/reset`, no mutating jj | a raw commit imported by the next jj command, `@` re-anchored onto a foreign-author detached commit, pending work duplicated into it and stranded on an abandoned change | M2 · `a2-control/RedoDemoJjGitStray.md` |
| edit code, run a gate that writes | its own `git clone --no-hardlinks` under `/fast/scratch/hyaku/<lane>-r<N>/seats/<name>/` | at the top of the seat's bash shell, before any git command: `_g=$(git rev-parse --local-env-vars) \|\| exit; [ -z "$_g" ] \|\| { mapfile -t _n <<< "$_g"; unset "${_n[@]}"; }; unset GIT_EXEC_PATH GIT_CEILING_DIRECTORIES; export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1` (tested by SentinelSeatEnvScrub; supply commit identity with `-c`) | commits, index writes or hooks landing in an inherited `GIT_DIR` repository or driven by an inherited global config (round 37 Sec3, round 42 E11) | M3 · `a2-control/RedoDemoGitEnvLeak.md`, `a2-control/SentinelSeatEnvScrub.md` |
| parallel writers on one repository | separate clones, not linked worktrees | never `git worktree add` on the lane; no `info/exclude`, hook or config edits from a seat | one seat's ref, config, hook or exclude edit appearing in every worktree; a checked-out-branch refusal | M4 · `a2-control/RedoDemoWorktreeShared.md` |
| run untrusted or generated code (counters, controls) | bwrap `--unshare-all --die-with-parent --new-session` | `env -i PATH=/usr/bin:/bin HOME=/tmp` as bwrap's immediate parent (from Node: `spawn(…, {env: {PATH, HOME}})`), inside any `systemd-run` scope, plus `--clearenv --setenv` for the command; no secret in bwrap's argv; no `/run` or `$XDG_RUNTIME_DIR` bind | the launcher's environment (variable names and values) readable at `/proc/1/environ` inside the sandbox | M5 · `a2-control/RedoDemoBwrapEnv.md`, `a2-control/SentinelBwrapEnvI.md` |
| any run that can allocate | `systemd-run --user --scope -p MemoryMax=<cap> -p MemorySwapMax=0 -p TasksMax=<n>` around it, with `timeout -s KILL` | a cgroup cap, never a V8 heap flag or RLIMIT_AS alone; read exit 137 / `oom-kill` as a bounded failure | a native allocation (Buffer, child process) passing a heap cap and growing until host memory pressure | M6 · `a2-control/RedoDemoNativeMemCap.md` |

Harness isolation is not a row: `isolated: true` (OMP PAL backends btrfs/zfs/reflink/overlayfs/rcopy, S068) exists
only if the operator sets `task.isolation.enabled`, which this host does not (Host facts).

## Practice changes this entry makes (against round-44 practice)

1. **`GIT_*` and git-config scrub.** Round-44 wave contexts unset `GIT_DIR`, `GIT_WORK_TREE` and `GIT_INDEX_FILE` on
   the clone and checkout lines (`.ufo/waves/round-44/controls-spec.json`, `falsify-spec.json` contexts;
   CtlCheckK5Baseline). M3 shows that is short twice over: git lists 15 local variables, and a clone-line scrub still
   commits into the inherited repository. This round's attempt-2 wave contexts already moved to
   `unset $(git rev-parse --local-env-vars)` at the top of the seat shell (`.ufo/waves/round-45/a2-control-spec.json`,
   committed `d9ad2870`), and SentinelSeatEnvScrub shows even that leaves `GIT_CONFIG_GLOBAL`, `$HOME/.gitconfig` and
   an empty-substitution fail-open. From round 46 the wave context carries the table's tested guard line instead.
2. **bwrap environment.** Round 44's counter passed `--clearenv` with no spawn environment. M5 shows PID 1 keeps the
   launcher environment; any lane sandbox runs bwrap with `env -i` (shell) or a minimal spawn `env` (Node,
   `lessons/round-44.md:129`) as its immediate parent, inside the scope rather than around it. QUALITY Q31 carries
   the check. No lane runner implements it yet (the round-45 runner seat died without a report).
3. **Memory caps.** Round 44 bounded native memory with a V8 flag. M6 shows only the cgroup bounds it; a counter's
   per-case cap is a scope (Q31).

## What this entry does not establish

- No security boundary. bwrap, scopes and clones bound accidents of honest seats; escape analysis is kasegi and kagi
  ground. The `/proc/1/environ` demo printed names and planted markers, never values.
- The spawn cwd of an OMP seat is a host record (round prompt), not a sourced OMP mechanism.
- jj behaviour is measured on 0.45.1 only; S066 does not state the outcome of a raw `git commit` on a detached HEAD
  ([INFERENCE] noted by ReopenS066); RedoDemoJjGitStray is the evidence.
- `snapshot.auto-track = "none()"` in the lane's local jj config is per-checkout operator configuration; it does not
  travel with a clone and does not cover tracked-file edits.
- Linked-worktree pruning by `git maintenance` (souji) and jj workspaces in colocated repos (M7) are not
  demonstrated here.

## Receipts

Attempt-2 demo receipts, each with its do-nothing control in the same script, all run under
`systemd-run --user --scope -p MemoryMax=… -p TasksMax=… timeout -s KILL …` in fresh scratch repositories:
`.ufo/waves/round-45/a2-control/RedoDemoJjSnapshot.md`, `RedoDemoJjGitStray.md`, `RedoDemoGitEnvLeak.md`,
`RedoDemoWorktreeShared.md`, `RedoDemoBwrapEnv.md`, `RedoDemoNativeMemCap.md`; guard attacks `SentinelSeatEnvScrub.md`,
`SentinelBwrapEnvI.md`; source re-opens `Reopen*.md`. Attempt-1 receipts under `.ufo/waves/round-45/build/` are not
cited (untrusted; their seats are dead).

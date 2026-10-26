VERDICT: The demo is not version-stable — on the official jj 0.46.0 binary `seat_has_git_dir` flips `no`→`yes` (0.46.0 colocates every seat into a Git worktree of the default repo), the frozen counter reads `JJ64_UNMET held=7/8 … J6 MISS seat_has_git_dir:stated=no:live=yes` exit 1, and a `--no-colocate` pin plus `JJ_SKEW:` reporting (drafts in my build dir) restores `JJ64_HELD held=8/8` on both binaries while making S200's `jj workspace remove` sentences demonstrable.

## Evidence

Tool (tooling directive; no pacman): jj `0.46.0-7d382314f9420b4b8d932245b49c99492c812b9f`, official GitHub release binary `jj-v0.46.0-x86_64-unknown-linux-musl.tar.gz` (11 110 358 B) from `https://github.com/jj-vcs/jj/releases/download/v0.46.0/jj-v0.46.0-x86_64-unknown-linux-musl.tar.gz`, sha256 `fce0271158e665ceb82dc66c5eb95b1728649094e9133074f3b5baece345fc08`, installed **only** to `/tmp/kumitate-r64/K64R2ExecJjOtherVersion/bin/jj` (host `~/.local/bin/jj` untouched); reason: measure the entry's declared one-version limit. No checksum/signature asset is published and `gh attestation verify … --repo jj-vcs/jj` → `Error: HTTP 404: Not Found`; the only cross-check is that the binary's self-reported commit equals `refs/tags/v0.46.0` (API `…/git/ref/tags/v0.46.0` → `commit 7d382314f9420b4b8d932245b49c99492c812b9f`).

Demo, 3 runs per binary (host 0.45.1 first, then `PATH=/tmp/kumitate-r64/K64R2ExecJjOtherVersion/bin:$PATH`):

```
host  : exit 0, exit 0, exit 0   identical output x3
0.46.0: exit 0, exit 0, exit 0   identical output x3
$ diff host-1.txt v046-1.txt
3c3
< JJ_SEAT: seat_has_git_dir=no
---
> JJ_SEAT: seat_has_git_dir=yes
22c22
< JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
---
> JJ_SEAT_DEMO: DONE jj=0.46.0-7d382314f9420b4b8d932245b49c99492c812b9f
```

20/21 keys identical, including all four stale/fresh keys and `update_stale_abandoned_seat_file=deleted-no-recovery-commit` (the `working copy is stale` wording is unchanged in 0.46.0). Frozen counter at the integrated tip, both binaries:

```
$ PATH=<0.46.0>:$PATH node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
JJ64_UNMET held=7/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=J64 | J6 MISS seat_has_git_dir:stated=no:live=yes
exit 1
$ node .ufo/waves/round-64/probe/jj64-probe.mjs … 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8      # host 0.45.1
JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=J64
exit 0
```

Cause, measured (`jj config get git.colocate` → `true`; `jj workspace add --help`: "By default, a Git worktree is created when the current workspace is colocated and the [git.colocate config] is `true`"):

```
$ jj workspace add <seat>            -> "Created Git worktree for the new workspace."
$ cat <seat>/.git                    -> gitdir: ../../tmp.G88taMxyab/.git/worktrees/seat1
$ git -C <default> worktree list     -> /tmp/tmp.G88… (detached HEAD) ; /tmp/tmp.ays…/seat1 (detached HEAD)
$ (cd <seat> && git commit -qm 'seat plain-git commit')   -> 0
$ (cd <seat> && git update-ref refs/heads/seat-leak HEAD) -> 0
$ git -C <default> branch -a                              -> * (no branch) ; seat-leak
$ jj -R <default> --ignore-working-copy log -r all()      -> no 'seat plain-git commit'
```

`--no-colocate` (0.46.0+) and `--config git.colocate=false` both restore `seat_has_git_dir=no`; 0.45.1 has neither flag (`error: unexpected argument '--no-colocate' found`). `jj workspace remove` on 0.46.0 (S200's sentence, sharper form):

```
$ jj workspace remove seat1   -> "Removed Git worktree …" / "Removed workspace directory …"  exit 0, dir absent
$ jj op log -n 2              -> d9a3f190aed6 | remove workspace seat1 ; de2181e857d3 | snapshot working copy
$ jj file show -r <change> root:late.txt -> written but never snapshotted   (file never snapshotted by the seat)
$ jj file list -r <change> | grep -c ign.tmp -> 0 ; jj file show root:ign.tmp -> Error: No such path
stale seat -> exit 1 "Error: The working copy is stale …" ; main workspace -> exit 1 "Cannot remove workspace 'default' because it contains the repository" ; dir deleted by hand -> exit 1 "Cannot access workspace 'gone' directory … Use jj workspace forget" ; current workspace from inside -> exit 0 "Warning: The current workspace 'cur' no longer exists after this operation." ; 0.45.1 -> exit 2 unrecognized subcommand.
```

Proposed fix verified in a scratch clone (2ed8a5f + v3 demo `8591d408…`, + amended entry `f245e32f…`; clone deleted after):

```
PATH=<0.46.0>:$PATH node …/jj64-probe.mjs <clone> f245e32f265453a93379c900030c7a4809076477 -> JJ64_HELD held=8/8 exit 0
node …/jj64-probe.mjs <clone> f245e32f265453a93379c900030c7a4809076477                    -> JJ64_HELD held=8/8 exit 0
draft demo 3 runs/binary: exit 0 x6, output identical within a binary, 21 JJ_SEAT keys == the entry's set on both
0.45.1: default_flags_seat_has_git_dir=no  / workspace_remove_supported=no (rest n/a)
0.46.0: default_flags_seat_has_git_dir=yes / default_flags_seat_gitdir=default-repo-gitdir / remove_dir_after=removed / remove_unsnapshotted_change_recovered=yes / remove_ignored_file_in_tree=0 / remove_stale_refused=yes
hostile caller (cwd+TMPDIR inside the lane, JJ_USER/JJ_EMAIL/GIT_DIR/GIT_WORK_TREE set): exit 0 both, 21 keys same
```

Lane untouched: `git -C <lane> diff --stat 2ed8a5f -- scripts/jj-seat-demo.sh corpus/knowledge/jj-workspace-seat-containment.md` → empty; entry sha256 still `4420843074b0ea3efa624b192f2d092f6c1fb914…`.

## Findings

1. **HIGH — the entry's `seat_has_git_dir=no` and "the seat directory has no git directory of its own" are false on jj 0.46.0, and the claim fails as declared.** Attacks: `## Demo outcomes`, the "What the demo measures" paragraph, J6. Repro: `PATH=/tmp/kumitate-r64/K64R2ExecJjOtherVersion/bin:$PATH node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` → `held=7/8 … J6 MISS seat_has_git_dir:stated=no:live=yes` exit 1 (host: 8/8 exit 0). The demo's fixture is colocated, so 0.46.0's new default (`git.colocate=true`) silently measures a different object. Fix proposed: pin `--no-colocate` where the flag exists (keeps all 21 keys version-stable) and move version-dependent facts to `JJ_SKEW:` lines, which J6 ignores — verified 8/8 on both binaries with `jj-seat-demo.v3-draft.sh`.

2. **HIGH — containment consequence of that default is unstated: a colocated seat can write the shared git store and refs with plain `git`, and the default jj view does not show it.** Attacks: decision-table row 1 ("the edit stays out of the default tree") and the M7 reading that a workspace isolates a seat's work; the entry's Limits say git-side effects were not measured. Repro: `bash /tmp/kumitate-r64/K64R2ExecJjOtherVersion/probe-colocate2.sh` (0.46.0) → seat commit `exit 0`, `git -C <default> branch` lists `seat-leak`, `jj log -r 'all()'` in the default shows no such commit, while `jj status` in the seat prints "Reset the working copy parent to the new Git HEAD.". Fix: new decision-table row and a `JJ_SKEW` gitdir-shape key (in `entry.v3-draft.md`).

3. **MEDIUM — the entry's Limits understate what 0.46.0 makes measurable: `jj workspace remove` and S200's "Tracked changes are snapshotted before the directory is removed" are demonstrable, and the entry says remove is "absent on the host" and unmeasured.** Attacks: the Limits bullet "Not measured: … `jj workspace remove`" and the version-skew sentence's claim that no key relies on `remove`. Repro: `bash /tmp/kumitate-r64/K64R2ExecJjOtherVersion/probe-remove3.sh` (0.46.0) → op count 7→9 (`snapshot working copy` then `remove workspace u`), never-snapshotted `late.txt` recoverable by `jj file show -r <change> root:late.txt`; ignored file absent from the tree and deleted; stale/main/deleted-directory removals refused (exit 1 each). Fix: the *Workspace removal (jj 0.46.0)* paragraph plus three new S200 located quotes in `entry.v3-draft.md` (J4/J5 verified 8/8 by the frozen counter on the draft clone).

4. **LOW — `forget` changed side effects on 0.46.0 (it removes the seat's Git worktree and `.git` file), so "the directory stays" is true for files but the seat stops being a git repo.** Attacks: the forget row and the "Releasing a seat" sentence. Repro: `bash /tmp/kumitate-r64/K64R2ExecJjOtherVersion/probe-colocate2.sh` → `Removed Git worktree for "<path>"`, files `.jj base.txt gitonly.txt` remain, `git -C <seat> rev-parse --git-dir` → `fatal: not a git repository`. Fix folded into the amended forget row/paragraph.

5. **LOW — nothing in the lane ever runs the demo on a second version, so the entry's own recheck trigger ("a changed outcome key means a changed row") cannot fire without a jj upgrade on the host.** Attacks: the `recheck:` line's operational value. The `JJ_SKEW: jj_version=` line makes every future run record the binary it measured, the cheapest available detector.

## Artifacts

- `…/build/K64R2ExecJjOtherVersion/skew.md` — evidence, per-key diff, remove demonstration, amendment text, tool record (deliverable).
- `…/build/K64R2ExecJjOtherVersion/jj-seat-demo.v3-draft.sh` (sha256 `7d385a34…`) + `jj-seat-demo.v3.patch` (unified diff vs integrated v2, 128 lines) — proposed demo fix, verified 8/8 on both binaries.
- `…/build/K64R2ExecJjOtherVersion/entry.v3-draft.md` (sha256 `527d83e8…`) — amended entry (version-skew + removal paragraphs, 2 decision-table rows, 3 S200 quotes, corrected Limits; `source:`/`verified-at:`/`recheck:`/21 outcome keys unchanged).
- Scratch: `/tmp/kumitate-r64/K64R2ExecJjOtherVersion/{bin/jj,runs/*.txt,probe-colocate{,2,3,4}.sh,probe-remove{,2,3,4}.sh}`.

## Limits

- Two versions only (0.45.1, 0.46.0); the `--no-colocate` pin is detected from help text, so a future help-format change would pin nothing (the key would then flip loudly, not pass silently).
- Sequential single-process drivers: no operation-log merge, no lock/race/throughput measurement.
- Binary provenance is HTTPS-to-github plus self-reported-commit == tag; no published checksum, signature or attestation exists to verify.
- The plain-git ref-write hazard is a hand measurement (probe scripts), not a demo key; the demo reports only gitdir shape.
- Not checked: the other wave-2 subjects (report-receipt-diff, controls, registry rows), and whether J6's set-equality design is the right predicate — I only measured it.

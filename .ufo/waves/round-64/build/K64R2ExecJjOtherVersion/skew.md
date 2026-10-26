# jj version skew, measured: `scripts/jj-seat-demo.sh` on 0.45.1 and on the official 0.46.0 binary

Seat K64R2ExecJjOtherVersion, round 64 wave 2. Lane subject: `scripts/jj-seat-demo.sh` (contract
`kumitate-jj-seat-demo-v2`, first committed at `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`) and the entry
`corpus/knowledge/jj-workspace-seat-containment.md` at the integrated tip `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`
(entry sha256 `4420843074b0ea3efa624b192f2d092f6c1fb914d1adab3dcb02c8305233a81d`, unchanged in the lane working tree).
Nothing in the lane was edited; the drafts below are proposals for the L1.

## Tool record (operator tooling directive, 2026-10-19)

| field | value |
| --- | --- |
| tool | `jj` (Jujutsu) |
| version | `jj 0.46.0-7d382314f9420b4b8d932245b49c99492c812b9f` |
| channel | official GitHub release binary, `jj-v0.46.0-x86_64-unknown-linux-musl.tar.gz` (11 110 358 bytes) |
| source URL | `https://github.com/jj-vcs/jj/releases/download/v0.46.0/jj-v0.46.0-x86_64-unknown-linux-musl.tar.gz` |
| sha256 | `fce0271158e665ceb82dc66c5eb95b1728649094e9133074f3b5baece345fc08` |
| install path | scratch only: `/tmp/kumitate-r64/K64R2ExecJjOtherVersion/bin/jj` (NOT `~/.local/bin/jj`; the lane's commit helper keeps the host 0.45.1) |
| reason | the entry declares "one jj version" as a limit; measure it |

Verification available: the release publishes **no** checksum file, no signature asset and no GitHub attestation
(`gh attestation verify jj-v0.46.0-x86_64-unknown-linux-musl.tar.gz --repo jj-vcs/jj` → `Error: HTTP 404: Not Found`
for `sha256:fce02711…`). The only cross-check performed: the binary's self-reported commit
`7d382314f9420b4b8d932245b49c99492c812b9f` equals `refs/tags/v0.46.0` in `jj-vcs/jj`
(`https://api.github.com/repos/jj-vcs/jj/git/ref/tags/v0.46.0` → `commit 7d382314f9420b4b8d932245b49c99492c812b9f`).
No pacman transaction was run.

## 1. The 21 keys, three runs per binary

```
$ PATH=<scratch bin>:$PATH bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/jj-seat-demo.sh   # x3 per binary
host 0.45.1: exit 0 x3, output identical x3;  0.46.0: exit 0 x3, output identical x3
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

20 of 21 keys identical; the 21st (`seat_has_git_dir`) flips. Every other key, including the four stale/fresh keys and
`update_stale_abandoned_seat_file=deleted-no-recovery-commit`, is byte-identical, so the `working copy is stale` wording
the demo greps for is unchanged in 0.46.0.

### What changed and why

0.46.0 release notes: "`jj workspace add` supports `--colocate`/`--no-colocate` flags… The default colocates when the
current workspace is colocated and the `git.colocate` config is `true`" and "`jj workspace forget` removes the
corresponding Git worktree when one exists". Measured:

```
$ jj config get git.colocate                       # 0.46.0, JJ_CONFIG=/dev/null
true
$ jj workspace add <seat>                          # colocated default repo
Created Git worktree for the new workspace.
Created workspace in "../../tmp.aysO0WbYCH/seat1"
$ cat <seat>/.git
gitdir: ../../tmp.G88taMxyab/.git/worktrees/seat1
$ git -C <seat> rev-parse --git-dir
/tmp/tmp.G88taMxyab/.git/worktrees/seat1
$ git -C <default> worktree list
/tmp/tmp.G88taMxyab       7e04052 (detached HEAD)
/tmp/tmp.aysO0WbYCH/seat1 7e04052 (detached HEAD)
```

The demo's fixture is colocated (`git init` then `jj git init`), so on 0.46.0 the seat is a **git worktree of the one
repository**. Containment consequence, measured inside the seat with plain git and no jj:

```
$ (cd <seat> && git commit -qm 'seat plain-git commit'); echo $?        -> 0
$ (cd <seat> && git update-ref refs/heads/seat-leak HEAD); echo $?      -> 0
$ git -C <default> branch -a                                            -> * (no branch) / seat-leak
$ jj -R <default> --ignore-working-copy log -r 'all()' -T description   -> (no 'seat plain-git commit')
$ (cd <seat> && jj status)  -> "Reset the working copy parent to the new Git HEAD."
```

So a colocated seat writes the shared object store and refs, the default jj view does not see the commit, and the seat's
own jj view does. `--no-colocate` (0.46.0+) and `--config git.colocate=false` both restore `seat_has_git_dir=no`; a
non-colocated default repo (`jj git init --no-colocate`) also gives a seat without a `.git`. 0.45.1 has neither flag
(`error: unexpected argument '--no-colocate' found`).

### Does the entry survive?

The entry's `## Demo outcomes` states `seat_has_git_dir=no` and its prose says "the seat directory has no git directory of
its own". That statement is **false on 0.46.0** in the demo's own fixture. Because the frozen counter J6 compares the
entry's stated keys to a live run set-equal, the claim fails as declared on 0.46.0:

```
$ PATH=/tmp/kumitate-r64/K64R2ExecJjOtherVersion/bin:$PATH \
  node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
JJ64_UNMET held=7/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=J64 | J6 MISS seat_has_git_dir:stated=no:live=yes
exit 1
$ node …jj64-probe.mjs … 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8      # host jj 0.45.1
JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=J64
exit 0
```

Every other entry sentence survives: the four stale/fresh outcomes, the op-log delta, `--ignore-working-copy`,
`update-stale` file fate, cross-abandon, forget reachability and directory presence are unchanged on 0.46.0.

## 2. `jj workspace remove` on 0.46.0 and S200's sentence

S200 capture (`.ufo/waves/round-64/build/Capture/jj-v0.46.0-working-copy.html`, pin sha256 `947d0c56…`) reads: "Use
`jj workspace remove` to forget a workspace and remove its directory from disk. **Tracked changes are snapshotted before
the directory is removed, but ignored files in that directory are deleted.** The main workspace cannot be removed.
Removing the current workspace works on Unix…". The sentence is **demonstrable**, in its sharper form (a file the seat
never snapshotted):

```
$ jj workspace remove seat1                                    # colocated seat
Removed Git worktree for "/tmp/tmp.6vALCiNfLY/seat1".
Removed workspace directory "/tmp/tmp.6vALCiNfLY/seat1".        exit 0
$ ls -d <seat1>                                                 -> absent
$ jj op log -n 4 -T 'id.short()++" | "++description'
d9a3f190aed6 | remove workspace seat1
de2181e857d3 | snapshot working copy
…
$ jj file show -r <seat-change> root:late.txt                   -> written but never snapshotted
$ jj file list -r <seat-change> | grep -c ign.tmp               -> 0        (ignored file not snapshotted)
$ jj file show -r <seat-change> root:ign.tmp
Error: No such path: …/ign.tmp                                  (ignored file dies with the directory)
```

Op-count delta across `remove` with an unsnapshotted file present: 7 → 9 (two operations: `snapshot working copy`, then
`remove workspace u`); the removed workspace's change id stays in `all()`.

Refusals measured by hand on 0.46.0:

| case | result |
| --- | --- |
| stale seat (`abandon` its head first) | exit 1, `Error: The working copy is stale (not updated since operation …)`; directory kept |
| main workspace | exit 1, `Error: Cannot remove workspace 'default' because it contains the repository` |
| directory already deleted by hand | exit 1, `Error: Cannot access workspace 'gone' directory … Hint: Use jj workspace forget` |
| the current workspace, from inside it (Unix) | exit 0, `Warning: The current workspace 'cur' no longer exists after this operation. The working copy was left untouched.`, directory removed |
| `forget` on a colocated seat | exit 0, `Removed Git worktree for "<path>"`; directory and files stay (`.jj base.txt gitonly.txt`), seat `.git` gone, `git -C <seat> rev-parse --git-dir` → `fatal: not a git repository` |

On 0.45.1 every `remove` invocation is `error: unrecognized subcommand 'remove'` (exit 2) and
`jj workspace --help | grep -c '^  remove'` = 0.

## 3. Proposed demo patch (v3) and its effect

`jj-seat-demo.v3-draft.sh` + `jj-seat-demo.v3.patch` (unified diff against the integrated v2, 128 lines). Two changes,
both strengthening:

1. **Pin non-colocation where the version supports it.** `WSADD=(--no-colocate)` when `jj workspace add --help` lists the
   flag; every `workspace add` in the fixture passes it. The 21 `JJ_SEAT:` keys are then version-stable (the fixture no
   longer silently measures a colocated seat on 0.46.0).
2. **Report version-dependent facts as `JJ_SKEW: <key>=<value>` lines.** J64's J6 reads only `^JJ_SEAT: ([a-z0-9_]+)=`,
   so these lines are informative without making the counter version-dependent. Keys: `jj_version`,
   `workspace_add_no_colocate_flag`, `default_flags_seat_has_git_dir`, `default_flags_seat_gitdir` (shape only:
   `none`/`default-repo-gitdir`), `workspace_remove_supported`, `workspace_remove_dir_after`,
   `workspace_remove_unsnapshotted_change_recovered`, `workspace_remove_ignored_file_in_tree`,
   `workspace_remove_stale_refused`, `workspace_remove_main_refused`. The remove probes are skipped with `n/a` on a version
   without `remove`. A `.gitignore` (`ign*`) added to the base tree so a seat inherits the ignore rule.

Measured behaviour of the draft (3 runs per binary, all exit 0, output identical within a binary):

```
21 JJ_SEAT keys on 0.46.0 == 21 JJ_SEAT keys on 0.45.1 == the entry's ## Demo outcomes   (set-equal)
0.45.1: JJ_SKEW: default_flags_seat_has_git_dir=no   / workspace_remove_supported=no (rest n/a)
0.46.0: JJ_SKEW: default_flags_seat_has_git_dir=yes  / default_flags_seat_gitdir=default-repo-gitdir
        JJ_SKEW: workspace_remove_dir_after=removed / …_unsnapshotted_change_recovered=yes
        JJ_SKEW: …_ignored_file_in_tree=0 / …_stale_refused=yes / …_main_refused=yes
```

Hermeticity of the draft under a hostile caller (cwd inside the lane repo, `TMPDIR` inside the lane, `JJ_USER`,
`JJ_EMAIL`, `GIT_DIR`, `GIT_WORK_TREE` set): exit 0 on both binaries, 21 keys unchanged.

Frozen counter against a scratch clone carrying the draft (`/tmp/…/lane-draft`, commit
`8591d40881c6d7161ba628700c4976783708d6e1` = 2ed8a5f + v3 demo; `f245e32f265453a93379c900030c7a4809076477` = + amended
entry), both binaries:

```
PATH=<0.46.0>:$PATH node .ufo/waves/round-64/probe/jj64-probe.mjs …/lane-draft f245e32f…  -> JJ64_HELD held=8/8  exit 0
node .ufo/waves/round-64/probe/jj64-probe.mjs …/lane-draft f245e32f…                     -> JJ64_HELD held=8/8  exit 0
```

The scratch clone is a fixture; the lane was never committed to and no lane byte was modified
(`git diff 2ed8a5f -- scripts/jj-seat-demo.sh corpus/knowledge/jj-workspace-seat-containment.md` is empty).

## 4. Proposed amendment to the entry (`entry.v3-draft.md`, sha256 `527d83e8…`)

Full-file draft; the version-skew paragraph is replaced by the two paragraphs below, `## Located quotes` gains the three
S200 removal sentences (each ≤ 25 words, each in the pinned capture and in the live page), the decision table gains the
`remove` row and the colocated-seat row, and the Limits bullets are corrected. `source:`, `verified-at:` (date prefix
kept), `recheck:` and all 21 `## Demo outcomes` bullets are unchanged.

> **Version skew (measured on two binaries).** The docs are v0.46.0 (S198, S200 cite the immutable `v0.46.0` path; the
> `latest` alias served the same bytes on 2026-10-25); the host binary is jj 0.45.1. The demo was re-run on the official
> jj 0.46.0 release binary (x86_64-unknown-linux-musl, sha256 `fce0271…`, commit `7d38231…` = the tag `v0.46.0`; the
> release publishes no checksum file, signature or GitHub attestation, so the only cross-check is that the binary's
> self-reported commit equals the tag's) from a scratch PATH: **20 of the 21 outcome keys are byte-identical on both
> versions across three runs each**, and one key is version-dependent. `seat_has_git_dir` was `no` on 0.45.1 and `yes` on
> 0.46.0 because 0.46.0 makes `jj workspace add` create a **Git worktree** for the seat whenever the current workspace is
> colocated and `git.colocate` is true — its default. The demo's fixture *is* colocated, so on 0.46.0 the seat received a
> `.git` file pointing into the default repo's `.git/worktrees/<seat>`: the seat is a git worktree of the one repository.
> The demo therefore pins non-colocation with `--no-colocate` where the version has the flag (0.46.0+), which keeps all 21
> keys version-stable, and reports the version-dependent facts as `JJ_SKEW:` lines that the counter does not read. **The
> containment consequence is not a wording change:** in a colocated seat a process can write the shared git object store
> and refs with plain `git` and no jj at all (measured: `git update-ref refs/heads/seat-leak HEAD` in the seat adds a
> branch to the default repo, while `jj log -r 'all()'` in the default workspace shows no such commit). The stale/fresh
> wording (`working copy is stale`) is identical on both versions; `jj workspace remove` exists only on 0.46.0 and is
> measured below, so no outcome key relies on it. S067 pins the v0.45.1 rendering of the working-copy page.
>
> **Workspace removal (jj 0.46.0).** S200's removal sentences are now demonstrable, and the demo measures them
> (`JJ_SKEW:` lines): `remove` deletes the directory (`workspace_remove_dir_after=removed`) after snapshotting the seat's
> changes — including a file the seat never snapshotted (`workspace_remove_unsnapshotted_change_recovered=yes`) — while
> ignored files die with the directory (`workspace_remove_ignored_file_in_tree=0`). A stale seat and the main workspace are
> refused (`workspace_remove_stale_refused=yes`, `workspace_remove_main_refused=yes`); removing the current workspace from
> inside it works on Unix. `forget` on a colocated seat removes the Git worktree registration and the seat's `.git` file and
> leaves the directory and files.

## Limits of this measurement

- Two versions only (0.45.1, 0.46.0); 0.44.x and anything newer are unmeasured. The `--no-colocate` detection reads the
  `jj workspace add --help` text, so a future help-format change would silently pin nothing (the key would then flip, not
  pass silently).
- Sequential single-process drivers, as in the entry: no operation-log merge, no lock or race measurement.
- The binary's provenance is HTTPS-to-github plus a self-reported-commit/tag equality; there is no published checksum,
  signature or attestation to verify against.
- The plain-git ref-write hazard is measured by hand (probe scripts in scratch) and is **not** a demo key; the demo reports
  only the gitdir shape.
- The removed seat's content is recoverable only by change id while the commit is reachable; nothing here measures
  reachability after `jj abandon`/gc.

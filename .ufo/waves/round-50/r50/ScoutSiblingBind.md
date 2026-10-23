# ScoutSiblingBind — sibling records of bind-mount / tmpfs masking

Seat: ScoutSiblingBind (read-only). Lane: kumitate. Date: 2026-10-23.
Question: what have other lanes already recorded, in `corpus/knowledge` and `corpus/lessons`, about bind-mount / tmpfs masking (the class behind cap-run `--tmpfs /tmp` then a later `--bind` re-exposing host `/tmp`, and mountinfo as the way to see it)?

Axes: coverage of sibling knowledge+lessons; operability of cited paths. No tools installed. No lane or sibling files edited except this report.

## Verdict

**No sibling has recorded this hole.** Zero hits in any sibling `corpus/knowledge` or `corpus/lessons` for `cap-run`, `--bind /tmp`, or bubblewrap "argument order" / "filesystem actions apply in argument order". The closest records use the same primitives (tmpfs overlay hides the path under it; a later or separate bind is a different mount; `/proc/self/mountinfo` is how you see a mount stat cannot see) but none states that a bind **after** `--tmpfs` on the same path undoes the mask.

Confidence: high for that absence inside knowledge+lessons. Not scanned: sibling `.ufo/waves` scratch and `corpus/live` dumps (the prescribed grep's 3244 hits are almost all audio sox logs; see Method).

## Method

From `/home/vgpnk/Projects/shokunin/kumitate-shokunin`:

```
grep -rn 'tmpfs\|--bind\|mountinfo' ../*-shokunin/corpus 2>/dev/null | head -40
# then wc -l of the same grep
```

First 40 lines are all `audio-shokunin/corpus/live/r67-boundary/runs/edge_matrix*.txt` — a sox probe column named `tmpfs` (copy the file onto `/dev/shm`). Total lines: **3244**. That probe does not record bind-mount masking. It was not treated as the class.

Filtered census (knowledge + lessons only, `*.md`/`*.txt`, kumitate excluded):

```
grep -RInE --include='*.md' --include='*.txt' \
  'tmpfs|--bind|mountinfo|bubblewrap|bwrap|bind-mount|bind mount|ro-bind' \
  ../*-shokunin/corpus/knowledge ../*-shokunin/corpus/lessons
```

125 matching lines, 64 files, 16 lanes. Then a second pass for `cap-run`, `--bind /tmp`, `argument order`, and `filesystem actions apply` over the same two trees: **no matches**.

Lanes with a knowledge and a lessons dir but **zero** hits on the first pattern: `game-dev-2d`, `lore`, `revenger`.

## Same-mechanism records (tmpfs hides what is under the mount point)

### kotoba — tmpfs over a host directory hides it

`kotoba-shokunin/corpus/knowledge/independent-verification-round12.md:110-115`

> pointer resolution is host-anchored, so a clone's green verdict is **not hermetic**. Hidden behind a private tmpfs over the host `.ufo` (`unshare -rm`), the W1 clone goes from 0 dead to **24/24 dead** and W0 from 10 to **19/19 dead**

Observed: a tmpfs mounted on a path masks the host directory (pointers go dead). Not recorded: a later bind of that same path putting the host directory back. Not bubblewrap. Not `/tmp`.

### mado — `--tmpfs /run` is how they keep host `/run` out

`mado-shokunin/corpus/lessons/round-26-verifier-spotcheck.md:125-127`

> `harness/oracle.py` … `bwrap --unshare-all --tmpfs /run --clearenv --dev-bind /dev/dri/renderD129 …`, private `XDG_RUNTIME_DIR`, no host `/run/user`

`mado-shokunin/corpus/lessons/round-26.md:25` (M26-1): nested Hyprland runs inside bubblewrap with no host `/run` and a cleared env.

Observed: mado treats `--tmpfs /run` as the mask that stops the sandbox seeing host `/run`. They do not record a following `--bind` of `/run` (or `/tmp`) undoing it. The quoted argv puts `--tmpfs /run` and does not re-bind `/run`.

### tsukuroi — overlay-on-symlink lands on the target; tmpfs is the stand-in root

`tsukuroi-shokunin/corpus/knowledge/boot-chain-r17.md:54-58`

> Emulation in an unprivileged user+mount namespace (tmpfs standing in for btrfs) … `mount --move <R>/new_root` succeeds; the overlay mounted on `<R>/new_root` appears on `<R>/sysroot` … The emulated root was a writable tmpfs, so it shows the path handling, not a read-only root made writable

Adjacent, not the hole: mount-on-a-symlink follows the link; a writable tmpfs root is not a masked host `/tmp`.

`tsukuroi-shokunin/corpus/knowledge/root-dac-correction-r13.md:103-104`: systemd `BindReadOnlyPaths=` "creates a read-only bind"; `TemporaryFileSystem=` is a tmpfs that is **not** read-only unless `ro` is passed. Different tool (systemd.exec), same two primitives, no argument-order interaction recorded.

`tsukuroi-shokunin/corpus/lessons/round-26.md:136`: cross-lane note that host `/tmp` is now an xfs partition (`systemctl show tmp.mount`) while mori's corpus still calls it tmpfs. That is host fstype, not a bwrap mask. [INFERENCE] It does not weaken kumitate's hole: cap-run's own `--tmpfs /tmp` creates the mask regardless of what the host mounted at `/tmp`.

## Bind-mount records (alias / capability, not unmask-after-tmpfs)

### chousa — bind alias is invisible to stat; mountinfo is the named next probe

`chousa-shokunin/corpus/knowledge/mount-alias-r14.md:14-17,39-41`

> a tmpfs mounted inside an unprivileged user+mount namespace over an in-root directory reads `observed=supported` CLEAN at the pre-round gate
> Same-device binds are stat-invisible: a bind within one filesystem presents identical st_dev and nlink; only /proc/self/mountinfo path-walking could see it (r15+ candidate). The r14 class is CROSS-DEVICE aliases only

`chousa-shokunin/corpus/knowledge/hardlink-alias-r13.md:45-47`: "a same-device bind of an out-of-corpus tree presents nlink=1 entries; the mount boundary is invisible to stat."

`chousa-shokunin/corpus/knowledge/hardening-r10.md:494-503` (round-14 addendum E3): cross-device mount aliases closed; same-device binds stay "stat-invisible — only mountinfo path-walking could see them".

`chousa-shokunin/corpus/lessons/2026-10-19-hardlink-alias-boundary.md:21-22`: "same-device bind mounts (nlink=1 — the mount boundary is stat-invisible)".

This is the fullest sibling write-up of bind + tmpfs + mountinfo. The threat is a **corpus source alias** (read a file that is not really in-root), not a sandbox mask undone by a later `--bind`. They explicitly left same-device binds open and named mountinfo as the way to see them. They did not record bwrap option order.

### mado — bind mounts need CAP_SYS_ADMIN in the user ns; mountinfo leaks the bind path

`mado-shokunin/corpus/knowledge/tripwire-precision-r20.md:92-95`

> `[ -e "$p" ] && mount --bind … && echo armed`; the mounts failed (unprivileged `--map-current-user` gives no CAP_SYS_ADMIN in the mount namespace's owner; S109, S112) and the payload … ran.

`mado-shokunin/corpus/lessons/round-20.md:56` (S112, man-pages user_namespaces.7:277-280): "Holding CAP_SYS_ADMIN within the user namespace that owns a process's mount namespace allows that process to create bind mounts".

`mado-shokunin/corpus/lessons/round-25.md:23` (M25-2): case dir `cases/<LABEL>/home` "appears in `/proc/self/mountinfo` inside the sandbox, so a tool can learn the case type". Repeated at `round-25-verifier-spotcheck.md:79` and `:200`. They cite mori's class name, not a mount-order rule.

Observed: mado already knows (1) an unprivileged user ns cannot `mount --bind` without CAP_SYS_ADMIN, (2) bubblewrap's own bind of the case tree is visible in mountinfo. They do not record host `/tmp` being re-exposed.

### kagi — realpath does not see a bind

`kagi-shokunin/corpus/knowledge/adjacency-scope.md:227-229`

> `realpath` is the only link test … A hardlink to an owned file is indistinguishable from the file; a bind mount is not detected

### mori — mountinfo field grammar, not field 5 as "the mount point", and not binds

`mori-shokunin/corpus/lessons/round-23.md:48` (S082, linux v7.2 `Documentation/filesystems/proc.rst:1985`): "Parsers should ignore all unrecognised optional fields." Scope line: "Admit A for mountinfo field layout only; no last-line ordering or escape guarantee inferred."

`:50` S084 tmpfs.rst:132-134 quota accounting. `:52` S086 `mm/shmem.c:4878-4879` usrquota emission. `:51` S085 `fs/proc_namespace.c:172` the `" - "` separator, "not topology inferred from ordering".

`mori-shokunin/corpus/lessons/round-34.md:104`: "mountinfo-path live mutants" of a counter; no masking rule in the lesson sentence.

`mori-shokunin/corpus/lessons/2026-10-15-forgeable-oracle-visible-fixtures.md:1`: class is "a fixture oracle can be forged when the system under test can see which case is running" — path/env identity leak, not a mount. mado applied that class to mountinfo (above). Mori's own note does not mention mountinfo.

Mori's tmpfs hits in `corpus/knowledge/surfaces-r7.md:128,157` and `surfaces-r8.md:86` are `io_avg_unavailable=tmpfs:not-a-block-device` for `/tmp`. Accounting, not masking.

## Same manual, different sentence (tameshi S093 = kumitate S095 bytes)

`tameshi-shokunin/corpus/lessons/round-30.md:36-40` and `:57-58`

Fetched `https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml`, sha256 `2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da` (33289 B). Located quote is **bwrap.xml:159** (`--unshare-all` namespace list), not the filesystem-action order / bind / tmpfs spans. Erratum: `:42` of `regression-tally-completeness.md` said "cleared environment"; **bwrap.xml:233-235** says `--clearenv` keeps PWD. Spot-check agrees: `corpus/lessons/round-30-verifier-spotcheck.md:159,162`.

`tameshi-shokunin/corpus/knowledge/hermetic-env-differential.md:26-27`: selftest in "a fresh bwrap scratch with a read-only root, private writable `/tmp/w`, and no network."

`tameshi-shokunin/corpus/knowledge/guard-kill-closure.md:129`: probes use "a private /tmp, and isolated PID and network namespaces" and "the envelope is a sandbox for the probes, not a proof of containment."

`tameshi-shokunin/corpus/lessons/round-18.md:27` (G10): "a /tmp clone with live sibling symlinks is not a write boundary."

`tameshi-shokunin/corpus/lessons/round-33.md:80-83,99-102`: v1 ran the auditor with **no bwrap**; `block_run` exec'd `timeout` "inside a mount-less sandbox". Fixed with "read-only runtime mounts". They hit a missing-mount failure, not a bind that punches through a tmpfs.

[INFERENCE] Tameshi already pinned the same bwrap 0.13.1 manual kumitate cites as S095, and already runs bwrap with a private `/tmp`, but the recorded sentences are namespace unshare, `--clearenv`, and "private /tmp". Nobody there wrote down that a caller-supplied `--bind /tmp` after `--tmpfs /tmp` puts the host directory back.

## Not this class (so they are not prior art for the guard)

| Lane | Path | What the word actually is |
|---|---|---|
| audio | `corpus/live/r67-boundary/`, `r77-scout/RECEIPTS.md:66`, `r82-fold/proofs.txt:45` | sox probe backend named `tmpfs` (`/dev/shm`); `/tmp` 16G full ("Disk quota exceeded") |
| game-dev-3d | `corpus/knowledge/unreal-mcp/gate/README.md:58,70` | `/tmp` is a shared 16G tmpfs; scratch filled it |
| kaidoku | `corpus/knowledge/2026-10-13-r2-version-diff-compare.md:18`; `corpus/lessons/round-20.md:34,102` | `bwrap` ELF 0.11.2→0.12.0 diff; later "bwrap is NOT installed" was a stale `set -e` probe (`/usr/bin/bwrap` 0.13.1 exists). No mount rule |
| kaidoku, kama, tabi | several `http.server --bind` / `serve --bind=` lines | listen address, not a mount |
| kake | `corpus/lessons/round-41.md:60` | tool can read bwrap's `/proc/1/environ`; not mounts. `round-42.md:54` reads CPU from bwrap `RUSAGE_CHILDREN` |
| kake, kasegi, tabi, tameshi r1 | lessons on evidence pointers | "no tmpfs path as a committed pointer" (PROTOCOL), not masking |
| kotodama | `corpus/lessons/round-9.md:22`, `round-10.md:24` | `/tmp` tmpfs inodes 100% full |
| souji | `corpus/knowledge/quarantine-same-filesystem-rename.md:49` | fixture file on `/dev/shm` vs btrfs |
| tsukuroi | `kill-event-deep-r8.md:184`, `oom-event-plane.md:303` | `/tmp` 16G tmpfs as memory pressure |

## What kumitate would be adding

[INFERENCE] The round's mount-order rule (filesystem actions apply in argument order; `--tmpfs /tmp` masks host `/tmp` unless a later `--bind` re-exposes it; mountinfo field 5 is the mount point; refuse the `/tmp` mount point, not subdir binds) is **not** already written in any sibling knowledge entry or lesson. Reusable adjacent facts, already mined elsewhere:

- tmpfs-on-a-path hides the directory under it (kotoba r12; mado's `--tmpfs /run`).
- same-device bind is invisible to `stat`/`realpath`; mountinfo path-walking is the detector chousa named and did not land (chousa r13–r14; kagi adjacency bound 8).
- creating a bind needs CAP_SYS_ADMIN in the user ns that owns the mount ns (mado S112) — which is why **bwrap** performs the bind, and a refusal has to be in the argv builder, not in a later `mount(2)` from the child.
- the bwrap 0.13.1 manual body sha `2cb77df2…be1da` is already tameshi S093; their quotes are `:159` and `:233-235`, not the bind/tmpfs order spans.

## Unknowns

- Sibling `.ufo/` wave scratch and `corpus/live` were not read through (3244 raw grep lines, dominated by audio). A one-off note could exist there and never have been promoted. Not found in knowledge or lessons.
- Whether chousa ever landed the r15+ same-device-bind / mountinfo walker was not chased past the r14 "candidate" sentence. Not required for this class: that walker would see binds, it would not state bwrap argument order.

RESULT ScoutLiveSurface verdict=SP491-diverges

Live SP491 does not behave the same inside `scripts/cap-run.mjs`'s sandbox. Live SP519 does, if the three `UFO_*` variables the probe already sets are passed as `--env`. No extra `--bind` fixes SP491: cap-run refuses binds under `/run`, and the node binary that works is already on the ro-bound `/`.

## Origin the lane uses

Live mode is the default (not `--selftest`, not `--checklists`). `--checklists` returns before `--src` is resolved (`scripts/surface-probe.mjs:1831-1832`). SKILL.md items 3, 8, 10 and 14 are pin-aware (`SKILL.md:673-677`); the live readers are `bash <src>/scripts/ufo-sighting surface --json` and `node <src>/scripts/fleet-dispatcher.mjs status` (`SKILL.md:784-787`, `scripts/surface-probe.mjs:483-539`).

Resolution (`scripts/surface-probe.mjs:156-169`, `:1834-1846`): an active `.ufo/pins/origin.json` wins, else `$UFO_SRC`, else the first existing of `~/Projects/ufo-fsd-alpha` and `~/Projects/origin-work/ufo-fsd-alpha`.

This lane's pin is present. `$UFO_SRC` is unset. The pin clone exists and `git -C` HEAD matches the pin.

| | |
|---|---|
| pin | `.ufo/pins/origin.json` (`kumitate-origin-pin-v1`) |
| clone | `/fast/scratch/hyaku/kumitate-pin/src` |
| revision | `31c465f15669f744848bd9f5d56191c5085670f7` |
| mode | `555` (read-only; `.ufo/` absent) |
| fallback if the pin were absent | `/home/vgpnk/Projects/ufo-fsd-alpha` (exists). `~/Projects/origin-work/ufo-fsd-alpha` is absent |

Source below is that pin clone, not the writable Projects tree.

## What the two children do

Sandbox contract (`scripts/cap-run.mjs:14-36`, argv at `:183-190`): `ro-bind /`, `--dev /dev`, `--proc /proc`, fresh `--tmpfs /tmp` and `--tmpfs /run`, `--bind <cwd> <cwd>`, `--clearenv` leaving `PATH` (`<dir of resolved cmd>:/usr/bin`), `PWD`, and `--env` pairs, `--unshare-pid`. `--bind` refuses `/`, `/proc`, `/sys`, `/dev`, `/run` (`:123-130`). No `--unshare-net`.

### SP491 — `readSightingSurface` (`scripts/surface-probe.mjs:483-506`)

`bash <src>/scripts/ufo-sighting surface --json`, cwd=`<src>`, env=`process.env` plus `NODE_COMPILE_CACHE=<os.tmpdir()>/kumitate-surface-cache-*`.

The shim (`scripts/ufo-sighting:10-24`, `:95`) `readlink -f`s itself, sets `NODE_COMPILE_CACHE` to `$ROOT/.ufo/cache/node-compile` only when unset, and `exec node` **by PATH name**. It execs `tmux` only when `UFO_SIGHTING_ATTACH=1` and there are no args (`:26-35`); this launch passes args. Import-time boot reads `config/ufo.json` and `config/ephemeral-l1.machine.json` (`scripts/ufo-sighting-lib/base.mjs:17`, `:148-225`, `:254-260`). `surfaceManifest()` re-reads `config/ufo.json` and the shim plus `ufo-sighting.mjs`, `base.mjs`, `argv.mjs`, `observe.mjs`, `surface.mjs` (`scripts/ufo-sighting-lib/surface.mjs:13-45`, `:59-62`) and writes JSON to stdout (`:317-318`). No `HOME`, `XDG_*`, tmux socket, or network on this verb.

Host strace (`timeout -k 10 40 strace -f -e trace=execve,connect,sendto,sendmsg,bind,mkdir,unlink,rename,openat`): exit 0, 13141-byte stdout, **zero** connect/sendto/sendmsg/bind. Exec chain: `/usr/bin/bash` → `/usr/bin/readlink` → `/usr/bin/dirname` → `node …/ufo-sighting.mjs surface --json`. Writes: only `mkdir` + `rename` under the `NODE_COMPILE_CACHE` dir. Reads: the six scripts above plus the two config files, `/dev/null`, `/dev/tty`.

### SP519 — `readDispatcherStatus` (`scripts/surface-probe.mjs:509-539`)

`process.execPath <src>/scripts/fleet-dispatcher.mjs status`, cwd=`<src>`, env=`process.env` plus

- `UFO_STATE_DIR=<os.tmpdir()>/kumitate-surface-state-*/ufo` (parent does not mkdir this)
- `UFO_PENDING_WORK_PATH=$UFO_STATE_DIR/pending-work.json`
- `UFO_PROJECT_ROOT=<src>`

`process.execPath` here is `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` (realpath; the `/run/user/1000/fnm_multishells/…/bin/node` entry is only a PATH symlink).

Startup (`scripts/fleet-dispatcher.mjs:41-42`, `:88-100`, `:458-462`, `:8949-8955`): `ROOT`/`UFO_STATE` from those env vars; `assertLedgerPath` **mkdirs** `dirname(LEDGER_PATH)` mode `0700` (`$UFO_STATE_DIR`); `assertQueuePath` mkdirs the pending-work parent (same dir) because `UFO_PENDING_WORK_PATH` is set (`:4012-4015`, `:8953`); `sweepOrphanTmpFiles` readdirs queue/ledger/observations/archive dirs and **unlinks** stale orphan tmps older than 60s (`:8902-8933`). On a fresh dir that sweep deletes nothing.

`status` (`:9022-9067`) then reads, and does not write, the throwaway:

- `config/ufo.json` (`CONFIG_PATH`)
- missing `$UFO_STATE_DIR/sighting/manifest.json` (`MANIFEST_PATH`, `:91`)
- missing `$UFO_STATE_DIR/fleet-ledger.jsonl` and `.1`…`.5` (`fleet-ledger-read.mjs:576-615`)
- missing `$UFO_STATE_DIR/fleet-ledger-rotation.jsonl` (`:644-647`)
- missing `$UFO_STATE_DIR/pending-work.json` → in-memory empty queue (`:4496-4502`), no create
- missing `$UFO_STATE_DIR/pending-work-archive.jsonl` and `$UFO_STATE_DIR/archive/` (`:3376-3377`, `:3757`, `:3798-3801`)

`routingHealth` → `loadDispatchPolicy` throws `sighting.dispatch.queuePath must stay under .ufo` (`:3265-3267`) because the pin's `queuePath` is `.ufo/pending-work.json` (`config/ufo.json:73`) and that path is not under the throwaway `UFO_STATE`. The throw is caught; status still exits 0 with `routing.ok: false`. `resolveFleetAliasRouting` / `HOME` / `~/.omp/agent/config.yml` (`scripts/omp-global-config.mjs:27-34`, `:327-332`) are **not** reached. `node:sqlite` is imported (`fleet-dispatcher.mjs:25`) but no database is opened. No tmux, no `XDG_RUNTIME_DIR`, no network. `log()` (ledger append) runs only on the crash path.

Host strace of this launch: exit 0, one write (`mkdir` of the throwaway `ufo` dir), module reads of `fleet-dispatcher.mjs` plus `fleet-ledger-read.mjs`, `fleet-ledger-rotate.mjs`, `omp-global-config.mjs`, `omp-route-grammar.mjs`, `ufo-credential-screen.mjs`, `ufo-mission-{result,observation,activity,lifecycle}.mjs`, and `config/ufo.json`. Open of the throwaway `sighting/manifest.json`, `sighting/`, `archive/`. Zero network syscalls. `~/.omp/agent/config.yml` was not opened.

## Same inside the sandbox?

Compared with `bwrap` using cap-run's mount and env flags (no systemd scope). Pin cwd bound. Throwaway paths left on the host `/tmp` (hidden by `--tmpfs /tmp`).

| launch | result |
|---|---|
| SP491, cap-run PATH=`/usr/bin` (bash's dir), `NODE_COMPILE_CACHE` set | **exit 127**, stderr `scripts/ufo-sighting: line 95: exec: node: not found`. `/usr/bin/node` does not exist |
| SP491, `PATH=<real node dir>:/usr/bin` plus `NODE_COMPILE_CACHE` | **exit 0, stdout sha256 `2d98e0b6fadd919b` matches the host** (13141 bytes). Host cache dir was not written (5 files before and after); cache writes stayed in the private tmpfs |
| SP519, three `UFO_*` set, no `HOME` | **exit 0, stdout sha256 `9874b8874c1e5dd3` matches the host** (1734 bytes, `routing.ok false` with the queuePath message). Host state dir gained nothing from the sandbox |
| SP519, same plus `HOME=/home/vgpnk` | same sha. `HOME` is not on this path |
| SP519, no `UFO_*` (PATH/PWD only) | **exit 1**. `EACCES: permission denied, mkdir '/fast/scratch/hyaku/kumitate-pin/src/.ufo'` then a ledger-append failure. The pin is mode `555`; a read-write cwd bind does not override that. The probe does not launch this way |

`type -a node` on this host: first hit `/run/user/1000/fnm_multishells/3080862_1792736886849/bin/node` (hidden by `--tmpfs /run`), then `/home/vgpnk/.local/share/mise/installs/node/latest/bin/node`. Passing the **host** `PATH` through a later `--setenv PATH` (bwrap keeps the later one; checked) falls through the missing `/run` dir and runs mise `v26.12.0`. cap-run's own PATH for a `bash` command is only `/usr/bin`, so that fallthrough does not happen unless the router passes `PATH`.

## need → path → visible in sandbox? → bind needed?

| need | path | visible? | bind? |
|---|---|---|---|
| SP491 interpreter | `/usr/bin/bash`, `/usr/bin/readlink`, `/usr/bin/dirname` | yes (ro-bind `/`) | no |
| SP491 `exec node` | name `node` on `PATH`. No `/usr/bin/node`. Live PATH's first hit is `/run/user/1000/fnm_multishells/…/bin/node` | **no** under default PATH=`/usr/bin`; the `/run` symlink is covered by tmpfs and `--bind` of `/run` is refused | **no bind**. Pass `PATH` that contains a node outside `/run` and `/tmp` (mise `…/installs/node/latest/bin` or fnm `…/node-versions/v24.21.0/installation/bin`, both under `/home/vgpnk/.local/share`) |
| SP519 interpreter | `process.execPath` = `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node` | yes. cap-run realpath's it and puts that dir on `PATH` | no |
| origin bytes (both) | `/fast/scratch/hyaku/kumitate-pin/src` (`scripts/ufo-sighting`, `scripts/ufo-sighting.mjs`, `scripts/ufo-sighting-lib/{base,argv,observe,surface}.mjs`, `config/ufo.json`, `config/ephemeral-l1.machine.json`; SP519 also the dispatcher and the imported `scripts/*.mjs` listed above) | yes (cwd bind, mode `555`) | no. Already the cwd bind. Do not expect writes there |
| SP491 compile cache | `NODE_COMPILE_CACHE` = `/tmp/kumitate-surface-cache-*` (shim default `$ROOT/.ufo/cache/node-compile` is not used when this is set) | the host dir is **not** visible (fresh `/tmp`). Node recreates it on the private tmpfs; stdout unchanged | no, for equal stdout. Bind only if the cache files must land on the host dir (the probe deletes that dir in `finally`) |
| SP519 state root | `/tmp/kumitate-surface-state-*/ufo` and `pending-work.json`, `fleet-ledger.jsonl` (+`.1`–`.5`), `fleet-ledger-rotation.jsonl`, `sighting/manifest.json`, `pending-work-archive.jsonl`, `archive/` | host dir not visible. Child `mkdir`s the same path on the private tmpfs; missing files stay missing; stdout matches | no |
| SP519 configured queue (not used for the read) | `<pin>/.ufo/pending-work.json` | the pin has no `.ufo`. Containment vs the throwaway fails; `routing.ok` is already false on the host | no |
| global OMP config | `/home/vgpnk/.omp/agent/config.yml` (needs `HOME`; `scripts/omp-global-config.mjs:331-332`) | would be visible via ro-bind `/` | not consulted on this launch |
| `HOME`, `XDG_RUNTIME_DIR`, tmux socket, dbus | `/home/vgpnk`, `/run/user/1000`, tmux under `/tmp` | `/run` and `/tmp` hidden; `HOME` dropped by `--clearenv` | no. Neither verb uses them when launched as the probe launches them |
| `/dev/null`, `/dev/tty` | `/dev/*` | yes (`--dev /dev`). SP491 opens both | no |
| `/proc` | private pid namespace | host processes not visible | no. Neither verb scans host pids |
| network | (none) | network namespace is shared, but both traces had zero connect/send | no |

## Operability

Routing SP491 as `bash <shim> …` through cap-run without an explicit `PATH` `--env` changes exit 0 into exit 127. Routing SP519 as `process.execPath <dispatcher> status` with the three `UFO_*` `--env`s keeps exit 0 and the same stdout, and does not need a bind of the throwaway state dir. Dropping those three variables makes status try to mkdir the read-only pin's `.ufo` and exit 1.

No tools installed. No lane git writes. Throwaway dirs `/tmp/kumitate-r48-scout-fo3mp9uv` and `/tmp/kumitate-r48-strace-o61ws4h2` removed.

Unknown: this scout did not wrap the children in `systemd-run --scope` (cgroup only; mounts and env are bwrap's). A surface-probe parent started under a different `PATH` still breaks SP491 the same way, because cap-run replaces `PATH` with `/usr/bin` whenever the outer command is `/usr/bin/bash`.

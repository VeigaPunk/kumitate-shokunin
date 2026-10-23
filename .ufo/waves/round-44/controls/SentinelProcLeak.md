RESULT SentinelProcLeak rev=292d9266 verdict=UNMET passed=3 cases=87 control_sha256=3d78cc6cb5b3273ac658ff184060a59445ea84519efe90cfaaafeb043a1187ee

# SentinelProcLeak — process and resource review of the frozen C1 counter

Revision 292d92668ff80973547a8b10d12ffb5a48f2d7d8. Counter never edited: `p44b-count.mjs`
sha256 `6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517`, shape
`p44-shape.tsv` sha256 `fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71` (both
re-extracted from the revision and hash-checked). Every scored run:
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node
p44b-count.mjs --census <ctl> --shape p44-shape.tsv --work <seat>/work/<tag>`.
All runs are under /fast/scratch/hyaku/kumitate-r44/seats/SentinelProcLeak; logs kept at
`out/<tag>.txt`. No tool was installed or updated this seat.

## Result: every control read UNMET. No control read MET.

Per-variant verdicts (one scored run each; `passed` is the frozen counter's own count):

    variant          what it does                                   counter line
    procresource     one file, five abuses, shape-dispatched        UNMET passed=3/87   (primary)
    constclean       constant CLEAN, no abuse (baseline)             UNMET passed=13/87
    slow             sleeps 25 s (> 20 s wall limit)                UNMET passed=12/87
    spin             burns CPU 25 s                                 UNMET passed=12/87
    alloc1g          1 GiB native Buffer                            UNMET passed=13/87
    alloc3g          3 GiB native Buffer                            UNMET passed=13/87
    alloc6g          6 GiB native Buffer                            UNMET passed=13/87
    alloc8g          8 GiB native Buffer                            UNMET passed=13/87
    stdoutbp         64 MiB blocking stdout write                   UNMET passed=12/87
    stderrbp         64 MiB blocking stderr write                   UNMET passed=12/87
    hugestdout       64 MiB async stdout, verdict last              UNMET passed=12/87
    hugestdout2      64 MiB async stdout, verdict first             UNMET passed=13/87
    stderrflood      64 MiB async stderr, verdict first             UNMET passed=13/87
    cleanthenflood   verdict first, then 64 MiB blocking stdout     UNMET passed=12/87
    forklinger       detached 120 s child                           UNMET passed=13/87
    forkbomb         300 detached 60 s children                     UNMET passed=13/87
    forkhold         detached child inheriting the stdout pipe      UNMET passed=13/87
    nestedns         nested pid namespace (unshare --fork --pid)    UNMET passed=13/87
    diskwrite        writes into /h /tmp /r / cwd                   UNMET passed=13/87
    tmpfsfill        2 GiB into the sandbox tmpfs                   UNMET passed=13/87
    hangall          per-case unsettled promise                     UNMET passed=0/87
    hangreal         hangs on every case (setInterval)              NO VERDICT LINE AT ALL

## Findings

**F1 — HIGH — the memory limit does not exist; a census allocating gigabytes is not killed and
is scored PASS (exit 0, one `OMP_CENSUS: CLEAN` line, `P44=PASS` on the case).**
The counter passes `--max-old-space-size=256`, which caps only V8's old space. Native `Buffer`
memory bypasses it entirely, and the counter puts no cgroup, rlimit or `bwrap` bound on the
sandbox. Measured inside the sandbox, reporting its own peak: a 6 GiB Buffer got
`rss_bytes=6489337856` (6.05 GiB) with a 20 s wall limit and **exited 0 with CLEAN**; under an
outer `MemoryMax=4G` scope it still reached `rss_bytes=4306698240`; under `MemoryMax=512M` it
reached 516 MB and still exited 0 CLEAN (never OOM-killed). In all four scored runs the
abuse-bearing case reads `CASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS`, i.e. a
census that allocates 1/3/6/8 GiB is scored as a clean, legitimate case. Same class:
`tmpfsfill` wrote 2 GiB into the sandbox tmpfs (host RAM) and still scored PASS. Because the
plan's measurement command is bare `timeout 600 node p44-count.mjs …` with **no** `MemoryMax`,
a runaway or hostile census can consume host RAM (this host: 31 GB RAM, 31 GB swap) during the
counted run — the round-42 failure mode (~25 GB, ~500 processes) is still reachable. Impact: no
discrimination against an allocating census, and host-safety risk on the official run. Smallest
remediation: make `runCase` spawn the case under a cgroup memory ceiling
(`systemd-run --user --scope -q -p MemoryMax=1G bwrap …`) or set `ulimit -v` via a wrapper, and
treat an OOM kill as FAIL; otherwise state in the predicate that the bound is "256 MB V8 old
space" and add the same `MemoryMax` to the plan's measurement command.

**F2 — MEDIUM-HIGH — the 20 s limit is per case with no total budget: 87 × 20 s = 1740 s, longer
than the plan's `timeout 600`. A census that hangs on every case makes the counter print NO
verdict line at all.** Measured with the outer bound set to 60 s (`hangreal`): the counter emitted
2 `CASE` lines and then died, `grep -c P44_COUNT` = **0**, outer exit 137, and 43 files were left
in the work dir. So the counted run can produce neither MET nor UNMET — the receipt would carry no
`P44_COUNT` line for anyone to read, and the kill rules (which are written as comparisons against
a verdict line) cannot be evaluated. Smallest remediation: a total-run deadline in the counter
that prints `P44_COUNT: UNMET` before exiting (e.g. abort the loop at `--budget-ms`, default
below the plan's 600 s), or state the worst case 87 × 20 s in the plan and set the outer timeout
above it.

**F3 — MEDIUM — the counter does not clean its work dir on every failure, only on success and on
ordinary exceptions.** The `finally { rmSync(work) }` cannot run on a signal, and `die()` calls
`process.exit(2)`, which also skips it. Measured: (a) success and normal UNMET runs clean
perfectly — `work_entries=0` after all 20 completed runs; (b) `timeout -s TERM 5` on the counter
— exactly what plain `timeout 600` sends — left **30 entries**, including the census copy at
`c/omp-census.mjs` and the full 38-name mirror under `r/`; (c) SIGKILL left 43; (d) a shape with
one `symlink` row drove `die('unsupported live kind …')` and left 6 entries
(`run-3378099-f4c76842/c/omp-census.mjs`, `r/agent.db`, `r/agent.db-shm`). The residue is empty
files (no content is ever read from the root), so no secret leaks; what leaks is the copy of the
census under test plus the names of every member of `~/.omp/agent`. Accumulation is also a
cross-seat hazard: plan.md's measurement command passes no `--work`, so leaks land in the shared
`/fast/scratch/hyaku/kumitate-r44/p44`. Smallest remediation: `process.on('SIGTERM'|'SIGINT')`
→ `rmSync(work)` then re-raise, and make `die()` remove `work` before `process.exit`.

**F4 — VERIFIED GOOD — process cleanup is sound; nothing survives a case.** Four independent
escape shapes left zero processes: a detached 120 s child, 300 detached children, a child that
inherits the stdout pipe, and `unshare --fork --pid` holding a `sleep 600` in a nested namespace.
After each counter run `pgrep -af omp-census.mjs` → none and `pgrep -af 'R44-SENTINEL'` → none;
an observer 30 s into the `slow` run (10 s after the 20 s timeout fired) found "no census process
alive" and "no bwrap of mine alive". Mechanism: `bwrap --unshare-all --die-with-parent
--new-session` puts the census in a fresh pid namespace, and when the namespace init dies the
kernel kills the members — including a nested namespace's sleeper. The census also cannot reach
host disk: `/r` and `/c` are `--ro-bind`, `/tmp` and `/h` are tmpfs, and the `diskwrite` control
left no file anywhere on the host.

**F5 — VERIFIED GOOD — huge stdout is fail-closed.** `spawnSync`'s `maxBuffer` is 4 MiB;
exceeding it yields `spawn-error:ENOBUFS`, and the case reads FAIL
(`CASE no-sidecars expect=CLEAN exit=spawn-error:ENOBUFS verdict=none P44=FAIL`). Verdict-first
then blocking flood still FAILs (`exit=1 verdict=CLEAN P44=FAIL`), and flood-then-verdict loses
the verdict line and FAILs (`exit=0 verdict=none P44=FAIL`). No flood variant produced a PASS on
an abuse-bearing case except the async-write ones, where the writes are dropped at `process.exit`
before reaching the pipe — i.e. no abuse occurred.

**F6 — INFO — spin and sleep are killed and scored FAIL correctly.** `slow` and `spin` both read
`CASE no-sidecars expect=CLEAN exit=timeout verdict=none P44=FAIL` with no survivors.

**F7 — INFO — observability nit.** `verdict=none` conflates "killed by the wall limit", "killed
by ENOBUFS" and "printed nothing"; the `exit=` token distinguishes them, so this is cosmetic. The
`pgrep` recipe that matches `omp-census.mjs` also matches every other seat's concurrent sandbox,
so any leftover-process check must match on its own work-dir path, not on the census file name.

## Primary control source — ctl-procresource.mjs (sha256 3d78cc6cb5b3273ac658ff184060a59445ea84519efe90cfaaafeb043a1187ee)

```js
// ctl-procresource.mjs — kumitate round 44 CONTROL (skips the claimed census work).
// ONE file, five resource-abuse modes, dispatched ONLY on the mirror's ENTRY and DIRECTORY counts
// (never on member names, kinds or permission bits), so the program encodes no per-member rule.
//
//   26 entries  (no-sidecars case, expects CLEAN) -> allocate 3 GiB of native memory
//   27 entries  (no-chains case,   expects CLEAN) -> fork a detached lingerer, then spin 25 s
//   38 entries + 9 dirs (a kind: case)             -> flood stdout with 64 MiB (blocking writes)
//   39 entries  (a stray/near/gen case)            -> flood stderr with 64 MiB (blocking writes)
//   otherwise                                      -> print the verdict immediately
//
// THE VERDICT IS A CONSTANT: the program always prints "OMP_CENSUS: CLEAN" and exits 0.
// It decides nothing about the mirror's members; the mirror's counts only select which
// resource abuse to exercise.
import { spawn } from 'node:child_process';
import { readdirSync, statSync, writeSync } from 'node:fs';

const MARK = 'R44-SENTINEL-PROC';
const i = process.argv.indexOf('--root');
const root = i >= 0 ? process.argv[i + 1] : '/r';

let names = [];
try { names = readdirSync(root); } catch { names = []; }
let dirs = 0;
for (const n of names) { try { if (statSync(`${root}/${n}`).isDirectory()) dirs++; } catch { /* ignore */ } }

if (names.length === 26) {
  // native memory well past the advertised 256 MB V8 heap cap
  const buf = Buffer.allocUnsafe(3 * 1024 * 1024 * 1024);
  buf.fill(0x41);
} else if (names.length === 27) {
  // fork a detached lingerer, then overrun the 20 s wall limit with a CPU spin
  const child = spawn('/n/bin/node', ['-e', `setTimeout(()=>{},120000); /* ${MARK}-FORK */`], {
    stdio: ['ignore', 'ignore', 'ignore'], detached: true,
  });
  child.on('error', () => {});
  child.unref();
  const end = Date.now() + 25000;
  while (Date.now() < end) { /* burn CPU */ }
} else if (names.length === 38 && dirs === 9) {
  // stdout flood with real back-pressure
  const chunk = Buffer.alloc(1024 * 1024, 0x78);
  chunk[chunk.length - 1] = 0x0a;
  for (let k = 0; k < 64; k++) writeSync(1, chunk);
} else if (names.length === 39) {
  // stderr flood with real back-pressure
  const chunk = Buffer.alloc(1024 * 1024, 0x65);
  chunk[chunk.length - 1] = 0x0a;
  for (let k = 0; k < 64; k++) writeSync(2, chunk);
}

console.log('OMP_CENSUS: CLEAN');
process.exit(0);
```

## Counter stdout, complete — the scored run of that control (log out/procresource.txt, sha256 c40c4edcfa79e6e5c2ff4b1982a7682b6200dc420fbdb2a01e70ada293dbc089)

```
P44 counter=p44b-count.mjs sha256=6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517
P44 census=/fast/scratch/hyaku/kumitate-r44/seats/SentinelProcLeak/ctl-procresource.mjs sha256=3d78cc6cb5b3273ac658ff184060a59445ea84519efe90cfaaafeb043a1187ee
P44 shape=/fast/scratch/hyaku/kumitate-r44/seats/SentinelProcLeak/p44-shape.tsv shape_sha256=fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71 entries=38 base=19 sidecar=12 chain=7 cases=87
CASE crossgen:history.db.corrupt-<D>-<U>-shm expect=DRIFT exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE kind:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE gen:mcp.json.pre-disable-<D>T<D> expect=CLEAN exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE kind:models.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:RULES.md expect=DRIFT exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE gen:history.db.corrupt-<D>-<U> expect=CLEAN exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE near:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:custom-session-files expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:models.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:models.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE gen:agent.db.recovered-<D>T<D>Z expect=CLEAN exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE kind:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-shm expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE crossgen:agent.db.pre-restore-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE mode:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE gen:history.db.corrupt-<D>-<U>-shm expect=CLEAN exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE neardigit:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:models.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE no-chains expect=CLEAN exit=timeout verdict=none P44=FAIL
CASE kind:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:history.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE control expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE mode:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE gen:agent.db.pre-restore-<D>T<D>Z-wal expect=CLEAN exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE near:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE crossgen:agent.db.pre-restore-<D>T<D>Z-wal expect=DRIFT exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE kind:mcp.json expect=DRIFT exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE kind:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:mcp.json.rea.backup expect=DRIFT exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE kind:history.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE mode:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:agent.db expect=DRIFT exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE neardigit:sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE gen:mcp.json.rea.backup.<H>.recovery expect=CLEAN exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE kind:last-changelog-version expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE crossgen:mcp.json.pre-disable-<D>T<D> expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE stray expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:mcp.json.rea.backup expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:custom-session-files expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:hooks expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE crossgen:history.db.corrupt-<D>-<U> expect=DRIFT exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE stray-digit expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:custom-session-files expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:RULES.md expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE crossgen:history.db.corrupt-<D>-<U>-wal expect=DRIFT exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE neardigit:skill-descriptions.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:blobs expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:history.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:mcp.json expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:config.yml expect=DRIFT exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE near:terminal-sessions expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE crossgen:agent.db.recovered-<D>T<D>Z expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE gen:history.db.corrupt-<D>-<U>-wal expect=CLEAN exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE near:cache expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE mode:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:kimi-device-id expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE gen:agent.db.pre-restore-<D>T<D>Z expect=CLEAN exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE mode:agent.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE neardigit:agents expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE kind:models.db expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE gen:agent.db.pre-restore-<D>T<D>Z-shm expect=CLEAN exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE neardigit:predict expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE crossgen:mcp.json.rea.backup.<H>.recovery expect=DRIFT exit=spawn-error:ENOBUFS verdict=none P44=FAIL
CASE near:models.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS
CASE mode:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE near:config.yml expect=DRIFT exit=0 verdict=CLEAN P44=FAIL
CASE control-end expect=CLEAN exit=0 verdict=CLEAN P44=PASS
P44_COUNT: UNMET (passed=3 cases=87 floor=20 census_sha256=3d78cc6cb5b3273ac658ff184060a59445ea84519efe90cfaaafeb043a1187ee)
counter_exit=1
```

## Other controls (source on disk, scored once each, all UNMET)

- `ctl-slow.mjs` 03300040… — sleeps 25 s when the mirror has 26 entries, then CLEAN.
- `ctl-spin.mjs` 5113725f… — busy loop 25 s on the same shape, then CLEAN.
- `ctl-alloc1g.mjs` 66308ac9… / `ctl-alloc3g.mjs` 6dcc4503… / `ctl-alloc6g.mjs` b2b61f2a… /
  `ctl-alloc8g.mjs` 2faac93e… — one native Buffer of that size, `fill`, then CLEAN.
- `ctl-memreport.mjs` 5ab9c9c3… — 6 GiB Buffer and prints its own `rss_bytes` to stderr (the
  instrument behind F1).
- `ctl-stdoutbp.mjs` 7236dcf8… / `ctl-stderrbp.mjs` 8ef61a8d… — 64 MiB blocking writes before
  the verdict; `ctl-cleanthenflood.mjs` c49280ff… does the same with the verdict first.
- `ctl-hugestdout.mjs` a0fabf12… / `ctl-hugestdout2.mjs` 32c683f2… / `ctl-stderrflood.mjs`
  cee6179b… — 64 MiB async writes, verdict last and verdict first.
- `ctl-forklinger.mjs` c0ff8d04… (one detached 120 s child), `ctl-forkbomb.mjs` 544f6c0f… (300),
  `ctl-forkhold.mjs` 38efcd5c… (child inherits the stdout pipe), `ctl-nestedns.mjs` 73979f30…
  (`unshare --fork --pid --mount-proc sleep 600`).
- `ctl-diskwrite.mjs` b8e792bf… — writes to `/h`, `/tmp`, `/r`, `/`, cwd; `ctl-tmpfsfill.mjs`
  a25ed5ec… — 2 GiB into the sandbox tmpfs.
- `ctl-constclean.mjs` c9847d98… — baseline, no abuse. `ctl-hangall.mjs` 5e6ed3d4… — per-case
  unsettled top-level await (Node exits 13, so every case FAILs). `ctl-hangreal.mjs` fe74a009… —
  `setInterval` hang, the instrument behind F2.

## Evidence

    $ sha256sum p44b-count.mjs p44-shape.tsv
    6e2c22a3079f0346456d8aa0bb307221da3c43b08e2b6898fed6f2f0af045517  p44b-count.mjs
    fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71  p44-shape.tsv
    $ ./run-variant.sh ctl-slow.mjs slow
    CASE no-sidecars expect=CLEAN exit=timeout verdict=none P44=FAIL
    P44_COUNT: UNMET (passed=12 cases=87 …)   counter_exit=1
    $ ./survivor-check.sh        # 30 s in, 10 s after the 20 s timeout fired
    no census process alive / no bwrap of mine alive
    P44_COUNT: UNMET (passed=12 cases=87 …)
    $ ./run-variant.sh ctl-alloc6g.mjs alloc6g
    CASE no-sidecars expect=CLEAN exit=0 verdict=CLEAN P44=PASS
    P44_COUNT: UNMET (passed=13 cases=87 …)   rssmax=4213448KB
    $ ./run-variant.sh ctl-alloc1g.mjs alloc1g    # rssmax=694668KB, no-sidecars P44=PASS
    $ ./run-variant.sh ctl-stdoutbp.mjs stdoutbp
    CASE no-sidecars expect=CLEAN exit=spawn-error:ENOBUFS verdict=none P44=FAIL
    $ ./sandbox-probe.sh ctl-memreport.mjs        # no MemoryMax scope at all
    exit=0 elapsed=1s ; stdout: OMP_CENSUS: CLEAN
    stderr: rss_bytes=6489337856 external=6444455392 heapUsed=4299144
    $ systemd-run … -p MemoryMax=4G … ./sandbox-probe.sh ctl-memreport.mjs
    exit=0 ; stderr: rss_bytes=4306698240 external=6444455392
    $ systemd-run … -p MemoryMax=512M … ./sandbox-probe.sh ctl-memreport.mjs
    exit=0 ; stderr: rss_bytes=516296704   # still exit 0, still CLEAN, never OOM-killed
    $ ./sandbox-probe.sh ctl-tmpfsprobe.mjs
    wrote_mib=2048 tmpfs_used_bytes=2147483648 ; exit=0 ; OMP_CENSUS: CLEAN
    $ systemd-run … timeout -s KILL 60 node p44b-count.mjs --census ctl-hangreal.mjs …
    outer_exit=137 ; CASE lines: 2 ; grep -c P44_COUNT = 0 ; work dir leftover entries: 43
    $ timeout -s TERM 5 node p44b-count.mjs --census ctl-slow.mjs …   # plain `timeout 600` signal
    outer_exit=124 ; work entries left after SIGTERM: 30
      work/sigterm/run-3127788-ce68832a/{c/omp-census.mjs, r/<38 names>}
    $ node p44b-count.mjs --census ctl-constclean.mjs --shape shape-symlink.tsv …
    P44_COUNT: ERROR (unsupported live kind symlink for sneaky-link)
    work_entries left after die(): 6  (run-3378099-f4c76842/c/omp-census.mjs, r/agent.db, r/agent.db-shm)
    $ ./sandbox-probe.sh ctl-nestedns.mjs
    stderr: R44-SENTINEL-NESTEDNS spawned pid=9 ; exit=0
    $ ps -u $(id -u) -o pid=,etime=,args= | grep -E 'sleep 600|unshare'   # after the sandbox exited
    none
    $ ./sandbox-probe.sh ctl-forkcount.mjs        # 300 detached children
    exit=0 ; surviving marker processes after the sandbox exited: 0
    $ ./run-variant.sh ctl-diskwrite.mjs diskwrite
    no leak.txt anywhere on the host; work_entries=0; no-sidecars P44=PASS
    $ find work -mindepth 2 | wc -l     # after every completed run, before my cleanup
    0                                   # (only the abnormal paths of F3 leave entries)
    $ pgrep -af SentinelProcLeak    # final check
    none

## Limits of this seat

Scored 22 variants, one run each, against the frozen counter only — no census was built or scored.
The abuse is gated on mirror entry/dir counts so one counter run exercises each mode once; a real
census would exercise them on every case, which changes nothing about containment but does change
the wall-clock cost (F2). All measurements were taken with the outer
`MemoryMax=4G TasksMax=128 timeout -s KILL 900` scope; the plan's own measurement command has no
such scope, which is precisely why F1 matters there.

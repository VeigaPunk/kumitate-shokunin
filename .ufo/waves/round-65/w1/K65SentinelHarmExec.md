VERDICT: `scripts/harm-matrix.mjs` executes a tip's code with the caller's real HOME, inherited PATH, host /tmp, host network, no PID/cgroup cleanup and hooks-capable git config, so a hostile tip can poison the operator's home, mask a real HARM, forge one, and mutate the lane; `cap-run` (six gates measured byte-identical) is the viable containment, and two small patches in my build dir close the reproduced holes.

## Evidence

All experiments are fixture repos (`D=$(mktemp -d) && git -C "$D" init -q`, `-C "$D"` on every call, every `rev-parse --show-toplevel` checked = `$D`). Scripts kept in `.ufo/waves/round-65/build/K65SentinelHarmExec/*.sh`. Lane revision under test: `2ca91a0c81542cad5f731049aa55dd2f99ade98d`.

1. Real HOME reaches gate children (`a-matrix.sh`, RUN2, real HOME, read-only gate):
   `HARM_ROW gate=who base=CLEAN tip=CLEAN id=HELD base_text="G: CLEAN HOME=/home/vgpnk KEYS=HOME,LANG,LC_ALL,NO_COLOR,PATH"`
   With a fake HOME the same code path wrote markers (`RUN1`): `fakehome-file .../fakehome/ESCAPE_HOME`, `fakehome-file .../fakehome/.omp/ESCAPE_OMP`, `parent-marker /tmp/ESCAPE_SANDBOX_PARENT`, `lane-marker .../fixture/ESCAPE_LANE_WRITE`, and `net=open`.
2. PATH poisoning masks a HARM (`e-poison.sh`): direct readings `B: CLEAN` / `B: RED` with `base-exit=0`, `tip-exit=1`; the matrix read
   `HARM_ROW gate=b base=CLEAN tip=CLEAN id=HELD` and `HARM_MATRIX: CLEAN gates=2 ... harm=0 ... exit=0`, after gate `a`'s tip run planted `pathbin/node` (`-rwxr-xr-x ... 33 ... pathbin/node`).
3. Global `core.hooksPath` executes during sandbox setup (`a-matrix.sh` RUN3): `HOOK_RAN=2` (one per sandbox) with `HOME` holding only a `.gitconfig`.
4. Tree symlink satisfies `needs` with bytes outside the revision (`f-symlink.sh`): `tip-tree-entry=120000 blob ef3909e6... 22 scripts/b.mjs`; the archive of the same revision runs the symlink (`B: CLEAN outside-the-revision`), and the matrix reads `HARM_ROW gate=b base=CLEAN tip=CLEAN id=HELD` — the tip tree has no gate at all.
5. Cleanup failure is an uncaught throw (`d-cleanup-detach.sh`): `Error: EACCES, Permission denied: /tmp/harm-matrix.ZT2nhL` at `harm-matrix.mjs:136`, `exit=1`, `LEFTOVER_MINE=2`.
6. Detached grandchildren survive (`d-cleanup-detach.sh`): two `/bin/sh` children alive after the matrix exited and the sandboxes were deleted, `ticks-after-matrix-exit=10` → `ticks-later=12`.
7. A gate can write the lane's refs (`g-refwrite.sh`): `R: CLEAN tag=WROTE ref=WROTE lane=.../fixtureG`; `fixture-tags=K65_GATE_TAG`, `fixture-refs=refs/heads/k65-gate-ref refs/heads/main`, and the tag then broke the tip run (`tag=FAIL 128`) — the first measurement changed the second.
8. Arbitrary argv is executable (`e-poison.sh`): `HARM_ROW gate=arb base=CLEAN tip=CLEAN id=HELD ... base_text="ARB: CLEAN"`, `argv-uid=1000` for `argv:["/bin/sh","-c","id -u > /tmp/K65_ARGV_UID; echo ARB: CLEAN"]`. The registry comes from the caller's tool directory, never the measured revision: `--lane <fixture>` with default gates → all `ABSENT_BOTH`, `HARM_MATRIX: FAIL_CLOSED reason=NO_GATES ... exit=2`.
9. git clone/checkout does **not** inherit filter drivers or local hooks from the source repo (`b-git-inherit.sh`): `clone config filter/hook keys: NONE`, `FILTER_INHERITED=0`, `LOCALHOOK_INHERITED=0`; a tree-only `.gitattributes filter=nodef` passes through (`checkout-exit=0`). So the `.gitattributes`/tree-hook vector is closed; the global-config vector (finding 3) is not.
10. cap-run is transparent and containing (clone at `2ca91a0`, `c-caprun.sh`): `README_MAP: CLEAN files=157 rows=157 covered=157`, `SOURCES_CHECK: CLEAN (rows=139 ...)`, `COUNTER_PINS: CLEAN pins=30`, `CLAIMS: MATCH (rows=19 ...)`, `SOURCE_CAPTURE: CLEAN captures=32`, each `CAP_RUN: EXIT code=0`; `proxy-check` reads the same `PROXY: DRIFT (A_DRIFT ... delta=+6 ...)` line and exit 1 as a direct run of the same clone (`direct-exit=1`, `caprun-exit=1`). Probe under cap-run: `realhome=EROFS envHOME=ENOENT tmp=WROTE cwd=WROTE net=open cwd=... home=undefined pid1=2`; `HOST_TMP_VISIBLE=0`.
11. Network is open in both modes (item 10 `net=open`; item 1 `net=open`): `bwrap ... --unshare-net` → `NET=err:ENETUNREACH`, without it `NET=open`. No registry gate uses the network: `grep -n 'fetch(' <16 registry scripts>` → no output; `grep 'curl|wget|/bin/nc'` → no output.
12. Proposed patches apply and close the holes (`h-proposed.sh`; `git apply --check -p1` → `harm-patch-APPLIES`, `cap-patch-APPLIES`):
   `HARM_ROW gate=esc ... HOME=/tmp/harm-home.EqhHIx PATH=/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin:/usr/bin:/bin`, `CALLER_HOME_POISONED=0`, `leftover-disposable-homes=0`;
   symlink → `HARM_ROW gate=s base=CLEAN tip=ABSENT id=HARM_ABSENT`;
   locked sandbox → `HARM_MATRIX: CLEAN gates=1 held=1 ... exit=0`, `leftover-locked=0`;
   global hooks → `HOOK_RAN=0`;
   `--sandbox proposed/cap-run.mjs` → `HARM_ROW gate=p base=CLEAN tip=CLEAN id=HELD`, `exit=0`.

## Findings

**K65SentinelHarmExec-1 (HIGH, gate child env).** `CLEAN_ENV()` (`harm-matrix.mjs:42`) forwards `process.env.HOME` and `process.env.PATH` verbatim. A hostile tip gate can write `~/.omp/agent/{config,mcp}.yml` (turning the agent's own tool config into an attack surface), `~/.bashrc`, `~/.ssh/authorized_keys`, `~/.config/systemd/user/*` — all `-w` for the lane user (`WRITABLE /home/vgpnk/.omp`, `~/.bashrc`, `~/.ssh`, `~/.config/systemd/user`). Repro: `bash <build>/a-matrix.sh` (RUN1/RUN2).
**K65SentinelHarmExec-2 (HIGH, verdict masking).** `PATH` is inherited and no gate run is isolated from the next, so a gate at TIP plants `node`/`bash`/`timeout`/`git` in the first writable PATH dir (`/run/user/1000/fnm_multishells/.../bin`, `~/.local/bin`, both `-w`) and every later gate at both revisions executes the shim. Measured: a real `HARM` read as `HELD`, `HARM_MATRIX: CLEAN ... exit=0`. Repro: `bash <build>/e-poison.sh`.
**K65SentinelHarmExec-3 (HIGH, false HARM + residue).** The `finally` at `harm-matrix.mjs:135-136` calls `rmSync` unguarded; a gate that chmods its sandbox to 000 makes the tool die with an uncaught `EACCES` → `exit=1`, which the contract maps to HARM, and leaves the hostile tree in `/tmp`. Any commit pair can therefore be forced to read HARM (and a real run's rows are lost). Repro: `bash <build>/d-cleanup-detach.sh`.
**K65SentinelHarmExec-4 (HIGH-MED, setup-time code execution).** `sandbox()` (`harm-matrix.mjs:74-83`) runs `clone` and `checkout` without `core.hooksPath=/dev/null` and with the caller's git config, while the fixture commits use `GIT_ID` with it. With `~/.gitconfig` `core.hooksPath` the checkout ran the hook twice (`HOOK_RAN=2`). Chained with -1, one gate run persists code that runs before every future matrix run and during the operator's own `git` commands. Repro: `bash <build>/a-matrix.sh` (RUN3).
**K65SentinelHarmExec-5 (MED, measured bytes outside the revision).** `needs` uses `existsSync` (`harm-matrix.mjs:84`); git stores a symlink as mode 120000 and checkout materialises it, so a tip can point a gate path at `/tmp/...` and the matrix reads attacker bytes — a removed gate reads `HELD` instead of `HARM_ABSENT`, and `git archive` of the same revision is fooled identically. Repro: `bash <build>/f-symlink.sh`.
**K65SentinelHarmExec-6 (MED, network).** Gates run with full network (`net=open`), and cap-run does not close it either (`net=open` under cap-run; `--unshare-net` not in its bwrap argv, `cap-run.mjs:193-195`). A gate can exfiltrate lane/tip bytes or fetch attacker-chosen content. Cheap fix: no registry gate needs the network (`grep` above), and `bwrap --unshare-net` answers `ENETUNREACH` (measured).
**K65SentinelHarmExec-7 (MED, process cleanup).** Neither `timeout` nor the sandbox removal ends descendants: a `detached` grandchild outlived the run and the deleted sandbox (`ticks 10 → 12`). `--unshare-pid` plus the systemd scope in cap-run do end it.
**K65SentinelHarmExec-8 (MED, lane mutation).** The sandbox's `origin` URL is the lane path, so a gate can `git -C <origin> tag` / `update-ref` the lane (`tag=WROTE ref=WROTE`), and it can also write the lane worktree (`ESCAPE_LANE_WRITE`). For the round's write-scope rule this means a hostile tip's gate is a lane-writer, and it can change what the second measurement sees.
**K65SentinelHarmExec-9 (LOW, trusted input undocumented).** `--gates <file>` executes its `argv` with the lane user's privileges (`argv-uid=1000`) and the default registry is read from the tool's own directory, never from base/tip (`--lane` fixture → all `ABSENT_BOTH`, exit 2). Trust is therefore: whoever may write `scripts/harm-matrix-gates.json` (the L1 alone) plus whoever may pass `--gates`. The contract header should say so; an `argv[0] ∈ {node,bash}` allowlist in `loadGates` costs nothing and keeps the frozen registry valid (all 20 rows use `node`/`bash`).

**Minimum containment (recommended, in this order).**
1. `scripts/cap-run.mjs`: add `--no-net` → `--unshare-net` (patched, 45-line diff, off by default). Measured: no registry gate needs the network.
2. `scripts/harm-matrix.mjs`: run each gate as `node <cap-run> --mem 1024 --tasks 64 --budget <gate timeout> --no-net -- ...` with `node` mapped to `process.execPath`, and treat `CAP_RUN: OOM|BUDGET|SIGNAL` as FAIL_CLOSED (patched, 175-line diff). Measured on six gates with identical verdict lines and exit codes, and the fixed tool reads `HELD exit=0` under it.
3. Regardless of (2): disposable HOME, `PATH=<dirname(process.execPath)>:/usr/bin:/bin`, `GIT_CONFIG_GLOBAL/SYSTEM=/dev/null` + `core.hooksPath=/dev/null` on the sandbox git calls, realpath containment for `needs`, chmod-retry + `FAIL_CLOSED reason=CLEANUP`, registry `argv[0]` allowlist (all patched). Verified: `CALLER_HOME_POISONED=0`, `HOOK_RAN=0`, `HARM_ABSENT`, `leftover-locked=0`.
4. Residual if only (3) is taken: `dirname(process.execPath)` (fnm node dir) is still user-writable, `/tmp` is shared, lane refs/worktree reachable — a hostile tip can still lie. Isolation (2) is the only closure; enable it by default once a wave-2 seat has measured the other 14 registry gates (the two selftests that spawn nested sandboxes are the risk). The frozen counter invokes the tool without containment, so H1..H5 currently pass over an uncontained run: a plan-level gap, reported not patched.

## Artifacts

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65SentinelHarmExec/`
- `harm-matrix-containment.patch` (applies with `git apply -p1`), `proposed/harm-matrix.mjs` (full file)
- `cap-run-no-net.patch` (applies), `proposed/cap-run.mjs` (full file)
- `a-matrix.sh`, `b-git-inherit.sh`, `c-caprun.sh`, `d-cleanup-detach.sh`, `e-poison.sh`, `f-symlink.sh`, `g-refwrite.sh`, `h-proposed.sh` (re-runnable reproductions)
- `cap-{readme-map,sources-check,counter-pins,claims-check,source-capture,proxy-check,pc2,probe}.{out,err}` (raw cap-run transcripts)

No tool installs/upgrades were needed. Scratch `/tmp/kumitate-r65/K65SentinelHarmExec` removed after the run; no lane file, index, jj state, pin or frozen byte was edited (`git -C <lane> status --porcelain` shows only other seats' untracked report/build paths).

## Limits

- Frozen counter not run (other seats own it); all 20 registry gates not measured under cap-run — 6 were, 14 (incl. `round-gate --selftest`, `harm-matrix --selftest` with their own nested sandboxes) were not.
- cap-run measurements used `/usr/bin/node` (v26.12.0) while the tool's node is fnm v24.21.0; the patch maps `node` to `process.execPath` so the gate reads the same runtime, but that mapping itself was only exercised on the poison fixture, not on all six gates.
- No memory-pressure/OOM test of a gate under the 1024 MiB cap; no test of bwrap nesting; no test of a hostile tip with a huge tree (clone/checkout has no timeout or size cap, and clone copies the whole lane object store).
- Host was loaded (load average 82); starvation could turn a heavy gate into a TIMEOUT and read as not-clean — not separated from a real regression.

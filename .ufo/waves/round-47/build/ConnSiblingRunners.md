RESULT ConnSiblingRunners rev=cac43009 verdict=OVERLAP overlaps=5

# Sibling-overlap scan (read-only)

Reference (kumitate, v2): scripts/cap-run.mjs + scripts/cap-spawn.mjs (contract kumitate-cap-run-v2) and the frozen counter .ufo/waves/round-47/probe/caproute-probe.mjs (strace -f --decode-pids=pidns).

## Overlap 1 — kaidoku-shokunin/.ufo/waves/round-20/tools/revexec.py (systemd-run service sandbox)
- Runner: systemd-run --user --pipe --wait --collect --quiet with ProtectSystem=strict, ProtectHome=read-only, PrivateTmp=yes, ReadWritePaths=<workdir>, NoNewPrivileges, RestrictNamespaces, PrivateDevices, ProtectProc=invisible, ProcSubset=pid, env -i (HOME/PATH/TMPDIR).
- Overlap: bounded child-process runner via systemd transient unit; env clearing via env -i.
- Conflict: service unit, not scope; no MemoryMax/TasksMax/MemorySwapMax (no cgroup resource cap); no bwrap/PID namespace; work base forced under /fast/scratch (rejects /tmp). Unit names are systemd defaults, not prefixed.
- Adopt/warn: kumitate should warn kaidoku that revexec has no memory/task cap (host OOM risk); either add -p MemoryMax/TasksMax or route through cap-run. kumitate need not adopt revexec's filesystem properties (already covered by bwrap --ro-bind /).

## Overlap 2 — tameshi-shokunin/tools/env-diff.py (bwrap wrapper)
- Runner: bwrap --ro-bind / / --dev /dev --proc /proc --tmpfs /tmp --bind <tmp> /tmp/w --unshare-net --die-with-parent --chdir /tmp/w, env=profile_env(profile) (full env replacement).
- Overlap: bwrap filesystem sandbox; /tmp tmpfs.
- Conflict: no --unshare-pid, no --clearenv/--setenv, no systemd scope/cgroup cap; env is replaced wholesale but bwrap PID 1 may still carry the profile (no clearenv); scratch lives under /tmp/w inside the tmpfs. Net is unshared (kumitate keeps net).
- Adopt/warn: if tameshi wants parity with kumitate's hermeticity, add --unshare-pid + --clearenv + --setenv PATH and run inside a systemd scope with MemoryMax/TasksMax. kumitate should warn that a host fixture under /tmp is invisible unless --bind'd after the tmpfs (S095 ordering); cap-spawn already does this.

## Overlap 3 — tsukuroi-shokunin/tools/probe-git-child-env-r3{1,2,3,4}.py (strace observer)
- Observer: strace -f -qq -v -s 65536 -e trace=execve -o <trace> -- <python> <tool>, host PIDs (no --decode-pids).
- Overlap: strace -f child-process observation; same parsing approach (execve argv/envp).
- Conflict: no PID-namespace decode; if run against a cap-run child, clone'd PIDs inside bwrap's PID ns would be mis-attributed (same calibration issue that forced --decode-pids=pidns). Also traces execve only (no clone parentage beyond strace's own).

## Overlap 4 — kake-shokunin/scripts/source_recheck_hardening_selftest.py (strace observer)
- Observer: strace -f -q -s 4096 -e trace=openat,open -o <trace> <python tool>.
- Overlap: strace -f with -o trace file; filesystem-open observation.
- Conflict: traces openat/open only; no execve/envp; cannot verify env cleanliness or PID ancestry.

## Overlap 5 — tameshi-shokunin/tools/trace-inputs.py (strace observer)
- Observer: strace -f (file-open/exec/chdir/dup), private mkdtemp cache.
- Overlap: strace -f child observation + temp scratch.
- Conflict: distinct syscall set; no decode-pids.

## Non-overlaps checked
- Fleet scripts/ and scripts/hyaku/: no bwrap/systemd-run/strace wrappers found.
- Other *-shokunin top-level scripts: only kake/tabi/kumitate use spawnSync for git/node selftests; no cgroup/bwrap/systemd-run wrappers beyond the above.

## Affected axes
- Operability (C1): no direct effect on the 5 routed sites; overlaps are environmental. Hermeticity and resource-bounding conventions differ across lanes, which the counter's strace predicate (PID ns, clearenv, scope caps) is designed to pin for kumitate only.
- Substrate/verification: sibling strace observers without --decode-pids=pidns will misread kumitate's PID-namespace children; sibling bwrap wrappers without clearenv/unshare-pid leak caller env into PID 1.

## Proposed move (for integrator; no lane writes made)
- Publish a one-page "runner interop" note (in kumitate corpus/knowledge or SKILL) listing: cap-run's PID namespace requires --decode-pids=pidns for any external strace; /tmp is a fresh tmpfs so host fixtures need --bind after the tmpfs; env is replaced entirely (capSpawnSync passes a complete env). Warn kaidoku (add caps) and tameshi (add clearenv/unshare-pid/scope caps) before they reuse these substrates.

## Risks
- Overlap count (5) counts distinct sibling mechanisms, not files (tsukuroi has 4 probe files counted as one).
- No code or counter was run (data rule); findings are static.

## Verification (commands run)
- grep -rIl bwrap/systemd-run/strace across fleet top-level scripts and tools (excluding .ufo, .git, node_modules, corpus/live).
- read revexec.py, env-diff.py, probe-git-child-env-r31.py, source_recheck_hardening_selftest.py, trace-inputs.py, cap-run.mjs, cap-spawn.mjs, caproute-probe.mjs.
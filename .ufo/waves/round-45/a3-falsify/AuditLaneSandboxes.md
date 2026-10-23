RESULT AuditLaneSandboxes rev=6b2a4517 verdict=gaps files=10 spawns=24 departures=24

Axes checked: row 5 code isolation; row 6 memory, time and cleanup.
Scope: static source at the judged revision only. `spawns` counts child-process call sites that run a test target or generated code, not repeated invocations. Each child site lacks an in-file cgroup memory scope, so each is a row-6 departure. Six also run untrusted or generated code without row-5 isolation. No test or demo was run.

| File:line | Child | Environment handed to child | Memory bound in file | Time bound per child | Cleanup on signal | Departure and relevance |
|---|---|---|---|---|---|---|
| `scripts/anchor-truth.mjs:802` | This gate's CLI on a fixture | Explicit allowlist via `gitEnv()` | None | No child timeout; inner Git calls have separate 60 s limits, not an overall limit | No process-group cleanup; fixture `finally` runs only after return | Row 6; trusted lane code, but a hang is unbounded |
| `scripts/cite-check.mjs:2311,2338` | This gate's CLI | Explicit `process.env` plus fixture `HOME` and `UFO_SRC` | None | 120 s each | No group cleanup; fixture `finally` after return | Row 6; trusted lane code |
| `scripts/cite-check.mjs:2431` | This gate's CLI | Explicit `process.env` plus depth/injection markers | None | 300 s | No group cleanup; fixture `finally` after return | Row 6; trusted lane code |
| `scripts/claims-check.mjs:879` | This gate's CLI | Explicit allowlisted `gitEnv(env)` | None | 60 s | No group cleanup; fixture `finally` after return | Row 6; trusted lane code |
| `scripts/gate-mutants.mjs:413` | `prlimit` → Node copied fixture or mutated target `--selftest` | Explicit minimal `PATH`, `HOME`, `TMPDIR`, `LANG`, `TZ` | No cgroup. V8 old-space 128 MiB; `RLIMIT_NPROC` is not a memory limit; 512 MiB RSS is a 100 ms polling watchdog | At most 60 s, with shorter self-test overrides | Detached process group is SIGKILLed on timeout, overflow, close and parent signal; parent guard also reaps; temp tree removed | Row 5+6; generated mutated code, and `--repo` can supply the target source. Isolation is still absent |
| `scripts/gate-mutants.mjs:876` | Generated fixture's `node -e` interval process | Inherits the fixture's five-variable environment | No cgroup or child V8 flag; covered only by the parent's RSS polling and `RLIMIT_NPROC` | Parent run's at-most-60 s group limit | Same process-group SIGKILL / parent guard as above | Row 5+6; generated code |
| `scripts/kimi-census.mjs:488` | This gate's CLI on fixture roots | Inherited | None | 30 s default; one call overrides to 10 s | No group cleanup; fixture `finally` after return | Row 6; trusted lane code |
| `scripts/proxy-check.mjs:1543` | This gate's CLI on fixtures | Explicit `process.env` plus caller overrides | None | 120 s | No group cleanup; fixture `finally` after return | Row 6; trusted lane code |
| `scripts/round-gate.mjs:725,1392` | This gate's CLI on fixtures | Explicit `process.env` minus four lane variables, plus test overrides | None | 120 s each | No group cleanup; fixture `finally` after return | Row 6; trusted lane code |
| `scripts/sources-check.mjs:549` | This gate's CLI on fixtures | Inherited | None | 15 s | No group cleanup; fixture `finally` after return | Row 6; trusted lane code |
| `scripts/sources-check.mjs:859` | Generated parity shell script (`sh -c`) | Inherited | None | 10 s | No group cleanup; fixture `finally` after return | Row 5+6; generated but fixed script, reads a generated fixture |
| `scripts/surface-probe.mjs:476` | `bash <src>/scripts/ufo-sighting surface --json` | Explicit `process.env` plus `NODE_COMPILE_CACHE` | None | 20 s | No group cleanup; cache removed in `finally` only after return | Row 5+6; runs source-tree code under test |
| `scripts/surface-probe.mjs:504` | `node <src>/scripts/fleet-dispatcher.mjs status` | Explicit `process.env` plus three state-path variables | None | 20 s | No group cleanup; state root removed in `finally` only after return | Row 5+6; runs source-tree code under test |
| `scripts/surface-probe.mjs:1007` | `bash -c item.command` parsed from `SKILL.md` | Inherited | None | 120 s per item; no total checklist deadline | No group cleanup; timeout is not a process-group kill; no signal handler | Row 5+6; arbitrary repository command text is executed |
| `scripts/surface-probe.mjs:1541` | This probe's CLI for fixture arguments | Inherited when no override; otherwise explicit `process.env` plus overrides | None | 120 s | No group cleanup; self-test fixture `finally` after return | Row 6; trusted lane code |
| `scripts/surface-probe.mjs:1682` | Nested self-test of this probe | Explicit `process.env` plus recursion marker | None | 180 s | No group cleanup; self-test fixture `finally` after return | Row 6; trusted lane code |
| `scripts/wave-census.mjs:302` | This gate's CLI on fixture roots | Inherited | None | 60 s default per child; parameter can shorten it | No group cleanup; fixture `finally` after return | Row 6; trusted lane code |
| `scripts/wave-census.mjs:368-369` | This gate's CLI for usage cases | Inherited | None | No child timeout | No group cleanup; fixture `finally` only if the suite returns | Row 6; trusted lane code, but a hang is unbounded |
| `scripts/wave-census.mjs:438-439` | This gate's CLI for argument-error cases | Inherited | None | No child timeout | No group cleanup; fixture `finally` only if the suite returns | Row 6; trusted lane code, but a hang is unbounded |
| `scripts/wave-census.mjs:585` | Nested self-test of this gate | Explicit `process.env` plus failure-injection marker | None | 120 s | No group cleanup; fixture `finally` after return | Row 6; trusted lane code |

Findings:

- **High, conditional on an untrusted checkout.** `surface-probe --checklists` passes source-controlled command text straight to `bash -c` with the caller's inherited environment and no sandbox. A modified `SKILL.md` can therefore run arbitrary commands with the probe user's permissions; the 120 s child timeout is not a memory limit or descendant cleanup. The same trust issue applies to the executed `--src` shim and dispatcher, which are explicitly given the full environment. A test of an arbitrary `--repo` with `gate-mutants` likewise executes its copied/mutated scripts. No payload was run and no environment values were read.
- **Medium operability gap across the 24 child sites.** None has a cgroup `MemoryMax`; most also lack process-group cleanup. Trusted self-tests can still hang or consume host memory. `anchor-truth` and four `wave-census` usage invocations have no per-child timeout. `gate-mutants`' V8 limit and sampled RSS kill are not equivalent to a cgroup cap; an allocation can exceed the sampled threshold before the next poll.
- **Smallest remediation:** run untrusted/generated targets under the row-5 `env -i` + bwrap envelope; place every potentially allocating child inside a `systemd-run --user --scope` with `MemoryMax`/`TasksMax` and an outer `timeout -s KILL`; use process-group cleanup for shell descendants. Add finite child timeouts at `anchor-truth:802` and `wave-census:368-369,438-439`.

Evidence (all source reads are at revision `6b2a45178c72a4565bb9d98e09f4c36b95ca1521`):

- Command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -r --name-only 6b2a45178c72a4565bb9d98e09f4c36b95ca1521 -- scripts/ tools/`
- Output: 11 paths, all `scripts/`; includes `scripts/omp-census.mjs`, which has no qualifying child call. No tracked `tools/` path.
- Command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin grep -n -E 'spawn(Sync)?|exec(File|Sync)?|systemd-run|bwrap|timeout|child_process|fork\(' 6b2a45178c72a4565bb9d98e09f4c36b95ca1521 -- scripts/ tools/`
- Output: the table's child call-site lines, plus Git/FIFO/find helpers. The 24 counted sites are the table entries; helpers that do not run test targets or generated code were excluded.
- Command: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin grep -n -E 'systemd-run|MemoryMax|bwrap|--unshare-all|env -i' 6b2a45178c72a4565bb9d98e09f4c36b95ca1521 -- scripts/ tools/`
- Output: no matches (exit 1).
- Target line evidence: `anchor-truth.mjs:802`; `cite-check.mjs:2311-2314,2338-2341,2431-2434`; `claims-check.mjs:878-881`; `gate-mutants.mjs:108-130,413-435,876-889`; `kimi-census.mjs:487-489`; `proxy-check.mjs:1543-1545`; `round-gate.mjs:712-726,1392-1395`; `sources-check.mjs:548-550,851-860`; `surface-probe.mjs:476-490,504-523,1007-1013,1541-1543,1682-1687`; `wave-census.mjs:301-303,368-369,438-439,585-596,599-600`.
- Tool installs or updates: none.

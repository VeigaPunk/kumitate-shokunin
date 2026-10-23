# ScoutRegistryClassification — R49-2 registry rows

Verdict: `ROWS_READY` at freeze `8237be86e2dc04e90e51b66b62bdffe770196d27`. `counter-rerun` is a **probe**, not a gate and not a runner. `cap-spawn` is a **helper**, not a gate, not a runner, and not a CLI. `scripts/bind-oracle.mjs` is absent at this rev, so no bind-oracle row.

Axes: operability (a paste that names only flags and exits the script has), coverage (both scripts, every claimed code run or marked unrun).

Sandbox: `/fast/scratch/hyaku/kumitate-r49/seats/ScoutRegistryClassification/lane`, detached, `git status --porcelain=v1` empty (exit 0). No tool installed (node `v24.21.0` already on `PATH`). Quotes are that clone unless noted.

## Kind test (three sentences, then the bytes)

Fleet §Gate standard (`/home/vgpnk/Projects/kimi-shokunin/skills/shokunin/protocol/PROTOCOL.md:390-392`): a gate reads surfaces and compares them to expected values persisted in its repo. A tool that cannot fail is a probe.

Lane verdict map (`SKILL.md:589-594`): the eleven gates can exit 1 on a real defect; `0` clean, `1` failed, `2` fail-closed and `64` usage are could-not-evaluate.

Runner note (`SKILL.md:595-596`): `cap-run` is not a gate because it exits with its child's code. Its row carries its own exit map. "All eleven" counts gates only.

| script | gate? | probe? | runner? | helper? |
|---|---|---|---|---|
| `scripts/counter-rerun.mjs` | no | **yes** | no | no |
| `scripts/cap-spawn.mjs` | no | no | no | **yes** |

`counter-rerun` is not a gate: `decide` (`:215-228`) compares the counter's own final stdout lines to each other, not to a value persisted in the repo. Exit 1 is `DISAGREE`. A child that exits 7 comes back as process exit 1 (run below), so it is not the runner note either. It is a CLI (`:540-542`) with `process.exit`, so it is not a helper. The plan's kind is probe. The fleet sentence "a tool that cannot fail is a probe" does **not** fit: this one exits 1. Do not paste "cannot fail".

`cap-spawn` is not a gate and not a probe-tool: the header says "not a CLI" (`:4`), it exports `capSpawnSync` (`:28`), and it never calls `process.exit`. Bare `node scripts/cap-spawn.mjs` exits 0 with empty output, including `--selftest` and `--help` — those flags are not parsed. It is not the runner: BUDGET's runner exit 124 is returned as `status: null` / `ETIMEDOUT`, not as process exit 124 (run below). `scripts/proxy-check.mjs:468` already calls it the helper. Kind: helper.

Do not increment "all eleven". Suggested sentence after `SKILL.md:596` (prose, not a row):

> Round 49 registers `counter-rerun` (probe) and `cap-spawn` (helper). Neither is a gate, so "all eleven" still counts the gates only.

Protocol fields the lane table has no columns for (do not add columns): owner is this lane, kumitate L1 (`SKILL.md:594-595`). Write scope is under each row.

## Paste rows

Column shape of `SKILL.md:598`: `| name | kind | entry command | self-test | pinned values live in |`. Insert after the `cap-run` row (`:611`). Exit map stays inside the entry cell, as `cap-run` does.

| counter-rerun | probe | `node scripts/counter-rerun.mjs --probe <abs-probe> --lane <abs-lane> --rev <rev> [--runs K] -- <probe args>` → `COUNTER_RERUN: AGREE (runs=K)` or `COUNTER_RERUN: DISAGREE`, contract `kumitate-counter-rerun-v1`. The counter is invoked as `node <probe> <lane> <rev> <probe args>`. `--runs` defaults to 3; a repeated `--runs` keeps the last value (not a usage error). `--selftest` is honored only as argv[0]; arguments after it are ignored. No `--help`, `--strict`, or `--json`. Exit: 0 AGREE (every run status 0 and final summary lines byte-identical) · 1 DISAGREE (a run's status is any non-zero other than the fail-closed arm, or two summary lines differ; the child status is not passed through) · 2 fail-closed `COUNTER_RERUN: ERROR` (unreadable probe, lane, or rev; lane not a git repo; no final summary line; or the counter exited 2) · 64 usage `COUNTER_RERUN: USAGE` (nothing ran). A relative `--probe` or `--lane` is 64, not 2. | `--selftest` → `COUNTER_RERUN_SELFTEST: PASS` exit 0, else `COUNTER_RERUN_SELFTEST: FAIL (<n> case(s) failed)` exit 1. Case lines are `PASS  <name>` / `FAIL  <name>`, not an `n/m` tally. | `CONTRACT` and `DEFAULT_RUNS` in `scripts/counter-rerun.mjs:88-90`. No external verdict baseline. Content digest only: `pin.counter-rerun` at `SCORECARD.md:320` inside `<!-- kumitate-gate-pins-v1`, mapped by `scripts/proxy-check.mjs:469` `GATE_PINS`. |

| cap-spawn | helper | not a CLI. `import { capSpawnSync } from './cap-spawn.mjs'` (`CAP_RUN` is also exported). `capSpawnSync(cmd, args, { env, bind, timeout, mem, tasks, cwd, encoding, maxBuffer, input })` runs `node` on the sibling `cap-run.mjs` with `--mem <mem> --tasks <tasks> --budget <timeout/1000> [--bind <dir>]... [--env K=V]... --verdict-file <mkdtemp/verdict> -- <cmd> <args>`. Defaults `timeout=60000`, `mem=512`, `tasks=64`, `encoding='utf8'` (`:28-29`). Importers at this rev: `anchor-truth.mjs:90`, `claims-check.mjs:88`, `kimi-census.mjs:112`, `round-gate.mjs:142`, `sources-check.mjs:53`, `surface-probe.mjs:139`. `node scripts/cap-spawn.mjs` exits 0 and prints nothing, with or without `--selftest`, `--help`, or `--mem`. No process exit map. Returned object: an `EXIT` verdict keeps spawnSync `status` (observed `/usr/bin/true` → 0, `/usr/bin/false` → 1) plus `capVerdict`; `BUDGET` is rewritten to `status: null`, `signal: 'SIGTERM'`, `error.code: 'ETIMEDOUT'` while `capVerdict` stays `CAP_RUN: BUDGET code=124` (the helper does not exit 124); a verdict outside `EXIT|OOM|BUDGET|SIGNAL` → `status: null`, `error.code: 'ECAPRUN'` (observed `mem: 0`, runner usage exit 64). `OOM` and `SIGNAL` are not rewritten (`:57-60`); not live-run. | none. No `--selftest`. Invoking the file is not a suite. | defaults and the sibling path in `scripts/cap-spawn.mjs:26-29`. No expected-value file. Content digest `pin.cap-spawn` at `SCORECARD.md:319`, `scripts/proxy-check.mjs:468`. The header cites `kumitate-cap-run-v2`, which is `cap-run.mjs:96`; this file has no `CONTRACT` constant. Do not copy the existing `cap-run` row's `kumitate-cap-run-v1` (`SKILL.md:611`). |

Write scope, not columns. `counter-rerun` probe path writes stdout/stderr only; `--selftest` uses `mkdtemp` `counter-rerun-selftest.*` and removes it (`:337`, `:525-526`); it reads `/proc/loadavg` and runs `git rev-parse --verify` read-only (`:184-185`). `cap-spawn` creates `cap-spawn.*` under `os.tmpdir()` and `rmSync`s it before return (`:31`, `:48-50`).

## Defects a paste must not introduce

- `--selftest` on `counter-rerun` does not reject extra arguments (`cap-run.mjs:473` does; this script does not). `--selftest` not in argv[0] is usage 64, unknown argument `"--selftest"`.
- Repeated `--runs` is not usage. Repeated `--probe`, `--lane`, or `--rev` is usage 64 (`:156`). `--runs` must match `^[1-9][0-9]*$` (`0`, `01`, `1.5` → 64).
- Empty probe-args after `--` are legal. Missing `--` is 64 even when `--probe`, `--lane`, and `--rev` are present.
- Child exit 2 is process exit 2, never `DISAGREE`, and the `COUNTER_RERUN_RUN` line is still printed on stdout.
- `cap-spawn` has no exit 64, no exit 124, and no `--selftest`. Runner usage stays inside the returned `error` (`ECAPRUN`).
- The live runner contract is `kumitate-cap-run-v2`. The registry's `cap-run` row still says `v1` and omits `--bind` / `--verdict-file`. That row was not rewritten here.
- No `bind-oracle` row. `ls scripts/bind-oracle.mjs` at this rev: `No such file or directory`.

## Receipts

```
git -C …/lane rev-parse HEAD
→ 8237be86e2dc04e90e51b66b62bdffe770196d27

git -C …/lane status --porcelain=v1
→ (empty)  PORCELAIN:0

sha256sum scripts/counter-rerun.mjs scripts/cap-spawn.mjs
→ c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b  scripts/counter-rerun.mjs
→ 1fde43fb7f68992fb5e692188cd9afd3581d1d16c720815adc8d3a1ca3c734d0  scripts/cap-spawn.mjs
```

Those digests equal `SCORECARD.md:320` and `:319`.

`node scripts/counter-rerun.mjs` (no args), exit 64, stdout empty, stderr:

```
COUNTER_RERUN: USAGE missing -- <probe args> (contract kumitate-counter-rerun-v1: --selftest | --probe <abs-probe> --lane <abs-lane> --rev <rev> [--runs K] -- <probe args>)
```

Same contract tail for every usage below. Only the reason changes. All exit 64, stdout empty.

| argv shape | stderr reason |
|---|---|
| `--help`, `--bogus`, `--strict`, `--json`, `--wat` | `unknown argument "<flag>"` |
| `--probe <abs> --selftest` (`--selftest` not argv[0]) | `unknown argument "--selftest"` |
| `--probe` with no value | `--probe needs a value` |
| flags present, no `--` | `missing -- <probe args>` |
| `--runs 0`, `--runs 01`, `--runs 1.5` | `--runs wants a positive integer` |
| relative `--probe` | `--probe wants an absolute path` |
| relative `--lane` | `--lane wants an absolute path` |
| `--probe` twice | `--probe given twice` |

Fail-closed, exit 2, stdout empty unless noted:

```
--probe <abs-missing> → COUNTER_RERUN: ERROR unreadable probe <path> (no such file)
--lane <abs-missing>  → COUNTER_RERUN: ERROR unreadable lane <path> (no such directory)
--lane <non-git dir>  → COUNTER_RERUN: ERROR unreadable lane <path> (not a git repository)
--rev deadbeef…       → COUNTER_RERUN: ERROR unreadable rev "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef" in lane <lane> (git rev-parse: fatal: Needed a single revision)
```

Probe path, lane = the sandbox clone, rev = the freeze. Stable fixture prints `SUMMARY held=1 rule=X` and exits 0.

```
--runs 2 → exit 0
COUNTER_RERUN_RUN run=1 exit=0 … summary="SUMMARY held=1 rule=X"
COUNTER_RERUN_RUN run=2 exit=0 … summary="SUMMARY held=1 rule=X"
COUNTER_RERUN: AGREE (runs=2)

--runs omitted → exit 0, three COUNTER_RERUN_RUN lines, then
COUNTER_RERUN: AGREE (runs=3)

--runs 9 --runs 1 → exit 0, one RUN line, then
COUNTER_RERUN: AGREE (runs=1)

child exit 7, identical summary → exit 1
COUNTER_RERUN_RUN run=1 exit=7 …
COUNTER_RERUN_REASON: run 1 exited 7
COUNTER_RERUN: DISAGREE

two summaries → exit 1
COUNTER_RERUN_REASON: run 2 final summary line differs from run 1 ("SUMMARY n=1" vs "SUMMARY n=0")
COUNTER_RERUN: DISAGREE

child exit 2 → exit 2
stdout: COUNTER_RERUN_RUN run=1 exit=2 …
stderr: COUNTER_RERUN: ERROR run 1 exited 2: the counter could not evaluate (its own fail-closed arm)

empty stdout, child exit 0 → exit 2
stdout: COUNTER_RERUN_RUN run=1 exit=0 … summary_sha256=none summary=none
stderr: COUNTER_RERUN: ERROR unparsable output: run 1 wrote no final summary line

-- --set r48 → exit 0, summary records the counter argv
["<lane>","8237be86e2dc04e90e51b66b62bdffe770196d27","--set","r48"]
```

```
node scripts/counter-rerun.mjs --selftest
→ exit 0, stderr 0 bytes, 14 lines `PASS  …`, then
COUNTER_RERUN_SELFTEST: PASS

node scripts/counter-rerun.mjs --selftest --not-a-flag
→ exit 0
cmp selftest.out selftest-extra.out → CMP:0
```

Selftest fail exit 1 is `scripts/counter-rerun.mjs:528-530` (not live-failed). The pass run's mutation case requires a stubbed copy to fail its own `--selftest`; that case `PASS`ed.

`cap-spawn` CLI, all exit 0, no stdout and no stderr:

```
node scripts/cap-spawn.mjs
node scripts/cap-spawn.mjs --selftest
node scripts/cap-spawn.mjs --help
node scripts/cap-spawn.mjs --mem 1 --tasks 1
```

`node scripts/cap-run.mjs` (the runner, to check flags the helper forwards), exit 64:

```
CAP_RUN: USAGE --mem is required (contract kumitate-cap-run-v2: --mem <MiB> --tasks <n> --budget <s> [--env K=V]... [--bind <dir>]... [--verdict-file <path>] -- <cmd> [args...] | --selftest)
```

`capSpawnSync` return values (the helper process itself exited 0):

```
/usr/bin/true                         status=0 signal=null error=null capVerdict="CAP_RUN: EXIT code=0 unit=cap-run-…"
/usr/bin/false                        status=1 signal=null error=null capVerdict="CAP_RUN: EXIT code=1 unit=cap-run-…"
mem:0                                 status=null error.code=ECAPRUN
                                      capVerdict="CAP_RUN: USAGE --mem wants a positive integer MiB (contract kumitate-cap-run-v2: …)"
sleep 3, timeout 1000 (budget 1s)     status=null signal=SIGTERM error.code=ETIMEDOUT
                                      capVerdict="CAP_RUN: BUDGET code=124 unit=cap-run-…"
bind a host /tmp dir                  status=0 stdout="sentinel-ok" capVerdict EXIT code=0
same path, no bind                    status=1 stderr ENOENT on that path, capVerdict EXIT code=1
cap-spawn.* dirs under os.tmpdir()    before=40207 after=40207 newNames=[]
```

The 40207 pre-existing `cap-spawn.*` directories are host state. These six calls added none. Not attributed.

## Unrun

`OOM` and `SIGNAL` branches of `cap-spawn.mjs:51-60`. Only `BUDGET` rewrites `status`. Whether a `CAP_RUN: SIGNAL` verdict keeps the runner's `128+signal` status is that code, not a live run.

## Line index at the freeze

- Registry home, verdict map, runner note: `SKILL.md:587-598`, `cap-run` row `:611`.
- `counter-rerun` CLI and exit map: `:17-19`, `:46-54`, usage `:106-108`, parse `:143-167`, decide `:215-228`, exits `:260-265`, dispatch `:540-542`, selftest result `:528-533`.
- `cap-spawn`: `:2-18`, `:26-41`, `:51-60`.
- Pins: `SCORECARD.md:312-320`, `scripts/proxy-check.mjs:461-469`.
- Runner contract constant: `scripts/cap-run.mjs:96`.

Report: .ufo/waves/round-49/r49/ScoutRegistryClassification.md

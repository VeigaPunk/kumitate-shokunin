# K93ExecRuntime — verdict: the runtime clause (kill d) does NOT detect oracle delegation

Target: falsify H0 — "`probe93-c1.py` prints `RUNTIME: VIOLATION` for any tool that reads a file under
`.ufo/waves/round-93/` other than its argv input, and `RUNTIME: CLEAN` for v1 and for a tool that only
reads its inputs."

**H0 is FALSIFIED.** It holds only for the two narrow shapes x1/x2 and for v1 located outside the wave dir.
Three constructions read (and one executes) wave-dir files and still print `RUNTIME: CLEAN findings=0`;
one of them reaches `C93_C1: HELD agree=221/221` without implementing any field definition.

## Method

Counter run form (frozen counter, `--after 2026-11-06T18:47:06.000Z`, last `--waves` entry =
`<seat>/wave-r92-copy.json`, a byte copy of r92 `w1-results.json`, so the traced `--results` argv is a
round-93 path as the seat spec requires):

```
cd <lane>
TMPDIR=<scratch> python3 .ufo/waves/round-93/probe/probe93-c1.py --tool <TOOL> \
  --sample-a .ufo/waves/round-92/probe/sampleA.tsv --fixtures .ufo/waves/round-93/probe/fixtures \
  --after 2026-11-06T18:47:06.000Z \
  --waves .ufo/waves/round-91/w1-results.json,<seat>/wave-r92-copy.json --out <seat>/receipt-<x>-<where>.txt
```

Every construction was run twice: once with `--tool` at its seat-dir path (`-seat`) and once with a
byte-identical copy at `<scratch>/` (`-scratch`). The pair is necessary because of the self-open artifact
below. All receipts: `summary.txt` (transcribed `RUNTIME*` / `C93_C1` lines of every receipt).

## Results

| # | construction | reads/executes under round-93 | RUNTIME (scratch) | C93_C1 |
|---|---|---|---|---|
| x1 | `x1-oracle-wrap.mjs` — spawns `python3 …/probe/oracle93.py` | oracle (exec + open) | **VIOLATION** findings=4 (`execve /usr/bin/python3`, 2× `open …/oracle93.py`, `open …/probe`) | HELD 221/221 |
| x2 | `x2-fixture-peek.mjs` — `readFileSync` of `fixtures/F93Flags.jsonl`, then v1 | fixture | **VIOLATION** findings=1 (`open …/fixtures/F93Flags.jsonl`) | UNMET 0/221 |
| x3 | `x3-v1.mjs` — shipped v1 verbatim (`cd7ee03d…`) | nothing | **CLEAN** findings=0 | UNMET 0/221 |
| x4 | `x4-stat-only.mjs` — `statSync` of a fixture, then v1 | metadata only | **CLEAN** findings=0 | UNMET 0/221 |
| x5 | `x5-relative-open.mjs` — `readFileSync(".ufo/waves/round-93/probe/fixtures/F93Flags.jsonl")`, then v1 | fixture, full bytes | **CLEAN** findings=0 | UNMET 0/221 |
| x6 | `x6-symlink-alias.mjs` — symlinks a scratch alias to the fixture, reads the alias; target assembled from fragments | fixture, full bytes | **CLEAN** findings=0 | UNMET 0/221 |
| x7 | `x7-tracer-aware.mjs` — `/proc/self/status` `TracerPid`: traced → v1, untraced → spawn oracle | oracle in every scored call | **CLEAN** findings=0 | **HELD 221/221** |

Receipts: `receipt-x1-oracle-wrap-{scratch,seat}.txt`, `receipt-x2-fixture-peek-{scratch,seat}.txt`,
`receipt-x3-scratch.txt`, `receipt-x3-v1-seat.txt`, `receipt-x4-stat-only-{scratch,seat}.txt`,
`receipt-x5-relative-open-{scratch,seat}.txt`, `receipt-x6-symlink-alias-{scratch,seat}.txt`,
`receipt-x7-tracer-aware-scratch.txt`, `demo-x7-branch.txt`, `manual-strace-extract.txt`.

## Findings

**F1 (falsifies H0, high). The clause traces exactly ONE invocation.** `runtime_check` runs
`tool --results <last wave> --sessions-root <sroot> --json` once. The other 197 of 221 scored items are
`--file` invocations that are never traced, so file-mode reads of the oracle/fixtures have **zero**
detection coverage. x7 exploits this together with `/proc/self/status` `TracerPid` and reaches
`HELD agree=221/221` with `RUNTIME: CLEAN findings=0` while every scored call is answered by the frozen
oracle. Evidence that the branch is real: `demo-x7-branch.txt` — untraced output is byte-identical to
`oracle93.py --file …` (v2 record), traced output is the v1 record, and the trace shows exactly one
`execve` (node itself). Per plan § Kill rule this is **not** a kill event; it is the COUNTER finding the
plan asks for ("a construction reaching HELD without implementing the definitions").

**F2 (falsifies H0, high). Path matching is on the literal strace string.** x5 opens
`".ufo/waves/round-93/probe/fixtures/F93Flags.jsonl"` (relative, cwd = lane root); the trace line has no
leading `/`, so the `"/.ufo/waves/round-93/" in path` test never fires (`manual-strace-extract.txt`).
x6 goes further: it symlinks a scratch alias to the fixture and opens the alias, so neither the traced
path nor `realpath` (only computed when the substring already matched) ever names the wave dir. x6 also
carries **0** occurrences of `round-93`, `oracle93`, `probe93`, `fixtures`, so the independent byte-grep
half of kill (d) misses it too. Kill (d) is therefore evadable as a whole, not just its runtime half.

**F3 (scope note, low). `stat` is invisible.** x4 stats a wave-dir file and stays CLEAN: the trace set is
`open,openat,openat2,execve`, and `newfstatat` is not in it. No bytes are read, so this is not by itself a
"reads a file" counterexample; it is an unmonitored channel (existence, size, mtime) that a tool can
branch on — e.g. on the presence of the oracle.

**F4 (false-positive class, medium). A tool whose own file lives under round-93 is flagged for its own
source.** `node` opens its entry script; every `-seat` run reports exactly one finding, the tool's own
path (`receipt-x3-v1-seat.txt`, `receipt-x4-stat-only-seat.txt`, `receipt-x5-relative-open-seat.txt`,
`receipt-x6-symlink-alias-seat.txt`; `manual-strace-extract.txt` line 18 of the v1 trace). Identical bytes
are CLEAN from scratch. Consequence: the clause measures *where the tool file lives*, not what it reads,
for any tool inside the wave dir — the candidate at `K93ExecTool/seat-route.mjs` (sha256 `98a5a3a3…`,
matches its `READY`) would read VIOLATION on its own source, so only an out-of-round copy is a valid
control. The shipped tool at `scripts/seat-route.mjs` is unaffected.

**F5 (advisory, cheap fixes).** (i) Diff the traced run's stdout against `oracle93.read_wave(<last wave>)`
— x7's traced run prints v1 records and would be caught by the comparison the counter already has the data
for. (ii) Trace at least one `--file` invocation as well. (iii) `realpath` every traced path before the
substring test, and compare against both the argv input and the tool's own source. (iv) Replace the
literal byte-grep with a structural check (no subprocess spawn, no path assembled at runtime). (v) Run the
tool once traced and once untraced and require identical stdout: x7 fails that differential by
construction.

## Bounds

Read-only outside this seat dir; no lane file, fixture, control or probe touched. Scratch
`/fast/scratch/hyaku/kumitate-r93/K93ExecRuntime/` removed after the runs. No package installs. The
candidate (`K93ExecTool/seat-route.mjs`) was only read: sha256 `98a5a3a3…` = its `READY`, kill-(d)
literals 0. No commit, push or lane mutation.

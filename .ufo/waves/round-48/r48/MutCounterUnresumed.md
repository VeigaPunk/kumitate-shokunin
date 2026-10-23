# MutCounterUnresumed — parser attack: unfinished record whose resume never arrives

Seat `kumitate-r48-MutCounterUnresumed` (mutation tester, leaf). Round 48 attempt 2, wave `r48`.
Frozen tip `fe3d45bf929246915c8c0de5f7f8682b5015b22c`. Sandbox clone
`/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutCounterUnresumed/lane` (detached at the tip; no
write in any real checkout). 2026-10-23 15:24–15:27 -03, load1 56.5–57.0 during the recorded runs.
No tool installed or updated. No process left running.

**RESULT: KILLED.** The frozen parser meets the attacked claim — a synthetic trace whose traced record is
left `<unfinished ...>` with no resume exits 2 with `CAPROUTE48: ERROR 1 traced record(s) never resumed …` —
and the off-by-one mutant that tolerates exactly one dangling record is caught by 3 of the detector's 6
cases while both parse controls and the truncated-write case stay unchanged.

## Claim attacked

Counter `.ufo/waves/round-48/probe/caproute48-probe.mjs`, header (`:27-32`) and plan § C1 / attempt-2
addendum (R47-5): “every entry still pending at the end of the log is exit 2”. One guard implements it:

```
193    if (pending.size > 0) {
194      const [pid, pe] = [...pending][0];
195      die(`${pending.size} traced record(s) never resumed (first: pid ${pid} ${pe.call})`);
196    }
```

Supporting path, read only: an unfinished traced record is captured at `:153-158` (`body.endsWith('<unfinished ...>')`,
`pending.set(pid, …)`), a resume joins and clears it at `:162-169`, `die` is `:90`, and `parseLog` spans
`:140-198`. Frozen bytes verified three ways — lane working file, committed blob
(`git cat-file -p fe3d45bf:…/caproute48-probe.mjs`), and the detector's own reported hash — all
`sha256 f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`, 19 813 B, matching the plan's
hash.

## Detector (bounded, parser-level)

Harness in the seat, three files:

| file | sha256 |
|---|---|
| `extract.mjs` | `b0175394cc8ec0e10ae0b2984f4a4730ddeb9292b1bddfb44c935648ab2d54d6` |
| `run-parse.mjs` | `17497bd848446cf9f80d691409a238cb27144b3047e8f512b5f3d0a9ac7aa138` |
| `detector.mjs` | `ba3f0e18de124884530d763de063a71f7cfb43e03422f08e0a534fb6ef6adab0` |

`extract.mjs` does **not** re-implement the parser. It copies two byte ranges of the target file verbatim —
head `1-90` (constants + the counter's own `die`, sha256 `af5e9c909d0c6a888150ca22396ef78710b42687bff6143615d3f55eb285fe7f`)
and parser chunk `104-198` (`parseStrings` + `parseLog`, pristine sha256 `0b25551e01edf845309969429373bfbad79b61f1145af55f24e18515c5d91325`)
— appends one `export { parseLog };` line, and asserts the counter's `die` line is present verbatim
(`CAPROUTE48: ERROR`, `process.exit(2)`). It excludes only the CLI block (argv + `git rev-parse`, which would
die on this invocation) and `runGate`/`judge`/main; nothing in the copied ranges references them. The
detector spawns `run-parse.mjs` once per case, so each `die` is observed as a real process exit code, not an
exception. The extracted-module hash is printed per run, so a drifted extraction would be visible: pristine
`58480597f8e3205871479c505f7f6c231c2ae5ae8805a5b39943f84cc50aa2bc`, mutant
`1be66b30ba4791e75231ea06120d9766bd4713c69edcaeec1dcfe614c16f23f3`.

Cases (synthetic strace text, one process per case because `die` exits):

| case | trace | expect |
|---|---|---|
| `never-resumed` | one `execve(…) <unfinished ...>`, log ends | exit 2 `never resumed` |
| `never-resumed-with-other-tracees` | complete `clone3` + complete root `execve`, leaf `execve <unfinished ...>`, no resume | exit 2 `never resumed` |
| `never-resumed-tracee-killed` | unfinished `execve`, then the real `31337  +++ killed by SIGKILL +++` marker | exit 2 `never resumed` |
| `strace-truncated-mid-write` | record cut mid-argv, no return at all (adjacent shape) | exit 2 `unparsed return` |
| `complete-control` | the same three-process shape with every return present | parse OK |
| `resumed-control` | unfinished `execve` + interleaved record + `<... execve resumed>)           = 0` | parse OK, `resumed=1` |

Invocation (seat root; `TARGET_SHA256` is display-only): `node detector.mjs <probe> <workdir>`.

## Actual output

Pristine, lane's frozen file `f24a3af5…`, load1 56.53 — receipt sha256
`ae64cd777047d96c237f989fc02304e785eafe739e596fa93cb5bffac8b28fa4`:

```
CASE never-resumed expect_exit=2 exit=2 PASS first="CAPROUTE48: ERROR 1 traced record(s) never resumed (first: pid 31337 execve)"
CASE never-resumed-with-other-tracees expect_exit=2 exit=2 PASS first="CAPROUTE48: ERROR 1 traced record(s) never resumed (first: pid 4343 execve)"
CASE never-resumed-tracee-killed expect_exit=2 exit=2 PASS first="CAPROUTE48: ERROR 1 traced record(s) never resumed (first: pid 31337 execve)"
CASE strace-truncated-mid-write expect_exit=2 exit=2 PASS first="CAPROUTE48: ERROR unparsed return in execve record of pid 4242: …"
CASE complete-control expect_exit=0 exit=0 PASS first="PARSED execs=2 resumed=0 root=4242 parents=1 execveat=0"
CASE resumed-control expect_exit=0 exit=0 PASS first="PARSED execs=1 resumed=1 root=4242 parents=0 execveat=0"
DETECTOR: PASS cases=6 failed=0 target_sha256=f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2
```

The baseline is valid (pristine passes), so a mutant failure below is a kill, not an inconclusive run.

## Mutant

Smallest behaviour-bearing edit, in the sandbox clone only — the guard's cardinality, one digit
(`r48/MutCounterUnresumed.patch`, 356 B, sha256 `82f0ddef2e1b9876b636d2961b1b6f233846d882857a870489efe6ab05613f6c`):

```diff
-  if (pending.size > 0) {
+  if (pending.size > 1) {
```

A plausible defect: reading the trailing unfinished record as “the normal last record” and tolerating one,
which silently restores the pre-fix (A2) acceptance for the single-record case. `node --check` printed
`MUTANT_SYNTAX_OK` / `BEFORE_SYNTAX_OK`. Pristine `f24a3af5…` (19 813 B) → mutant
`d55dcdcc4fd3dc834786c1ad0cdf2c86e3a1f08d2c871b659847341f76c2bfb8` (19 813 B; same size, single character).
The extractor's head sha is unchanged under the mutation while the parser-chunk sha changes
(`0b25551e…` → `9758c10c…`), confirming the edit is confined to the parser.

Mutant, load1 56.97 — receipt sha256 `70baa4caaed561f004904ce8f9280d2b03fb2e49fc1d2d087fb56df18b1379ae`:

```
CASE never-resumed expect_exit=2 exit=0 FAIL first="PARSED execs=0 resumed=0 root=null parents=0 execveat=0"
CASE never-resumed-with-other-tracees expect_exit=2 exit=0 FAIL first="PARSED execs=1 resumed=0 root=4242 parents=1 execveat=0"
CASE never-resumed-tracee-killed expect_exit=2 exit=0 FAIL first="PARSED execs=0 resumed=0 root=null parents=0 execveat=0"
CASE strace-truncated-mid-write expect_exit=2 exit=2 PASS first="CAPROUTE48: ERROR unparsed return in execve record of pid 4242: …"
CASE complete-control expect_exit=0 exit=0 PASS first="PARSED execs=2 resumed=0 root=4242 parents=1 execveat=0"
CASE resumed-control expect_exit=0 exit=0 PASS first="PARSED execs=1 resumed=1 root=4242 parents=0 execveat=0"
DETECTOR: FAIL cases=6 failed=3 target_sha256=d55dcdcc4fd3dc834786c1ad0cdf2c86e3a1f08d2c871b659847341f76c2bfb8
exit=1
```

**Verdict: KILLED — targeted.** All three never-resumed cases flip exit 2 → exit 0 (silent acceptance);
the truncated-write case still exits 2 through the independent return-parse guard (`:173-174`), and both
parse controls are byte-identical on pristine and mutant. Nothing incidental fired.

Why it matters, from the code path (not from a full counter run): two of the three failing cases parse to
`root=null`, and `runGate` still rejects a log with no execve at `:219` (`no execve recorded …`, exit 2), so
those two shapes are masked downstream. The load-bearing case is `never-resumed-with-other-tracees`: it
parses to `root=4242`, so `runGate` accepts the log and judgment proceeds with the never-resumed record's
exec silently absent — the exact unevaluable-log-scored-as-data class the guard was added for. [INFERENCE]
The consequence there is a missing exec (and possibly a broken ancestry edge), i.e. an under-counted site →
`ROUTED_MISS`/`exec_count_ne_base`, not a fabricated capped chain; this mutant cannot manufacture
`ROUTED_HELD`, it can only stop an exit 2 from happening.

## Restoration evidence

| step | bytes | sha256 |
|---|---|---|
| before mutation (clone = lane = committed blob) | 19 813 | `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` |
| mutant | 19 813 | `d55dcdcc4fd3dc834786c1ad0cdf2c86e3a1f08d2c871b659847341f76c2bfb8` |
| after restore (`cp` from pre-mutation copy) | 19 813 | `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` |

`cmp -s` pristine vs restored → `RESTORED_BYTES_IDENTICAL_True`; `git -C lane status --porcelain` → empty
(0 lines); `HEAD=fe3d45bf929246915c8c0de5f7f8682b5015b22c`. Restored detector run, load1 56.57, receipt
sha256 `09597f28fbbc196df9d3a6e3316759bda289cff78c76651051e77b8a643fec0b`: `DETECTOR: PASS cases=6 failed=0`,
and its six `CASE`/`DETECTOR` lines are byte-identical to the pristine receipt (`cmp` on the filtered lines;
the only receipt difference is the extractor's output path). The lane's own probe file was re-hashed after
all runs: `f24a3af5…`, unchanged.

## Bounds, limits, artefacts

- Wrote only the sandbox clone and seat, `/tmp` (case logs under the seat work dir), and
  `r48/MutCounterUnresumed.md` + `r48/MutCounterUnresumed.patch`. No write to the lane repo outside `r48/`,
  no writes to `scripts/`, `.jj`, `.ufo/state`, `.ufo/watchdog.log`; no git write anywhere except the
  clone's file restore by copy (no commits needed).
- The detector is parser-level, not a counter score: the counter hard-codes scratch under
  `/fast/scratch/hyaku/kumitate-r48/probe-runs` (outside this seat's write scope), and the attacked
  behaviour is a pure function of log text. The exit codes above are measured on the counter's own bytes.
- Not tested here: whether a killed tracee during a real gate run also leaves a *complete-looking* record
  (the truncated-mid-write case covers the other write shape and exits 2). Different guard from sibling
  `MutCounterPidReuse` (PID reuse at `:188-191`); no overlap. The F48 sentence, counter and predicate were
  not amended by this seat.

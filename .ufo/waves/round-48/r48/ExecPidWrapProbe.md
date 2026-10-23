# ExecPidWrapProbe — padded-prefix / PID-wrap recurrence probe (round 48, attempt 2)

Seat: `ExecPidWrapProbe` (leaf, labrat-class probe). Wave `r48`.
Sandbox: `/fast/scratch/hyaku/kumitate-r48a/seats/ExecPidWrapProbe/` (clone of the lane repo at
`fe3d45bf929246915c8c0de5f7f8682b5015b22c`).
Scope: probe the recurrence of the R47-5 second cause (strace's padded PID prefix after a host PID
wrap) on **this** host at attempt-2 time, and confirm that the frozen F48 parser accepts such logs.
No lane-repo writes; no git/jj mutations in any real checkout.

## Verdict (one line)

**The recurrence is LIVE on this host and the frozen F48 parser handles it correctly.** A real host
PID wrap was captured inside a real trace during this seat's run; on that log the frozen F48 parser
reads `n=106, capped=106, why=[]` while the round-47 A2 parser reads `n=104, capped=102` with
`why=["no_cap_run_ancestor","no_capped_scope_ancestor"]`. The full frozen counter, run end-to-end at
the freeze commit **while the host PID counter wrapped mid-run**, exited 0 with `held=5/5 rule=F48`.
No amendment to F48 is forced by this probe.

---

## 1. Host PID state at attempt-2 time (measured)

| quantity | value | source |
|---|---|---|
| `pid_max` | `4194304` | `/proc/sys/kernel/pid_max` |
| `ns_last_pid` at seat start (15:23:53 −03) | `610428` | `/proc/sys/kernel/ns_last_pid` |
| `ns_last_pid` at seat end (16:0x −03) | `3758254` | same |
| `pid_max` reached during the seat | `4194304` | observed (see §2) |
| strace | `strace -- version 7.2` | `/usr/bin/strace` |
| node | `v24.21.0` | `node -v` |
| `nproc` / load1 at start | `32` / `8.10` | `/proc/loadavg` |

`pid_max = 4194304` is unchanged from attempt 1. **The counter wrapped more than once during this
seat's ~45 minutes of work** (§2), so the wrap is not a rare event on this host at attempt-2 time.

### PID burn rate (measured, 45 s window at 15:31 −03)

```
t0=2604011  t1=2741533  dt=45s  delta=137522  rate=3056 PIDs/s
remaining to pid_max = 1452771   => ETA to wrap = 475 s (~7.9 min)
```

Under the concurrent load of this wave (many seats tracing at once) the host burns ~3000 PIDs/s, so
the 4.19 M PID space is exhausted every ~23 minutes. A wrap is therefore **near-certain** inside any
counter run, not an edge case.

---

## 2. A REAL host PID wrap, captured (primary evidence)

`wrapwatch.sh` (sandbox) ran `strace -f` traces of `node scripts/anchor-truth.mjs --selftest` in
the sandbox clone, reading `ns_last_pid` before and after each trace. Output:

```
run=1 status=0 before=2872658 after=3061219 wrap=no  pid_max=4194304 t=0
run=2 status=0 before=3061225 after=3326715 wrap=no  pid_max=4194304 t=67
run=3 status=0 before=3326728 after=3704307 wrap=no  pid_max=4194304 t=163
run=4 status=0 before=3704326 after=4029650 wrap=no  pid_max=4194304 t=246
run=5 status=0 before=4029658 after=798755   wrap=YES pid_max=4194304 t=314
WRAP_OBSERVED at run 5
runs=5 elapsed=378s final_ns_last_pid=798792
```

`logs/wrap/run-5.log` (sha256 `f1300bc76ee815986e4c4f73b179d58ac67a6e2743c24a7af62ad171cbe90a93`)
is a **genuine wrap-spanning trace**: PID-column range `1487 … 4193661`, with the first 723 records
pre-wrap (`>= 4029663`) and the remaining 6124 post-wrap (`<= 794736`).

### 4–5 digit PID prefixes and padded lines

| log | 4-digit | 5-digit | 6-digit | 7-digit | **padded lines (PID + 2+ spaces)** |
|---|---|---|---|---|---|
| `logs/at802-trace-1.log` (no wrap) | 0 | 0 | 3984 | 2877 | 0 |
| `logs/at802-trace-2.log` (no wrap) | 0 | 0 | 3985 | 2873 | 0 |
| `logs/at802-trace-3.log` (no wrap) | 0 | 0 | 3985 | 2870 | 0 |
| `logs/wrap/run-5.log` (**real wrap**) | **54** | **276** | 5526 | 991 | **54** |

Real padded lines from `run-5.log` (byte-exact, `cat -A`):

```
1487  execve("/usr/bin/git", ["/usr/bin/git", "-C", "/tmp/anchor-truth-selftest-mZztgR/bas
2515  execve("/usr/bin/systemctl", ["systemctl", "--user", "show", "-p", "Result", "-p", "
3043  execve("/usr/bin/systemctl", ["systemctl", "--user", "kill", "-s", "KILL", "cap-run-
```

### The padding rule (measured, not assumed)

strace renders the PID field **left-justified in a 5-column field, then one space** (`%-5d `):

```
pid 3      -> "3    " + " "   => "3     execve(...)"     (1 digit + 5 spaces)
pid 1487   -> "1487 " + " "   => "1487  execve(...)"     (4 digits + 2 spaces)
pid 765357 -> "765357" + " "  => "765357 execve(...)"    (6 digits + 1 space)
```

Verified byte-exactly (`xxd`: `33 20 20 20 20 20 65 78 65 63 76 65` = `3` + 5 spaces + `exe`) on a
PID-namespace trace (`logs/pidns-small.log`, sha256 of the run recorded in §5) and on the real
`run-5.log`. The rule holds with and without `--decode-pids=pidns` and is independent of the log's
maximum PID width (a 7-digit PID in the same log is followed by exactly one space).

**Therefore: the padding appears iff a PID in the log has fewer than 5 decimal digits**, i.e. iff
the record's PID is `< 10000`. After a host PID wrap the counter restarts low, so a *window* of the
log carries `< 10000` PIDs — exactly the R47-5 second cause.

---

## 3. The frozen F48 parser accepts the padded prefixes (and A2 does not)

The parser tested is the **frozen counter's own `parseLog`**, extracted verbatim from the counter
**as committed at `fe3d45bf`** (`git show fe3d45bf:.ufo/waves/round-48/probe/caproute48-probe.mjs`,
sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`), together with its
`ancestorsOrSelf`, `scopeProps`, `isScope`, `isBwrap` and `judge`. Its prefix regex is
`/^(\d+) +(.*)$/`; the round-47 A2 regex is `/^(\d+) (.*)$/`.

| log | frozen F48 (`parseLog`+`judge`) | round-47 A2 |
|---|---|---|
| `at802-trace-1.log` (no wrap) | OK `execs=1795 parent=3011 rootPid=765357 resumed=42` → `{"n":106,"capped":106,"why":[]}` | `{"n":104,"capped":103,"why":["no_capped_scope_ancestor","no_cap_run_ancestor"]}` |
| `at802-trace-2.log` (no wrap) | OK `resumed=39` → `{"n":106,"capped":106,"why":[]}` | `{"n":103,"capped":103,"why":[]}` |
| `at802-trace-3.log` (no wrap) | OK `resumed=36` → `{"n":106,"capped":106,"why":[]}` | `{"n":103,"capped":101,"why":["no_capped_scope_ancestor","no_cap_run_ancestor"]}` |
| **`wrap/run-5.log` (REAL wrap)** | **OK `execs=1795 parent=3011 rootPid=4029663 resumed=28` → `{"n":106,"capped":106,"why":[]}`** | `{"n":104,"capped":102,"why":["no_cap_run_ancestor","no_capped_scope_ancestor"]}` |
| `wrap/run-1..4.log` (no wrap) | OK, all → `{"n":106,"capped":106,"why":[]}` | 106/106, 106/105, 106/106, 106/106 |
| `at802-padded3.log` (padded, 3282 padded lines) | OK `execs=565 parent=1061 rootPid=3` | `{"n":0,...}` — **loses every record** |

Differential on the real wrap log (`wrap/run-5.log`), record-level:

```
f48_traced_records_recognized = 6819      f48_traced_records_missed = 28 (all "<... resumed>" forms)
a2_traced_records_recognized  = 6765      a2_traced_records_missed  = 82
a2_loss_vs_f48               = 54         <- exactly the 54 padded records
```

Every one of the 54 records A2 loses is a padded-prefix record; A2's `^(\d+) (.*)$` leaves a leading
space in the body, so A2's `^(execveat|execve|clone3?|v?fork)\(` no longer matches and the record
is silently skipped (not even an exit-2). F48's `^(\d+) +` absorbs the padding and parses all 54.

Note the A2 `n` on the wrap log is 104, not 106: two of the site's `anchor-truth.mjs --selftest`
children are among the lost records, which is exactly the R47-5 mechanism (a runner's execve lost →
its child's chain broken → `no_cap_run_ancestor`).

### Independent padded-log reproduction (no host wrap needed)

`unshare -U -p -f` (user+PID namespace) makes every PID small, so every record is padded. Three
such traces of `node scripts/anchor-truth.mjs --selftest` were captured
(`logs/at802-padded.log`, `at802-padded2.log`, `at802-padded3.log`; the last is sha256
`6765d8a0d39c5c1dc6efe9b66244a729bf0b5dc35f5e6faa733f1bfb28ebe4d3`), each with **3282 padded
lines** (PID-width histogram: 236×1-digit, 227×2, 2653×3, 166×4). The frozen F48 parser parses all
three cleanly (`execs=565 parent=1061`, no `die`); the A2 parser recognizes **0** of them.
(The `anchor-truth` selftest itself fails 0/44 inside a user namespace — a fixture-path artifact of
the namespace, not a parser matter.)

---

## 4. The frozen counter end-to-end, spanning a real wrap → exit 0, held=5/5

The frozen counter was run unmodified except for one line (`SCRATCH`, redirected into this seat's
sandbox because the frozen path `/fast/scratch/hyaku/kumitate-r48/probe-runs` is outside this
seat's write bounds). Diff of the sandbox copy against the committed freeze is exactly that one
line; `parseLog`/`judge` are byte-identical to `fe3d45bf`.

```
node counter/caproute48-probe.mjs <sandbox-lane> fe3d45bf929246915c8c0de5f7f8682b5015b22c --set r47
RUN anchor-truth base0 exit=0 cases=44/44 execs=1053 resumed=24 verdict_pass=true fail_lines=0
RUN anchor-truth rev0  exit=0 cases=44/44 execs=1795 resumed=42 verdict_pass=true fail_lines=0
RUN anchor-truth rev1  exit=0 cases=44/44 execs=1795 resumed=34 verdict_pass=true fail_lines=0
RUN anchor-truth rev2  exit=0 cases=44/44 execs=1795 resumed=34 verdict_pass=true fail_lines=0
SITE AT802 gate=anchor-truth label=ROUTED_HELD capped/n=106/106,106/106,106/106 base_n=106 ...
SITE K488  gate=kimi-census  label=ROUTED_HELD capped/n=53/53,53/53,53/53 base_n=53 ...
SITE SC549 gate=sources-check label=ROUTED_HELD capped/n=42/42,42/42,42/42 base_n=42 ...
SITE SC859 gate=sources-check label=ROUTED_HELD capped/n=1/1,1/1,1/1 base_n=1 ...
SITE CC879 gate=claims-check label=ROUTED_HELD capped/n=46/46,46/46,46/46 base_n=46 ...
CAPROUTE48 rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c base=0bd8be60 set=r47 held=5/5 runs=3 rule=F48
EXIT=0
```

**This run spanned a real host PID wrap.** `ns_last_pid` before the counter run = `2317506`;
after = `1037116`; `pid_max = 4194304`. The counter consumed
`(4194304 − 2317506) + 1037116 = 2 913 914` PIDs in 245 s — **69.5 % of a full PID cycle**, i.e. it
necessarily crossed the wrap point, and the counter still exited 0 at `held=5/5`.

---

## 5. Residual risk: the exit-2 rules under a wrap (measured, not assumed)

The frozen counter's fail-closed rules, checked against the real wrap log `wrap/run-5.log`:

| frozen rule | fired on `run-5.log`? | evidence |
|---|---|---|
| `unparsed trace line` (non-empty line not matching `^(\d+) +`) | **no** | 0 such lines (6847 lines, all match) |
| `unparsed return in <call> record` | **no** | parser ran to completion |
| `resumed <call> record with no pending entry` | **no** | 28 resumed records, all resolved |
| `<n> traced record(s) never resumed` | **no** | pending map empty at end |
| **`pid <rv> created twice in one log`** | **no** | all 2993 clone/fork return values distinct; 0 reused |

The last rule is the one a wrap could plausibly trip, and it did **not** fire in the real capture:
the 991 pre-wrap records and the 5856 post-wrap records occupy **disjoint** PID ranges
(`>= 4029663` vs `<= 794736`), and the parent-map key space (host PIDs from `clone`/`fork` returns
plus thread TIDs from `clone3` returns) has **0 duplicates** (2985+26 resumed = 3011 keys, all
distinct). A clone3 TID never coincides with a host PID-column value in this capture
(intersection 0), so TIDs and PIDs remain separable.

**But the rule is reachable.** I constructed the collision deliberately: rewriting one *pre-wrap*
`clone` return in `run-5.log` to a value that the *post-wrap* segment also creates makes the frozen
parser abort with

```
FROZEN-PARSER-DIE: pid 6447 created twice in one log (reuse or an untranslated PID-namespace return)
exit code = 2
```

— the counter's `die()` path, i.e. **exit 2 = recorded, never a score**. A log long enough to cross
the wrap point *and* re-use a PID value would therefore produce an exit-2 run rather than a wrong
score. That is the fail-closed behaviour the plan wants, but it is a **real** path: the L1's C1
score run and every committed wave re-run must be read carefully for `exit 2` (recorded, never a
score) rather than being assumed to be 4/4.

Estimated exposure: a single gate trace consumes ~289 000 PIDs ≈ **6.9 %** of the PID space; the
counter's 3 concurrent rev runs + 1 base run consume ≈ **28 %** of a cycle per invocation. The
probability that any given trace *starts* within the low-PID window after a wrap is therefore of
order 7 %, and the probability that a wrap falls *inside* a given trace is of order the same. Over
the ≥3 runs the kill rule requires, the chance of at least one exit-2 run is material — this is the
quantitative form of attempt-1's observation that the loss "grew with load".

---

## 6. Statements this probe does and does not support

Supported:
* The padded-prefix recurrence is **live on this host at attempt-2 time** (§2: a real wrap inside a
  real trace, 54 padded records).
* The **frozen F48 parser accepts padded prefixes** and reads the wrap-spanning log identically to a
  non-wrap log: `{"n":106,"capped":106,"why":[]}` (§3).
* The round-47 **A2 parser is what breaks**: it silently loses exactly the 54 padded records
  (`n=104`, `why=["no_cap_run_ancestor","no_capped_scope_ancestor"]`) (§3). The R47-5 second cause
  is confirmed, and the F48 prefix fix `^(\d+) +` is the correct and sufficient remedy for it.
* The frozen counter **survives a wrap** end-to-end: `held=5/5 rule=F48` exit 0 while the host PID
  counter wrapped mid-run (§4).
* The counter's **exit-2 fail-closed rules are reachable but did not fire** on the real capture; a
  deliberate PID-reuse injection reproduces the exit-2 path (§5).

Not supported / out of scope for this seat:
* **No claim about C1's 4/4 at the C1 commit.** The C1 commit does not exist yet; this probe scored
  the **r47 set** at the freeze commit (`held=5/5`), which is the plan's H2-style baseline, not C1's
  after-state. Nothing here is a candidate score for C1 and nothing here amends F48.
* **No claim that the counter is load-independent.** §5 quantifies the opposite: the wrap window is
  load-dependent through *which* records occur, exactly as the plan states.
* **No claim about `scripts/counter-rerun.mjs` (C2)** — out of this seat's scope.
* The **synthetic** post-wrap logs (`synth-wrap*.mjs`, `at802-trace-1-postwrap*.log`) are
  *supporting* artefacts only; the authoritative evidence is the real `wrap/run-5.log`. One caveat
  recorded honestly: the synthetic renumbering loses one site candidate (105/106 instead of
  106/106). I traced this to a synthesis artefact — my renumbering maps thread TIDs into the same
  numeric space as host PIDs, which manufactures parent-map entries that the real kernel keeps
  disjoint (measured: clone3 TIDs ∩ host PID-column values = 0 in the real log). The real capture
  `wrap/run-5.log` shows no such loss, so the F48 parser is not implicated.

---

## 7. Files (all under this seat's sandbox; nothing written to the lane repo)

```
/fast/scratch/hyaku/kumitate-r48a/seats/ExecPidWrapProbe/
  lane/                                  clone at fe3d45bf (sandbox only)
  logs/at802-trace-{1,2,3}.log           3 concurrent strace traces, no wrap
  logs/at802-padded{,2,3}.log            user+pid-namespace traces, 3282 padded lines each
  logs/pidns-small.log, logs/bwrap-pidns.log   byte-exact padding probes
  logs/wrap/run-{1..5}.log               wrapwatch traces; run-5 SPANS A REAL WRAP
  logs/wrap/run-5-reuse.log              deliberate PID-reuse injection (exit-2 path)
  logs/host-state-before.txt             pid_max / ns_last_pid / tool versions
  analysis/run-frozen.mjs                harness: frozen parseLog+judge (from fe3d45bf) on a log
  analysis/differential.mjs              record-level F48-vs-A2 differential
  analysis/an-f48.mjs, an-a2.mjs         the plan's own rc/ analysis scripts (verbatim copies)
  analysis/synth-wrap{2,3,4}.mjs         synthetic post-wrap transforms (supporting only)
  counter/caproute48-probe.mjs           frozen counter, ONLY the SCRATCH line changed
  wrapwatch.sh                           the wrap-detecting trace loop
```

The frozen counter sha256 `f24a3af5…` (committed at `fe3d45bf`) is unchanged in the repo; the
sandbox copy `counter/caproute48-probe.mjs` differs from it by exactly one line (the `SCRATCH`
constant) and nothing else.

**Note for the L1 (informational, not a finding of this seat):** the lane working tree's
`caproute48-probe.mjs` currently reads `sha256 df42ab6b…` and carries an **A48** amendment
(per-case `PASS/FAIL/SKIP` line corroboration, `rule=F48+A48`) that is **uncommitted**; the
committed freeze still reads `f24a3af5…` with `rule=F48`. This seat's measurements were taken
against the committed `fe3d45bf` bytes (`f24a3af5…`); the A48 delta does not touch `parseLog` or
the prefix regex (verified by diff), so none of this probe's conclusions change under A48.

## 8. Tools

No installs were performed. Everything used was already present: `strace 7.2` (`/usr/bin/strace`),
`node v24.21.0`, `git` (read-only), `python3` 3.14 (analysis only), `bash`, `unshare`.
No pacman transaction, no service restart, no network fetch.

## 9. Recommended for the L1

1. **F48 needs no amendment from this probe.** The padded-prefix fix is confirmed sufficient on a
   real wrap-spanning log; no pre-data control read `ROUTED_HELD` because of it.
2. **When reading C1's score run and the committed wave re-runs, treat `exit 2` as a live
   possibility**, not a formality: a wrap inside a trace makes the "pid created twice in one log"
   rule fire (§5). Per the plan, an exit-2 run is **recorded and never a score**; if the L1's score
   run or a wave re-run reads exit 2, the correct reading is "cannot evaluate", and the re-run
   should be repeated rather than recorded as a miss.
3. The A2-vs-F48 record-level differential (`a2_loss_vs_f48 = 54` on the real wrap log) is a
   ready-made regression oracle for any future counter edit: re-running
   `analysis/differential.mjs` over a wrap-spanning log must keep `a2_loss_vs_f48 = 0` for F48.

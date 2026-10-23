# ExecCounterRerun — round 48, C2 build: `scripts/counter-rerun.mjs`

**Seat:** `ExecCounterRerun` (executor, wave `r48`, attempt 2). **Lane:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
**Freeze tip:** `fe3d45bf929246915c8c0de5f7f8682b5015b22c`. **Sandbox clone:** `/fast/scratch/hyaku/kumitate-r48a/seats/ExecCounterRerun/lane`
(built with `git clone --no-hardlinks` + `git checkout --detach fe3d45bf`; the lane repo was never written to).

**Deliverables**

| file | what |
|---|---|
| `.ufo/waves/round-48/r48/ExecCounterRerun.patch` | the new file as a diff against the freeze tip (sandbox commit `88bb4ba`, `user.name=seat`) |
| `.ufo/waves/round-48/r48/ExecCounterRerun.md` | this report |
| `.ufo/waves/round-48/r48/ExecCounterRerun-agree.txt` | live demonstration receipt over the frozen F48 counter (r47 set, `--runs 2`) → `AGREE`, exit 0 |
| `.ufo/waves/round-48/r48/ExecCounterRerun-disagree-r48base.txt` | the DISAGREE-arm receipt (r48 set at `f00cf278`, `--runs 2`) → `DISAGREE`, exit 1 |
| `.ufo/waves/round-48/r48/ExecCounterRerun-selftest.txt` | the selftest transcript (14/14) |

The patch adds exactly one file, `scripts/counter-rerun.mjs`; it touches nothing else in the lane.

---

## 1. The instrument

The header of the new file carries the predicate sentence **verbatim** from `plan.md` § C2 (one
sentence, the `COUNTER_RERUN` label sentence), and the L1's binding correction (3): the header
states explicitly that the capability claimed is **final-summary-line agreement ONLY** — the
per-site and per-run lines above the summary line are *not* compared, an `AGREE` verdict means
"this counter's headline number reproduced", never "this counter's whole output reproduced" and
never "this counter's site-level reading is correct". The inherited round-47 A2 reruns (identical
`held=3/5` final line masking differing site lines) are named in the header as the reason for
that restriction.

**CLI**

```
node scripts/counter-rerun.mjs --selftest
node scripts/counter-rerun.mjs --probe <abs-probe> --lane <abs-lane> --rev <rev> [--runs K] -- <probe args>
```

The counter is launched as `node <probe> <lane> <rev> <probe args...>` — the lane and the rev are
the counter's first two positional arguments (the calling convention of the lane's own counters,
e.g. `caproute48-probe.mjs <lane-repo> <rev> [--set r48]`), the arguments after `--` follow them.
The lane is also the working directory of the child, and the child's stdout is captured as
**bytes**, so the comparison is a byte comparison and not a decoded-string comparison.

**Final summary line.** The last non-empty line of the child's stdout, with one trailing CR
removed (CRLF). Nothing else is read. If the child wrote no such line the run is *unparsable*
and the instrument fails closed (exit 2) — it never compares an empty string.

**Fail-closed inputs** (checked *before* any child runs): the probe must be an existing readable
regular file; the lane must be an existing readable directory that is a git repository; the rev
must resolve to a commit inside it (`git rev-parse --verify --end-of-options <rev>^{commit}`,
read-only, `GIT_OPTIONAL_LOCKS=0`). Any failure → exit 2, nothing is scored.

**Per-run record** (one line per run, so a receipt is readable without a rerun):

```
COUNTER_RERUN_RUN run=<i> exit=<code> wall_ms=<ms> load1=<x> stdout_bytes=<n> stderr_bytes=<n>
  summary_sha256=<hex> summary=<json string>
```

`load1` is the first field of `/proc/loadavg`, read immediately before the run; `wall_ms` is the
monotonic wall time of the run.

### Exit map

| exit | meaning |
|---|---|
| 0 | `COUNTER_RERUN: AGREE (runs=K)` — every run exited 0 **and** every run's final summary line was byte-identical |
| 1 | `COUNTER_RERUN: DISAGREE` — a run exited non-zero, or two runs' final summary lines differ (each reason on its own `COUNTER_RERUN_REASON:` line) |
| 2 | fail-closed: unreadable probe / lane / rev, or unparsable output (no final summary line), or the counter itself exited 2 (its own "cannot evaluate" arm — propagated so that an evaluation failure is never recorded as a measured disagreement) |
| 64 | usage error (nothing ran) |
| `--selftest` | 0 when every case passes, 1 otherwise |

---

## 2. Selftest — 14 cases, hermetic, all passing

`node scripts/counter-rerun.mjs --selftest` → `COUNTER_RERUN_SELFTEST: PASS`, exit 0.
Transcript: `.ufo/waves/round-48/r48/ExecCounterRerun-selftest.txt`.
Every case runs against **fixture counters written into a temp directory** (no network, no lane
checkout; the only git is a throwaway one-commit repository used to exercise the rev-resolution
arm). Every case **spawns this very file as a child**, so the real probe path is exercised end to
end — the instrument's decision path is never stubbed, and the evidence is the child's exit code
and its stdout, not a banner the instrument prints about itself.

| # | case | expectation |
|---|---|---|
| 1 | fixture lane: a throwaway git repository with one commit exists | (fixture sanity) |
| 2 | usage: no arguments exits 64 with a usage line | 64 |
| 3 | usage: bad `--runs`, unknown flag and a missing `--` all exit 64 | 64 ×3 |
| 4 | fail-closed: an unreadable probe, lane or rev exits 2 (nothing is scored) | 2 ×3 |
| 5 | agreement: a stable counter over 3 runs prints `COUNTER_RERUN: AGREE (runs=3)` exit 0 and one record per run | 0 + 3 records, each with `exit=0`, `wall_ms=`, `load1=`, `summary=` |
| 6 | **flake injection: a counter whose final summary line differs between runs DISAGREEs (exit 1)** | 1 + `COUNTER_RERUN: DISAGREE` + a reason line |
| 7 | a counter that exits non-zero DISAGREEs even when its summary lines are identical | 1 |
| 8 | a counter that exits 2 (cannot evaluate) fails closed with exit 2 | 2 |
| 9 | unparsable output (no final summary line) fails closed with exit 2 | 2 |
| 10 | always-PASS stub: identical summary lines AGREE, **and the counter was really executed K times** | 0 + invocation counter = 3 |
| 11 | a stub that prints `PASS` with a varying suffix DISAGREEs (the comparison is byte-exact, not "contains PASS") | 1 |
| 12 | byte identity: summary lines that differ by one space DISAGREE | 1 |
| 13 | calling convention: the counter is called as `node <probe> <lane> <rev> <probe args...>` | the fixture records its argv |
| 14 | **mutation control: a stub that always prints PASS fails its own selftest** | both mutants exit non-zero and report `COUNTER_RERUN_SELFTEST: FAIL` |

### The mandatory flake-injection case (L1 correction 1)

Case 6's fixture is a counter whose **children all exit 0** while their final summary lines
differ from run to run (`FIXTURE_SUMMARY held=<n>/4 runs=3 rule=F48`, `n` incremented by a file
the fixture owns). The instrument must therefore reach the *disagreement* arm — not the
"non-zero exit" arm and not the fail-closed arm. The case asserts **exit 1**, the presence of
`COUNTER_RERUN: DISAGREE`, the **absence** of `COUNTER_RERUN: AGREE`, and the presence of a
reason line naming the differing final summary line. The evidence is the child's exit code and
stdout — the instrument's own verdict text is never the thing under test.

### Mutation controls run

Two seams are flipped, one at a time, in a **copy of the instrument file**; each mutant is run as
`node <mutant> --selftest` and **must fail its own selftest**:

| seam | mutant | what it simulates | killed by |
|---|---|---|---|
| `AGREE_ALWAYS` | `decide()` returns `AGREE` whatever the runs said | a verdict stub that always prints PASS | the flake-injection case (case 6) — the mutant's case 6 sees `AGREE` where `DISAGREE` is required |
| `PASS_STUB` | `main()` prints the AGREE line **without launching the counter at all** | a path stub that never touches the real probe path | the "the counter was really executed K times" check (case 10: the fixture's invocation counter stays 0) and the flake case |

Both mutants exit non-zero and print `COUNTER_RERUN_SELFTEST: FAIL`; the selftest asserts that
the *named* killing case is among the failures, so a mutant cannot die for an unrelated reason
and still count as killed.

### Two defects the selftest found in my own first draft (recorded, since both were real)

1. The flake fixture crashed (`writeSync` was not imported in the ESM fixture) → its output was
   empty → the instrument correctly reported *unparsable* → exit 2. The case caught it; the
   fixture was fixed.
2. The first mutation seam string occurred twice in the file (the constant and the string literal
   that named it), so the mutation was ambiguous and the control refused to run. The seam is now
   assembled from parts so it occurs exactly once, and the selftest asserts that uniqueness
   (a non-unique seam is itself a failure, not a silent skip).

---

## 3. Live demonstration receipt

`.ufo/waves/round-48/r48/ExecCounterRerun-agree.txt` — the instrument run over the **frozen F48
counter** `.ufo/waves/round-48/probe/caproute48-probe.mjs`
(sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`, unchanged), over the
**r47 set at `f00cf278`** with `--runs 2`:

```
node scripts/counter-rerun.mjs \
  --probe <lane>/.ufo/waves/round-48/probe/caproute48-probe.mjs \
  --lane  /fast/scratch/hyaku/kumitate-r48a/seats/ExecCounterRerun/lane \
  --rev   f00cf278a5ab57e87b18418fc972be9f893f65da \
  --runs 2 -- --set r47
```

**Why r47 and not r48** (this is the L1's binding correction (2), and the point
`CritC2Shape`/`CritReceiptPlan` raised): under the frozen predicate, `AGREE` requires **every
run to exit 0**. The r48 set at `f00cf278` reads `held=0/4` and the counter **exits 1** there
(`probe/caproute48-probe.mjs:377-378`), so an r48-base run is a *disagreement* by the predicate
and can never be an `AGREE` demonstration — a wrapper that reported `AGREE` for two identical
exit-1 runs would be weakening the frozen "iff". The r47 set at `f00cf278` is the exit-0 set:
the three committed stability receipts (`probe/receipts/stab-r47-f00cf278-{1,2,3}.txt`) read
`held=5/5 … rule=F48` with `exit=0`. The predicate is implemented verbatim and **not** weakened.

The receipt records, so that the two revisions can never be confused: the **instrument's** rev
(the sandbox clone's HEAD, `88bb4ba`) and the **target** rev (`f00cf278`) separately; the probe's
sha256; the lane path (a clone, distinct from the target rev); `load1` before and after; and the
per-run records (exit, final summary line, wall, load1) followed by the instrument's verdict line
and its exit code.

Observed result (recorded verbatim in the receipt):

```
COUNTER_RERUN_RUN run=1 exit=0 wall_ms=163336.78 load1=48.13 stdout_bytes=2318 stderr_bytes=0
  summary_sha256=f6f6bf06bbc134dd2126ccb9a3f74b51edb13db9e5f7cee15c62e32416542201
  summary="CAPROUTE48 rev=f00cf278a5ab57e87b18418fc972be9f893f65da base=0bd8be60 set=r47 held=5/5 runs=3 rule=F48"
COUNTER_RERUN_RUN run=2 exit=0 wall_ms=112186.95 load1=35.07 stdout_bytes=2315 stderr_bytes=0
  summary_sha256=f6f6bf06bbc134dd2126ccb9a3f74b51edb13db9e5f7cee15c62e32416542201
  summary="CAPROUTE48 rev=f00cf278a5ab57e87b18418fc972be9f893f65da base=0bd8be60 set=r47 held=5/5 runs=3 rule=F48"
COUNTER_RERUN: AGREE (runs=2)
instrument_exit=0
load1_start=48.13  load1_end=23.89
```

**Reading.** A real `AGREE` over the frozen F48 counter: both runs exited 0 (`held=5/5`,
`rule=F48`) and the two final summary lines are byte-identical — the same
`summary_sha256=f6f6bf06…` on both. The run took 4m36s under load1 48 → 24. The instrument's
own rev (`88bb4ba`, the sandbox commit carrying the new file, sha256
`c002523f…`) and the **target** rev (`f00cf278`) are recorded on separate lines, as required.

The r48-base set was **not** used as the AGREE demonstration: at `f00cf278` it reads `held=0/4`
and the counter exits 1, so under the frozen predicate that configuration is a DISAGREE by
construction (identical exit-1 runs are *not* an agreement). It is therefore left to the L1's
scoring run at the C1 commit, where the r48 set reads `held=4/4` exit 0 — this seat cannot
produce that configuration, because the C1 routing lives in other seats' patches.

**What the AGREE does and does not certify.** Per the frozen predicate and the header, it
certifies that the counter's *final summary line* reproduced byte-for-byte across two runs at
`f00cf278` — not that the whole output reproduced (the two runs differ in `stdout_bytes`, 2318
vs 2315, and in their per-site lines) and not that the r47 set's `held=5/5` is itself correct.
The per-site reading remains the counter's own business.

### The DISAGREE arm, measured on the r48 set (`ExecCounterRerun-disagree-r48base.txt`)

The same instrument over the same frozen counter and the same target rev, with `--set r48`:

```
COUNTER_RERUN_RUN run=1 exit=1 wall_ms=31501.41 load1=21.83 stdout_bytes=1926 stderr_bytes=0
  summary_sha256=684715c2cb850e6eda5eee051d18c96692802d0e4d46decc9822b57167156e3c
  summary="CAPROUTE48 rev=f00cf278… base=f00cf278 set=r48 held=0/4 runs=3 rule=F48"
COUNTER_RERUN_RUN run=2 exit=1 wall_ms=25368.15 load1=24.93 stdout_bytes=1927 stderr_bytes=0
  summary_sha256=684715c2cb850e6eda5eee051d18c96692802d0e4d46decc9822b57167156e3c
  summary="CAPROUTE48 rev=f00cf278… base=f00cf278 set=r48 held=0/4 runs=3 rule=F48"
COUNTER_RERUN_REASON: run 1 exited 1
COUNTER_RERUN_REASON: run 2 exited 1
COUNTER_RERUN: DISAGREE
instrument_exit=1
```

This is the receipt that shows the predicate was **not** weakened to fit the desired demo: the
two final summary lines here are byte-identical (the same `summary_sha256=684715c2…`) and the
verdict is still `DISAGREE`, because the frozen predicate requires *every run to exit 0* and the
counter exits 1 at `held=0/4`. A wrapper that reported `AGREE` for two identical exit-1 runs
would be exactly the "identical held=3/5 final lines" trap the inherited A2 reruns fell into.
The receipt also shows the per-run reasons, so a reader can see *why* the runs disagree.

---

## 4. What this seat did NOT do (scope honesty)

- **No change to the frozen counter.** `probe/caproute48-probe.mjs` was read only; its sha256 is
  unchanged and is printed in the receipt.
- **No change to the F48 predicate, the site list, the allowances or the target** — this seat
  builds an instrument; the four C1 routing sites (RG742/SP491/SP519/SP1592) belong to other
  seats of wave `r48` and are untouched here.
- **No lane-repo write.** The new file exists only in the sandbox clone and in the delivered
  patch; the L1 remains the sole integrator.
- **No full-output comparator.** By design and by the L1's correction (3): the capability claimed
  is final-summary-line agreement only.
- **Not verified here:** the instrument's behaviour at the *integrated* C2 commit (the receipts
  above run the sandbox copy over the frozen probe; after integration the L1's own
  `--selftest` at the C2 commit is the scoring run). Likewise the C1-commit `AGREE` over the
  **r48** set cannot exist until the C1 routing lands — this seat can only show `AGREE` over the
  exit-0 r47 set, and the r48-set `AGREE` remains to be produced at the C1 commit.
- **The kill rule's "one committed real AGREE receipt over the frozen probe"** is satisfied by
  `ExecCounterRerun-agree.txt` (a real AGREE over the frozen F48 counter at the frozen probe
  sha256). It was measured with the sandbox instrument; the L1 may re-run it at the integrated
  C2 commit to bind the receipt to the integrated file.

---

## 5. Tooling

No tool was installed, upgraded or updated by this seat: the work used only `node` (v24.21.0) and
`git`, both already present. Channel/reason: n/a (no install). No `pacman` transaction was
attempted (the host-wide pacman guard is respected).

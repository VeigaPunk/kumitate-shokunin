# MutCounterPidReuse — parser attack: PID reuse in one trace

Seat: `kumitate-r48-MutCounterPidReuse` (mutation tester, leaf). Round 48 attempt 2, wave `r48`.
Frozen tip `fe3d45bf929246915c8c0de5f7f8682b5015b22c`. Sandbox clone
`/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutCounterPidReuse/lane` (detached at the frozen tip;
never touched any real checkout). 2026-10-23 15:2x–15:3x -03, load1 37–38.

## Claim attacked

Counter `probe/caproute48-probe.mjs`, header and plan § C1/attempt-2 addendum (R47-5, second cause):
"a PID created twice in one log (reuse, or an untranslated PID-namespace return) is exit 2". The
behaviour-bearing point is the single guard in `parseLog`:

```
188      } else if (rv > 0) {
189        if (parent.has(rv)) die(`pid ${rv} created twice in one log (reuse or an untranslated PID-namespace return)`);
190        parent.set(rv, pid);
191      }
```

Frozen bytes, verified three ways: repo path, clone path, and the detector's own reported hash — all
`sha256 f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` (matches the plan's freeze hash).

## Mutant

One-line deletion of the guard (line 189), leaving `parent.set(rv, pid)` alone — i.e. a silent overwrite of
the parent edge. This is the plausible defect in the strongest form: it reproduces the pre-fix behaviour of
the round-47 A2 counter, which the round-48 tree confirms has no such check
(`grep -n "created twice" .ufo/waves/round-47/probe/caproute-probe.mjs` → no match). A regression to A2 is a
realistic edit, not a contrived one.

- pristine `f24a3af5…` (19813 B)
- mutant `041a1e5c1a22a873e3ff68ddd77235d13e7b684a7343cdd18982ce0f0c26d1d8` (19813 − 117 bytes;
  `git diff --stat` in the sandbox clone: `1 file changed, 1 deletion(-)`)

## Detector (bounded)

`MutCounterPidReuse-detector.mjs`, sha256 `9998fb0810eed3c89c429fdac063b99557cf17db8fb1f3b82817961dd4745c86`
(copy of the run artifact). It takes the candidate probe path, slices the parser region **byte-exact**
(`function parseStrings(` … `function ancestorsOrSelf(`) out of that file, evaluates it with the counter's own
`die` semantics (`CAPROUTE48: ERROR <msg>`, `process.exit(2)`), and feeds four synthetic strace logs, one per
child process (die exits the process). Only `parseLog`/`parseStrings` are exercised; the region hash is
printed per run (`region_bytes=5852` pristine, `5735` mutant), so a drifted extraction would be visible.

| case | synthetic trace | expected |
|---|---|---|
| `clean` | root 1000 execs, clones 1001/1002, both exec | parse OK (control) |
| `dup-raw` | 1001 created, execs, then a later clone returns 1001 | exit 2 |
| `dup-pidns` | 1001 created; later `clone(…) = 2002 /* 1001 in strace's PID NS */` (untranslated vs translated return of one PID) | exit 2 |
| `reuse-of-root` | root 1000 execs, then `clone(…) = 1000` (adjacent shape, not the assigned mutant) | observation |

Commands (from the sandbox seat root; `P=lane/.ufo/waves/round-48/probe/caproute48-probe.mjs`):
`node work/pidreuse-detector.mjs $P`.

## Results (actual output)

Pristine (`sha256 f24a3af5…`, load1 38.18):

```
CASE clean exit=0 out="PARSE_OK execs=3 parent=2 root=1000"
CASE dup-raw exit=2 out="CAPROUTE48: ERROR pid 1001 created twice in one log (reuse or an untranslated PID-namespace return)"
CASE dup-pidns exit=2 out="CAPROUTE48: ERROR pid 1001 created twice in one log (reuse or an untranslated PID-namespace return)"
CASE reuse-of-root exit=0 out="PARSE_OK execs=2 parent=2 root=1000"
DETECTOR cases=4 exit2=2
```

Mutant (`sha256 041a1e5c…`, load1 37.15):

```
CASE clean exit=0 out="PARSE_OK execs=3 parent=2 root=1000"
CASE dup-raw exit=0 out="PARSE_OK execs=3 parent=2 root=1000"
CASE dup-pidns exit=0 out="PARSE_OK execs=2 parent=1 root=1000"
CASE reuse-of-root exit=0 out="PARSE_OK execs=2 parent=2 root=1000"
DETECTOR cases=4 exit2=0
```

Restored (`sha256 f24a3af5…`, load1 38.18): byte-identical to the pristine block, `DETECTOR cases=4 exit2=2`.

**Verdict: KILLED.** Both attack cases flip from exit 2 on pristine to a silent parse (exit 0) on the mutant,
while the `clean` control parses on both — the detector discriminates the guard, not a broken parser. The
mutant never reaches a score: the deleted guard would let a PID-reuse trace proceed to judging with a
corrupted parent map (dup-raw: `parent=2` either way but the reuse is invisible; dup-pidns: the second
creation of 1001 is dropped entirely), i.e. an unevaluable log would be scored rather than exited 2.

## Coverage observation (not a verdict; contract not amended)

`reuse-of-root` reads exit 0 on the frozen parser. The guard only rejects a PID already inserted in `parent`
by a traced clone return. A PID that first appears as a tracee prefix (the root, or any process created
before strace attached) is never in `parent`, so a later `clone` returning that same PID is accepted and its
execs merge with the earlier incarnation under one pid — exactly the "second process reuses the PID within
the same trace" shape, minus the creation record. Against the narrow reading ("a PID created [by a traced
call] twice") this is conformant; against the broad sentence as written ("a PID created twice in one log"),
it is a gap. Recorded for the reviewer; the F48 sentence, predicate and counter are untouched by this seat.

## Restoration evidence

```
git -C lane checkout -- .ufo/waves/round-48/probe/caproute48-probe.mjs
RESTORED_SHA=f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2
STATUS=[]                      # git status --porcelain, empty
HEAD=fe3d45bf929246915c8c0de5f7f8682b5015b22c
FROZEN_REPO_SHA=f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2
```

Restored bytes equal the frozen repo file and the pre-mutation clone file.

## Bounds and limits

- Wrote only the sandbox clone, `r48/MutCounterPidReuse.md`, `r48/MutCounterPidReuse-detector.mjs`, and
  `/tmp` (case logs via `mkdtemp`). No git/jj write in the lane repo, no writes to `scripts/`, `.jj`,
  `.ufo/state`. The only git write was `checkout --` inside the sandbox clone, to restore.
- No tool installed or updated (node v24.21.0, host toolchain as found).
- The detector is parser-level, not a full counter run: the counter hard-codes its scratch under
  `/fast/scratch/hyaku/kumitate-r48/probe-runs`, outside this seat's write scope, and the attacked
  behaviour is a pure function of the log text. The `die` path used is the counter's verbatim (`CAPROUTE48:
  ERROR`, exit 2), so the exit-code claim is measured, not inferred.
- Not tested: whether a real kernel PID reuse inside a gate run can also reach the parser through the
  `pending`/resume bookkeeping (the duplicate check fires before any resume interaction; interleaving order
  not attacked here).

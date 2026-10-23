RESULT MutCounterPadded verdict=INVARIANT_HELD (padded-return mutant survived; both malformed variants killed at exit 2)

Seat `kumitate-r48-MutCounterPadded`, round 48 attempt 2, wave `r48`. Lane clone
`/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutCounterPadded/lane` at frozen tip
`fe3d45bf929246915c8c0de5f7f8682b5015b22c`; counter
`.ufo/waves/round-48/probe/caproute48-probe.mjs` sha256
`f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` before and after every run.
No installs were made (none were needed). No counter source was edited in this probe; the single
source mutation below lives in the seat sandbox and was restored byte-for-byte.

## The claim attacked

C1's predicate sentence (plan § C1) requires, per run, that "the trace parses completely". The
counter's own header (`probe/caproute48-probe.mjs:22-28`) states the reason: strace aligns a short
record's return to a column, so a resumed execve reads `<… execve resumed>)   = 0`; the round-47
A2 parser matched a literal `) = ` and dropped such records **silently**. The smallest plausible
defect in the shipped fix is therefore that `\)\s+= ` only covers *some* padding: a wider alignment
column (`-a`), a record whose prefix overflows the column, or a malformed return on the padded path
could still be skipped without an error. That is what this probe feeds it.

## Mutant

Input-space mutant: a synthetic strace log in which **every** record's return is placed at a fixed
alignment column far past strace's default 40 — columns 41, 80, 96 and 200 — including the three
`<… execve resumed>)` returns (52, 52 and 53 spaces before `=` at `-a 80`). Ten records, three
unfinished/resumed pairs, a pid-namespace clone return `= 2 /* 9879 in strace's PID NS */`, and a
4-digit pid with the documented two-space prefix (`9879  …`). The bytes are modelled on a live
capture with the counter's own flag set on this host (node v24.21.0, strace 7.2):

```
$ strace -f -qq -v -s 200 -a 80 -e trace=execve,execveat,clone,clone3,fork,vfork -e signal=none \
         -o real80.log bash -c 'sleep 0.15 & sleep 0.1 & wait'
603025 <... execve resumed>)                                                    = 0   # 52 spaces, `=` at column 80
```
(`/tmp/mcp-pad/real80.log`, sha256 `47e3214e59b6644e5a8a4826e71f6a6e471dcc4ceb1e848c723e1ace5a3b5ff9`, 2 resumed records.)

Padded log (column 80), measured by `census.mjs` — the census reports the byte offsets, not the
generator's intent:

```
6:603025 <... execve resumed>)                                                    = 0     # '=' at col 80, 52 spaces
7:603026 <... execve resumed>)                                                    = 0     # '=' at col 80, 52 spaces
10:9879  <... execve resumed>)                                                     = 0    # '=' at col 80, 53 spaces
```

Variants: `padded-41/80/96/200.strace`; `unpadded-control.strace` (same ten records, one space);
`padded-failed-exec.strace` (padded resumed execve returning `-1 ENOENT (No such file or directory)`);
`malformed-resumed.strace` (padded resumed execve returning strace's `= ?`; **must exit 2**);
`malformed-complete.strace` (padded complete execve returning `= ?`; must exit 2);
`orphan-resumed.strace` (padded resumed record with its unfinished record removed; must exit 2).

## Detector

`harness.mjs` reads the pinned counter, **asserts its sha256**, and extracts `TRACED`, `die`,
`parseStrings` and `parseLog` from it **verbatim** (balanced-brace spans, compiled with
`new Function`) — nothing is copied by hand, nothing is edited. It then runs `parseLog` on one log
and prints a canonical `PARSE_OK execs=… resumed=… rootPid=… parents=…` line plus every `EXEC`/`EDGE`,
or reproduces the parser's own `die` (`CAPROUTE48: ERROR …`, exit 2). Expectations are asserted in
the harness: exit 4 if it returns with the wrong exec/resumed count, i.e. the silent-skip detector.
Extracted span sha256 `d2b46b79e7041ffe71fac5051efd55af427e097d69461c40d68e255490fa875d`
(4092 bytes; unchanged for every F48 case). Harness sha256 `83ba33925b8ef1102e9d9e4988ffd75e94c5a116a27daa59d4d51a7ffeff24ae`.

## Output (measured)

| case | log sha256 | exit | output |
|---|---|---|---|
| f48-padded-41 | `6b668e5d…` | 0 | `PARSE_OK execs=4 resumed=3 rootPid=603015 parents=3` |
| f48-padded-80 | `4303eb0b…` | 0 | `PARSE_OK execs=4 resumed=3 rootPid=603015 parents=3` |
| f48-padded-96 | `582a9490…` | 0 | `PARSE_OK execs=4 resumed=3 rootPid=603015 parents=3` |
| f48-padded-200 | `a1d1bd83…` | 0 | `PARSE_OK execs=4 resumed=3 rootPid=603015 parents=3` |
| f48-unpadded (control) | `ffb9179f…` | 0 | `PARSE_OK execs=4 resumed=3 rootPid=603015 parents=3` |
| f48-padded-failed-exec | `70b87a52…` | 0 | `PARSE_OK execs=3 resumed=3 rootPid=603015 parents=3` |
| f48-malformed-resumed | `01bb1bf3…` | **2** | `CAPROUTE48: ERROR unparsed return in execve record of pid 603025: "…e9a0c4d10 /* 41 vars */ )                                                    = ?"` |
| f48-malformed-complete | `bc611f3b…` | **2** | `CAPROUTE48: ERROR unparsed return in execve record of pid 603015: "…0x7ffd4c1e2b30 /* 41 vars */) = ?"` |
| f48-orphan-resumed | `50dbdaf1…` | **2** | `CAPROUTE48: ERROR resumed execve record with no pending entry for pid 603025` |

Census (`census.mjs`, 0-based index of each record's `=`): `padded-80` → resumed columns
`80,80,80`, all-record range 80..123, space runs 1..53; `padded-41` → `41,41,41`, range 41..123;
`padded-96` → `96,96,96`, range 96..123; `padded-200` → `200,200,200`, range 200..200, space runs
78..173. Records whose own prefix already runs past the column (the long round-gate `execve`) carry
a single space, which is what strace does; both shapes parse.

Four execs and three resumed records are recovered at every column, identical to the unpadded
control (4 / 3), with the same three ancestry edges and the same root pid. Nothing is skipped
silently: the padded resumed records are the execs for pids 603025, 603026 and 9879, and each
appears as an `EXEC` line. On `padded-failed-exec` the padded resumed record parses but is
correctly **not** counted (return `-1`, 3 execs), so "not counted" happens only through the
documented non-zero-return branch, never by an unparsed line.

## The malformed variant (required)

`malformed-resumed.strace` is byte-identical to `padded-80.strace` except that the padded resumed
execve of pid 603025 returns strace's `= ?` (return value not recoverable). Expected: exit 2.
Measured: exit 2 with `CAPROUTE48: ERROR unparsed return in execve record of pid 603025: …`. The
same holds for a padded *complete* record (`malformed-complete`, pid 603015, exit 2), and for a
padded resumed record whose unfinished partner is missing (`orphan-resumed`, exit 2, "no pending
entry"). All three are hard failures, never a score.

## Source mutant control and restoration (the classic triple)

The same detector, the same log bytes (`4303eb0b…`), three parser byte-states:

| bytes | sha256 | exit | output |
|---|---|---|---|
| frozen counter C1 | `f24a3af5…` | 0 | `PARSE_OK execs=4 resumed=3 parents=3` |
| sandbox mutant: return funnel `\)\s+= ` → `\) = ` (one token, line 173) | `dd4385279e514cab442c3517cf5cf7a8142b314bccc3a4f8fd8ab43639c04328` | **2** | `CAPROUTE48: ERROR unparsed return in execve record of pid 603025` |
| restored (frozen bytes copied back, sha re-measured) | `f24a3af5…` | 0 | `PARSE_OK execs=4 resumed=3 parents=3` |

The mutant still reads 4/4 on `unpadded-control`, so it changes behaviour only in the padded class —
the padded-return input is behaviour-bearing. The kill is exit 2 rather than a count difference
because F48's `if (!ret) die(...)` guard (probe:174) converts an unreadable return into "cannot
evaluate"; without that guard the same narrowing is the A2 silent skip. Contrast on the same bytes:

| parser | padded-80 | unpadded-control |
|---|---|---|
| round-47 A2 (`git show f00cf278:…/caproute-probe.mjs`, sha `1b438de2…`, `\) = ` funnel, no guard) | exit 0, **`execs=1`** (3 execs lost silently) | exit 0, **`execs=3`** (1 lost: the 4-digit-pid resumed record) |
| frozen F48 | exit 0, `execs=4`, `resumed=3` | exit 0, `execs=4`, `resumed=3` |

Restoration evidence: the lane clone's counter sha256 is `f24a3af5…` before and after all runs; the
sandbox working copy was restored from the frozen bytes and re-measured at `f24a3af5…`; every log
regenerates byte-identically from the generator (`cmp` over all 9 files, PASS); the runner was run
twice with identical verdicts (17 PASS / 0 FAIL both times). The lane repo outside
`.ufo/waves/round-48/r48/` received no write from this seat.

## Verdict

- **Attack outcome: INVARIANT HELD.** No silent skip of a padded return at columns 41/80/96/200;
  the padded resumed execve records are recovered and counted; parse output equals the unpadded
  control. No defect found in the claim class, so no counter amendment is suggested or implied.
- **Malformed variants: KILLED (fail-closed).** `= ?` on a padded resumed record, `= ?` on a padded
  complete record, and an orphan padded resumed record all exit 2 with a verbatim error.
- **Source mutant control: KILLED by the detector** (exit 2), and the contrast shows the A2 shape
  loses 3/4 execs with exit 0 on the same bytes — so both halves of the R47-5 fix (the `\s+` funnel
  and the `if (!ret) die` guard) are load-bearing, not belt-and-braces.
- **Scope caveat (stated, not hidden):** this exercises `parseLog` in isolation via verbatim
  extraction. It does not run the counter's gate/judge path (that needs a live lane, `strace` and
  the gates), and the logs are modelled on a live capture (cited above) rather than being captured
  traces. This is parser-scope evidence for the "parses completely" clause only.

## Reproduce

```
S=/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutCounterPadded
node $S/gen.mjs $S/logs && bash $S/runner.sh      # writes $S/out/receipt.txt, out/census.txt, out/<case>.txt
```

Artifacts: `$S/harness.mjs` (`83ba3392…`), `$S/gen.mjs` (`cd0db0c9…`), `$S/census.mjs`, `$S/runner.sh`,
`$S/logs/*.strace` (9 files), `$S/mutant/{pristine.mjs,ret-funnel-narrow.mjs,work.mjs}`,
`$S/a2-caproute-probe.mjs` (`1b438de2…`), `$S/out/` (receipt, census, per-case output).

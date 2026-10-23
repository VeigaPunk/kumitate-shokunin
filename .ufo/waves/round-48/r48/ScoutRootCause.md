# ScoutRootCause — does strace drop a traced exec/clone under load?

**Verdict: drops observed N.**

Re-scanned the kept logs under `/fast/scratch/hyaku/kumitate-r48/seats/w1-ExecRootCause/` (they are still on disk; this is not a results.json-only re-derivation). strace 7.2, `pid_max` 4194304. Invocation on those logs, from `run-pidns.sh` / `run-hostwrap.sh` / `run-wrap2.sh`:

`strace -f -qq -v -s 8192 --decode-pids=pidns -e trace=execve,execveat,clone,clone3,fork,vfork -e signal=none`

No tool installed for this pass.

## What was counted as a drop

A drop would be a traced exec/clone record that strace failed to write: a non-thread child whose execve or clone is missing while the child did run one, a resume with no unfinished entry, an unfinished record left at EOF, a line with no parseable return, a non-pid strace diagnostic, or an exec whose pid is neither the root nor a clone child.

Not a drop: `CLONE_THREAD` tids that never call exec/clone (the filter cannot print them), a process that forks and `_exit`s without exec/clone, a bwrap supervisor that clones its payload instead of exec'ing, or the single clone at the end of a trace file that was cut off.

The inherited `rc-dropcheck.mjs` oracle does not make those distinctions. Its section J line (`missingChild=1323 noExec=106`) is reproduced and then split below. Its `notRootNorChild=0` check is vacuous (`pid` is taken from the set it is then tested against).

## Per tree (anchor-truth `--selftest`, nine real logs)

Padded prefix = pid field wider than the digits (strace's 5-column minimum: gap after the pid is 1 iff the pid has ≥5 digits). PID-wrap = a prefix pid `< 10000` in a log that also reaches above 4_000_000. None of tree1–tree9 wrap. `execOk` is successful `execve` (reference count, not the A2 parser).

| tree | lines | padded prefix | distinct prefix pids `<10000` | host wrap | execOk | resumed | absent process children | of which not in the tail |
|---|---:|---:|---:|---|---:|---:|---:|---:|
| tree1 `run1.strace` | 7578 | 0 | 0 | N | 1795 | 27 | 45 | 45 |
| tree2 `run2.strace` | 7560 | 0 | 0 | N | 1795 | 9 | 45 | 45 |
| tree3 `run3.strace` | 7565 | 0 | 0 | N | 1795 | 14 | 45 | 45 |
| tree4 `run4.strace` | 7551 | 0 | 0 | N | 1795 | 0 | 45 | 45 |
| tree5 `run5.strace` | 7551 | 0 | 0 | N | 1795 | 0 | 45 | 45 |
| tree6 `run6.strace` | 7553 | 0 | 0 | N | 1795 | 2 | 45 | 45 |
| tree7 `run7.strace` | 7558 | 0 | 0 | N | 1795 | 7 | 45 | 45 |
| tree8 `run8.strace` | 7553 | 0 | 0 | N | 1795 | 2 | 45 | 45 |
| tree9 `run9.strace` | 7555 | 0 | 0 | N | 1795 | 4 | 45 | 45 |

Same on every tree: `pendingAtEOF=0`, resume-without-pending `0`, second-unfinished `0`, bare unparsed return `0`, non-pid lines `0`, orphan exec pids `0`, pid created twice `0`, unannotated small return from a host-pid parent `0`. stderr `treeN/errN.txt` is empty. `status.txt` / `status2.txt`: all nine runs `exit=0`. Min/max prefix pid stays 6 or 7 digits (tree1 max 3372589; tree4–9 sit in 692072–828680). Gap histogram is `{"1": <every line>}`.

The 1795 successful execs do not move between the run with the most interleaving (tree1, 27 resumed records) and the runs with none (tree4, tree5). Load changed which records were split across `<unfinished>`/`<... resumed>`; it did not change how many exec or clone records exist. `results.json` matches these exec counts (`execveSuccess_REF=1795`, `f48LostExecve=0`, `linesWithPaddedPrefix=0`, `pidsBelow10000=0`).

## The 1323 "missing children" are not drops

On tree1 (and the same counts on tree2–tree9):

- 1278 `CLONE_THREAD` children, **all unseen** as prefixes. A thread that never calls exec/clone has nothing for this filter to print. The parent's `clone3` record is present.
- 45 non-thread children, **all** `git maintenance run --auto --quiet --detach` (`CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD`). 1278+45=1323, the section J figure.
- 106 processes that appear but never `execve`: **all** `CLONE_NEWNS|CLONE_NEWUSER|CLONE_NEWPID|SIGCHLD`, first traced call `clone`. That is bwrap's supervisor (106 `bwrap` execs in the same log). Its payload's `execve` is the next record (tree1 line 108 clone → line 109 supervisor clone → line 110 `node` exec). Not a lost exec.

Checked the detach child with the same strace flags plus `exit,exit_group`, on a fresh repo (`/tmp/gitdet`, not one of the kept logs). The child is traced and does not exec or clone:

```
1290195 clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, ...) = 1290212
1290195 exit_group(0) = ?
1290212 exit_group(0) = ?
```

The kept logs omit `exit_group`, so those 45 children are invisible. The clone that created them is in the log. Same 45 on tree4, which has zero resumed records, so this is not load.

2745 returns per tree are errno tails (`= -1 E…`), records present, not unparsed. Classifier: `errnoTail=2745`, `bareUnparsed=0`.

## Where the prefix is padded, and where the pid counter wraps

| log | padded lines | distinct prefix pids `<10000` | min | max | host wrap | execOk | absent process children not in the tail |
|---|---:|---:|---:|---:|---|---:|---:|
| `pidns.log` (fresh pid ns, 3000× `/bin/true`) | 6005 (every line) | 3002 (every pid) | 3 | 3004 | N | 3002 | 0 |
| `tree1/wrap2.strace` (anchor-truth loop, started at `ns_last_pid=4192942`) | 111 | 10 | 1720 | 4193629 | Y | 19910 | 496, all git `--detach` |
| `synth/hostwrap-window.log` (first 4000 lines of the wrap log) | 80 | 71 | 348 | 4194294 | Y | 1951 | 0 |
| `hostwrap.log` (full, 1.46 GB, 208654 lines) | 80 | 71 | 348 | 4194294 | Y | 104223 | 0 |

Gap widths match a 5-column pid field. `pidns.log`: 1-digit gap 5 (3009 lines), 2-digit gap 4 (90), 3-digit gap 3 (900), 4-digit gap 2 (2006). `hostwrap.log`: gap 3 → 7 lines, gap 2 → 73 lines, gap 1 → the rest (208574). `wrap2`: gap 2 → 111 lines, all 4-digit pids. Every other line has gap 1.

`pidns.log` execs are `true` 3000 + `bash` 1 + `seq` 1. Every padded-prefix exec is present. `bareUnparsed=0`, `pendingAtEOF=0`.

`hostwrap.log` execs are `true` 104221 + `bash` 1 + `seq` 1. The window that contains the wrap (pids 4166989 down through 348…4194294) has **zero** missing process children. The full file has one absent child, and it is the last line: line 208654 `4166989 clone(...) = 198782`, with no following exec. The previous child (198780) has its `execve` on line 208653. `hostwrap.out` never printed `exit=` (only `pre-wrap ns_last_pid=4166501`). That is a trace cut off mid-loop, not an interior drop. 208 resumed records in that file, all paired (`pendingAtEOF=0`).

`wrap2` crosses the wrap (10 distinct prefix pids `<10000`, 111 padded lines) and still has `orphan exec = 0`, `bareUnparsed = 0`, `pendingAtEOF = 0`. Its 496 absent children are the same `git maintenance --detach` class as the 45 above (11× the one-selftest count, plus the extra iterations in that loop). One of the 1178 bwrap supervisors has a prefix pid `<10000` and is present (first call `clone`). Padding did not swallow it. `results.json` does not cover `wrap2` or `hostwrap.log`; those two rows are from this re-scan only. The window row matches evidence section C (`paddedPrefixLines=80`, 71 pids `<10000`).

## Answer

On these logs, `strace -f -qq -v -s 8192 --decode-pids=pidns` does not drop a traced exec or clone record under load, across a host pid wrap, or when every prefix is padded. The losses the plan already named (A2 `) = ` vs column-aligned `)  = `, and `^(\d+) ` vs a padded prefix) are parser skips of records that are in the file. `f48LostExecve` in `results.json` is 0 on every row, and this pass agrees.

Not shown: a future strace, or a filter that includes the detach child's `exit_group`. The open inference in the plan (ptrace stops each tracee at every traced syscall, so a record is not skipped under load) holds for the kept traces.

Confidence: high.

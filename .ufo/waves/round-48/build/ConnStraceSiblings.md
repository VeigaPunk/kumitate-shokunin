RESULT ConnStraceSiblings verdict=complete

# Sibling-overlap scan: strace/ltrace parsers and capped-runner routing

Scope: read-only. Searched `/home/vgpnk/Projects/shokunin/*-shokunin` (excluding `kumitate-shokunin`) and `/home/vgpnk/Projects/shokunin/scripts` for committed code/counters parsing strace or ltrace output (`strace`, `resumed>`, `unfinished`) and for sibling lanes routing child processes through a capped runner (`systemd-run --scope` + `bwrap`). Worktrees, sandboxes, `corpus/live`, and vendored trees were excluded.

## 1. Strace parsers found in sibling lanes

| path:line | pattern (return/resumed handling) | same single-space `\) = ` bug? | notes / silent-skip paths |
|---|---|---|---|
| `tsukuroi-shokunin/tools/probe-child-env-allowlist-r32.py:156-185` (`parse_trace`) | return `re.search(r'\)\s*=\s*0\s*$', rest.rstrip())`; resumed `re.match(r'^(\d+)\s+<\.\.\. execve resumed>.*=\s*0\s*$', line.rstrip())` | no | flexible whitespace. Silent skips: execve lines not matching `^(\d+)\s+execve\(`; resumed records with no pending entry are dropped via `pending.pop(..., None)` (line ~184); returns not equal to 0 dropped. PID prefix flexible, so no PID-wrap skip. |
| `tsukuroi-shokunin/tools/probe-child-env-allowlist-r33.py:229-259` (`parse_trace`) | same as r32 | no | same silent-skip paths as r32. |
| `tsukuroi-shokunin/tools/probe-child-env-allowlist-r34.py:285-320` (`parse_trace`) | same as r32, plus `execveat` lines counted and skipped | no | same silent-skip paths; additionally execveat records are skipped by design (counted in `execveat`), and argv/envp parse failures are counted in `unparsed` but the record may still be appended when the return matches. |
| `tsukuroi-shokunin/tools/probe-git-child-env-r31.py:133-162` (`parse_trace`) | same as r32 | no | same silent-skip paths as r32. |
| `tameshi-shokunin/tools/trace-inputs.py:85-88,428-498` (`Tracer.feed`, `CALL_RE`, `RESUMED_RE`) | `CALL_RE = re.compile(r"^(\w+)\((.*)\)\s*=\s*(.*)$")`; resumed tail split on `" = "`; `RESUMED_RE = re.compile(r"^<\.\.\.\s+(\w+)\s+resumed>\s*(.*)$")` | no | flexible `\s*=\s*` on the direct-call path. Silent skips: lines not matching `LINE_RE`; resumed records whose tail has no `" = "` (line 471); resumed candidate fragments that do not end in `)` (line 479); unknown/non-path calls handled inside `call()`; stateful PIDs tracked. Resumed padded returns (`)           = 0`) still contain the `" = "` substring, so they are not dropped by the single-space bug. |
| `kama-shokunin/.ufo/waves/round-23/falsify/out/ExecOldGitRun/c01_old_git_driver.py:48-51,78-97` (`parse_execs`) | `LINE = re.compile(r"^(\d+)\s+(.*)$")`; `RESUMED = re.compile(r"^<\.\.\. execve resumed>")`; `RC = re.compile(r"\)\s*=\s*(-?\d+)")` | no | flexible whitespace. Silent skips: lines not matching `LINE`; non-execve bodies skipped. Failure modes rather than silent skips: a resumed record with no pending entry raises `KeyError` on `pending.pop(pid)` (line 92); a body with no RC match raises `IndexError` on `RC.findall(body)[-1]` (line 95). |

Other tsukuroi wave-local copies of the same parser (e.g. `round-31/w1/CritProbeC2Design/parse_trace_tests*.py`, `round-32/w1/MutProbeC2/*.py`, `round-33/a3w1/...`) reuse the same flexible-whitespace patterns; no differing return matcher found in them. No strace/ltrace parser was found in `/home/vgpnk/Projects/shokunin/scripts` or in the other sibling lanes' committed top-level tools.

## 2. Capped-runner (systemd-run scope + bwrap) routing in siblings

Search for `cap-run.mjs`, `capSpawnSync`, and `systemd-run ... --scope` together with `bwrap` in committed sibling code found no matches outside `kumitate-shokunin`. Result: no sibling lane already routes child processes through the capped runner. (Kumitate itself uses it in rounds 46-48; that is the lane under test, not a sibling.)

## 3. Conclusion

- The kumitate round-47 single-space return bug (`\) = `) is not replicated in the sibling parsers examined: all use `\s*` (or, for tameshi, a quoted `" = "` split that still matches padded returns).
- Silent-skip paths do exist elsewhere, but they are of different kinds: dropped resumed records with no pending entry (tsukuroi), execveat skipping/unparsed counting (tsukuroi r34), resumed tail lacking `" = "` or non-`)` fragments (tameshi), and crash-on-missing-pending/RC (kama).
- No sibling lane currently routes children through the capped runner, so there is no sibling counter observing that routing to compare against.
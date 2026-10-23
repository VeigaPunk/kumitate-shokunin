RESULT ScribeStrace rev=cac43009 verdict=OPENED row=S093
| S093 | strace(1) 7.2 — https://github.com/strace/strace/blob/v7.2/doc/strace.1.in; installed host man strace | docs | A | strace 7.2 tracing of child processes and rendering exec arguments across PID namespaces | doc/strace.1.in:437-444 (-f/--follow-forks), :1022-1024 (--decode-pids=pidns), :1204-1208 (-s), :1275-1281 (-v/--no-abbrev) at tag v7.2; host man strace 7.2 | -f traces fork/vfork/clone children; --decode-pids=pidns prints IDs in strace's PID namespace; -v disables abbreviation; -s sets maximum printed string size (default 32) | mined | 2026-10-23 | on-release | .ufo/waves/round-47/probe/caproute-probe.mjs, corpus/lessons/round-47.md |

Gate record
- URL: https://github.com/strace/strace/blob/v7.2/doc/strace.1.in (fetched as https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in); access date: 2026-10-23.
- Quote, doc/strace.1.in:1022-1024 at tag v7.2: “Prints thread, process, process group, and session IDs in strace's PID namespace if the tracee is in a different PID namespace.”
- `printf '%s' "Prints thread, process, process group, and session IDs in strace's PID namespace if the tracee is in a different PID namespace." | wc -w` → `21`.

Evidence
- `man -w strace && strace --version` → `/usr/share/man/man1/strace.1.gz`; `strace -- version 7.2`; copyright 1991-2026; optional features `stack-trace=libunwind stack-demangle m32-mpers mx32-mpers`.
- `sha256sum /usr/share/man/man1/strace.1.gz` → `a5a80dddd1417a887e98672a9a83104f16a62670e37843d8edc07ba430067501  /usr/share/man/man1/strace.1.gz`.
- `man -P cat strace | sha256sum` → stdout `40f9cb0b275a45c648f43d69959dd224bc6fe49ef03501165a9045086d66b575  -`; stderr had troff `cannot select font 'CW'` warnings and line 663/664 cannot-adjust warnings.
- `curl -sSL https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in | sha256sum` → `c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a  -`.

Behavior and finding
- The upstream v7.2 manual and installed host manual were opened. They describe the four options in the row; the PID-namespace quote grounds the counter's inner-PID interpretation.
- Verdict is OPENED; row status is mined because the specified used-by paths cite this operational guidance.

Touched surfaces
- Wrote only `.ufo/waves/round-47/build/ScribeStrace.md`.

Out of scope
- `corpus/SOURCES.md` was not edited: lane write bounds permit this report only. S093 is drafted above for the integrator.
- No code changes, counter runs, tests, or tool installations.

Artifact path: `.ufo/waves/round-47/build/ScribeStrace.md`
RESULT ReopenS093 rev=269dadb6 verdict=HOLDS row=S093 quote-verbatim=yes quote-words=21 teaches-supported=yes tier=A kind=docs status=mined used-by-exists=yes anchor-minor-imprecision=-f-range-437-444-excludes-clone-line-445

Re-open of registry row S093 (strace(1) 7.2) at C1 commit 269dadb6, non-author. Source fetched independently; bytes re-derived.

1. Row at C1 (corpus/SOURCES.md line 106):
   | S093 | strace(1) 7.2 — https://github.com/strace/strace/blob/v7.2/doc/strace.1.in; installed host man strace | docs | A | strace 7.2 tracing of child processes and rendering exec arguments across PID namespaces | doc/strace.1.in:437-444 (-f/--follow-forks), :1022-1024 (--decode-pids=pidns), :1204-1208 (-s), :1275-1281 (-v/--no-abbrev) at tag v7.2; host man strace 7.2 | -f traces fork/vfork/clone children; --decode-pids=pidns prints IDs in strace's PID namespace; -v disables abbreviation; -s sets maximum printed string size (default 32) | mined | 2026-10-23 | on-release | .ufo/waves/round-47/probe/caproute-probe.mjs, corpus/lessons/round-47.md |

2. Gate record (corpus/lessons/round-47.md line 41): URL https://github.com/strace/strace/blob/v7.2/doc/strace.1.in; accessed 2026-10-23; quote "Prints thread, process, process group, and session IDs in strace's PID namespace if the tracee is in a different PID namespace." (:1022-1024; 21 words); admit A, mined (ScribeStrace).

3. Independent fetch (ordinary means, curl):
   $ curl -sSL https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in -o strace.1.in.v7.2
   $ sha256sum strace.1.in.v7.2
   c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a  strace.1.in.v7.2
   2242 lines. Matches drafting seat ScribeStrace's fetched-bytes hash exactly (build/ScribeStrace.md line 13).

4. Quote verbatim at locator (lines 1023-1024; within stated :1022-1024):
   "Prints thread, process, process group, and session IDs in strace's PID namespace if the tracee is in a different PID namespace."
   $ sed -n '1023,1024p' strace.1.in.v7.2 | tr '\n' ' ' | sed 's/ $//' | wc -w  →  21
   (Line 1022 is the option element header `.B pidns`; the quote occupies 1023-1024, inside the cited range.)

5. teaches clauses vs located bytes (all supported):
   - "-f traces fork/vfork/clone children": lines 437-446 — ".B \-f ... Traces child processes as they are created by currently traced processes as a result of the fork(2), vfork(2) and clone(2) system calls."
   - "--decode-pids=pidns prints IDs in strace's PID namespace": lines 1023-1024 (quote above).
   - "-v disables abbreviation": lines 1275-1281 — ".B \-v / .B \-\-no\-abbrev Prints unabbreviated versions of environment, stat, termios, etc. calls."
   - "-s sets maximum printed string size (default 32)": lines 1204-1208 — ".B \-s strsize ... Specifies the maximum string size to print (the default is 32)."

6. Host manual: `man -w strace` → /usr/share/man/man1/strace.1.gz; `strace --version` → "strace -- version 7.2". Row's "installed host man strace 7.2" holds.

7. Tier/kind/scope/anchor: kind=docs (manual), tier=A (primary manual; plan's frontier step lists strace(1) as tier A primary manuals for the counter), scope matches row content (child tracing + PID-namespace/argument rendering). Anchor has exact lines plus revision (tag v7.2) per SOURCES-CONTRACT-v1.md ("exact section / heading / page / line plus revision").

8. Status/used-by: status=mined; both used-by paths exist at C1 — .ufo/waves/round-47/probe/caproute-probe.mjs (invokes strace -f ... --decode-pids=pidns at line 133) and corpus/lessons/round-47.md (cites S093 at line 16). Drafting report build/ScribeStrace.md present, verdict OPENED, same sha256.

Findings (severity order):
- MINOR (anchor imprecision): the -f/--follow-forks anchor range 437-444 ends at line 444 "and"; the clone(2) mention supporting the teaches clause "-f traces fork/vfork/clone children" is at line 445, one line beyond the cited range. Substance is correct and located; range is one line short of the full sentence (437-446). Recommend widening to 437-446.
- OBSERVATION (not a defect): unlike S091/S094/S095, the S093 anchor cell carries no body sha256; SOURCES-CONTRACT-v1.md requires only exact section/line plus revision, and the drafting report carries the fetched-bytes hash. Contract-compliant.

Verification gaps: none material; quote, four teaches clauses, host version, and used-by existence all verified from independent bytes. No source opened via non-ordinary means; no tool installed (curl/man only).

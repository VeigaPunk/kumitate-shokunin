RESULT ReopenS069 rev=a2e5b54c verdict=confirmed quotes_found=1/1

# ReopenS069 — re-derive S069 (bubblewrap 0.13.1 manual)

Seat: KumitateR45A2.ReopenS069. Lane tip a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f. Fresh fetch, no attempt-1 bytes trusted.

## Re-open of the source (ordinary means)

- Row URL: https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml
- Command: `curl -sS -L -o bwrap.xml -w 'HTTP %{http_code} final %{url_effective} size %{size_download}\n' https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml`
- Observed: `HTTP 200 final https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml type text/plain; charset=utf-8 size 33289`
- Body sha256: `2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da` — matches pinned row sha256 exactly.
- Version check: `git ls-remote https://github.com/containers/bubblewrap.git 'refs/tags/v0.13.1' 'refs/tags/v0.13.1^{}'` -> tag object `46ec5c413a3c1da265624ddac3a715b4d1bc487d`, peeled commit `362936aea0d5c6e70f7af75d2d44b5a914cb4ba2` — matches row's pinned commit.
- Host version: `bwrap --version` -> `bubblewrap 0.13.1`; `man -w bwrap` -> `/usr/share/man/man1/bwrap.1.gz`; opened 2026-10-23T05:36:11Z.

## Check 1 — locator exists and teaches/gloss column: CONFIRMED

Line ranges read from fetched bwrap.xml via `sed -n`:
- `:62-67` — "If needed (e.g. when using a PID namespace) bwrap is running a minimal pid 1 process in the sandbox that is responsible for reaping zombies" (reaper claim).
- `:138-140` — `--unshare-pid` "Create a new pid namespace".
- `:217-235` — environment options; `--clearenv` at `:233-235`: "Unset all environment variables, except for PWD and any that are subsequently set by --setenv" (word count 15, <=25).
- `:587-599` — `--die-with-parent` at `:587-593`: "Kills (SIGKILL) all bwrap sandbox processes in sequence from parent to child including COMMAND process when bwrap or bwrap's parent dies"; `--as-pid-1` at `:595-599` "Do not create a process with PID=1 in the sandbox to reap child processes".

teaches "bwrap environment options, PID namespace reaper and --die-with-parent (host bubblewrap 0.13.1)" is supported by these four sections; host version confirmed 0.13.1. Gloss sentences --clearenv/PID-1-reaper/die-with-parent all match the quoted text above.

## Check 2 — draft-attributed S069 quotes found verbatim, under named sections: CONFIRMED (1/1)

Draft /fast/scratch/hyaku/kumitate-r45/a2/inherited-entry-draft.md `:83-84` (M5): "S069 bwrap.xml: `--clearenv` unsets the variables of the command bwrap execs; with a PID namespace «bwrap is running a minimal pid 1 process»."

Only one guillemet-quoted phrase is attributed to S069: «bwrap is running a minimal pid 1 process» (8 words). Found verbatim in fetched bwrap.xml at line 63, inside the named section `:62-67`: "is running a minimal pid 1 process in the sandbox that is". grep -n -F 'minimal pid 1 process' -> line 63. Section locality holds. The surrounding "`--clearenv` unsets the variables of the command bwrap execs" is prose paraphrase (no guillemets; not presented as a quote). No other S069 mention in the draft besides the source header (line 1) — full-file grep returned only lines 1 and 83.

## Check 3 — pinned sha256 vs fetch: MATCH (no live-page drift note needed)

Pinned `2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da` = fetched sha256; size 33289 both; final URL unchanged; tag commit matches. Identical bytes to attempt 1's fetch (same digest).

## Check 4 — kind/tier: CONFIRMED

Frozen contract .ufo/waves/kaika/SOURCES-CONTRACT-v1.md `:24-30`: kind enum includes `docs`; tier A = "primary or authoritative for that scope (spec, official docs, source code, original paper, maintainer statement, ...)"; tier scoped to scope; `community` never A (QUALITY.md Q2). The bubblewrap manual is official project documentation for the pinned release v0.13.1 (362936ae), scoped to "bwrap environment options, PID namespace reaper and --die-with-parent (host bubblewrap 0.13.1)". docs/A is correct.

## Check 5 — rejected row: N/A

S069 status is `mined` (used-by: corpus/knowledge/agent-isolation-substrates.md, corpus/lessons/round-45.md), not `rejected`; no rejection reason to hold.

## Verdict

Row S069 confirmed as written; no correction needed. Full row text (as verified):
| S069 | bubblewrap 0.13.1 manual — https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml | docs | A | bwrap environment options, PID namespace reaper and --die-with-parent (host bubblewrap 0.13.1) | bwrap.xml:62-67, 138-140, 217-235, 587-599 at tag v0.13.1 = 362936aea0d5c6e70f7af75d2d44b5a914cb4ba2; body sha256 2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da; fetched 2026-10-23 (seat SrcBwrap) | --clearenv unsets all variables except PWD and later --setenv ones; with a PID namespace bwrap runs a minimal PID 1 that reaps zombies; --die-with-parent SIGKILLs the sandbox when bwrap or its parent dies | mined | 2026-10-23 | on-release | corpus/knowledge/agent-isolation-substrates.md, corpus/lessons/round-45.md |

## Residual risk / verification gaps

- The draft's M5 also rests on S070 (bubblewrap.c) for the "PID 1 is a forked reaper that never execs" mechanism; that is a separate row, not re-derived here.
- The draft's M5 prose sentence "`--clearenv` unsets the variables of the command bwrap execs" is a paraphrase of the bwrap.xml env-options section; it is not asserted as a verbatim quote, so no verbatim check applies.
- No other gaps: fetch, tag resolution, section reads, contract tier definitions all performed by ordinary means with commands and outputs recorded above.

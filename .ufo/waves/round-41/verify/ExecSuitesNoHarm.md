RESULT ExecSuitesNoHarm rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=clean suites=9 worse=0

Item: run every lane hermetic suite (`--selftest` of each scripts/*.mjs that has one:
cite-check, surface-probe, round-gate, proxy-check, claims-check, sources-check,
anchor-truth, kimi-census if present, wave-census) in a clone at open
a58b7f72afc1eb44b37e438a2f8b212c658874e5 and at tip fae386aa9e0542710b7a893d84c8e92e86fc079b.
Any suite whose pass count or verdict got worse is a harm finding.

Method
- Clones (git clone --no-hardlinks of the lane repo, --detach at each rev):
  open = /fast/scratch/hyaku/kumitate-r41a2/seats/ExecSuitesNoHarm/lane-open @ a58b7f72
  tip  = /fast/scratch/hyaku/kumitate-r41a2/seats/ExecSuitesNoHarm/lane @ fae386aa
- Ran `node scripts/<suite>.mjs --selftest` from each clone root; captured pass count,
  VERDICT line and exit code. Node v24.21.0.
- Suites with --selftest at tip: the 9 named (all scripts/*.mjs carry it; the two .sh
  scripts do not). At open, wave-census.mjs does not exist (capability added in round 41).

Table (suite | open n/m + verdict + exit | tip n/m + verdict + exit)
- cite-check    | 64/64 PASS exit 0 | 75/75 PASS exit 0   (11 cases added, none lost)
- surface-probe | 45/45 PASS exit 0 | 45/45 PASS exit 0
- round-gate    | 60/60 PASS exit 0 | 60/60 PASS exit 0
- proxy-check   | 116/116 PASS exit 0 | 116/116 PASS exit 0
- claims-check  | 47/47 PASS exit 0 | 47/47 PASS exit 0
- sources-check | 46/46 PASS exit 0 | 46/46 PASS exit 0
- anchor-truth  | 42/42 PASS exit 0 | 42/42 PASS exit 0
- kimi-census   | 48/48 PASS exit 0 | 48/48 PASS exit 0
- wave-census   | ABSENT (script new this round) | 23/23 PASS exit 0

Harm check: no suite lost cases, flipped verdict or changed exit. cite-check +11,
wave-census is a net add. worse=0.

Hermeticity stress (extra): re-ran all 9 suites at tip inside a clone whose live tree was
dirtied (deleted SCORECARD.md, SKILL.md, corpus/README.md, corpus/SOURCES.md; added a junk
round-99 dispatch). All 9 still 100% PASS, exit 0 — the suites read no live bytes.
(Note: when I additionally appended a stray `broken` token to scripts/cite-check.mjs itself,
cite-check went 70/75 FAIL exit 1 — expected, since the suite self-spawns its own file for
exit-contract cases and correctly detects a corrupted script; not a hermeticity leak. The
script was restored and the clone status verified clean.)

Diff of committed scripts between the two revs (git diff --stat a58b7f72 fae386aa -- scripts/):
cite-check.mjs +97, wave-census.mjs +408 new; all other suite files unchanged, matching the
identical counts above.

Exit codes captured (all runs): open cite=0 surface=0 round-gate=0 proxy=0 claims=0
sources=0 anchor=0 kimi=0 ; tip cite=0 surface=0 round-gate=0 proxy=0 claims=0 sources=0
anchor=0 kimi=0 wave=0. Determinism: tip re-run reproduced identical counts.

Raw logs: /fast/scratch/hyaku/kumitate-r41a2/seats/ExecSuitesNoHarm/out/{open,tip,tip-repeat,tip-dirty,tip-dirty2}/.

Report path: .ufo/waves/round-41/verify/ExecSuitesNoHarm.md (written at the lane root per the
Report: trailer contract). Scratch artifacts under /fast/scratch/hyaku/kumitate-r41a2/seats/ExecSuitesNoHarm/.
No lane files touched; both clones `git status --porcelain` empty after the runs (hermetic).
No tools installed (node v24.21.0 already present; pacman paused per tooling directive).

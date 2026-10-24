# ScoutCensus — round 52

Axes: live census validity; row/tier delta fidelity; frozen E4 reproducibility. Independent commands ran concurrently; no repository source or shared artifact was changed.

## Observed findings — high confidence

Measured live census at `2026-10-24T04:04:02.982627+00:00`:

`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`

Exited **0**. The complete verbatim merged stdout/stderr, command, timestamp, and `census-exit=0` are saved in `.ufo/waves/round-52/build/ScoutCensus/census-wave.txt`.

| Metric | Round-open baseline | Wave observation | Delta |
|---|---:|---:|---:|
| Validation exit | 0 | 0 | unchanged |
| Source rows | 101 | 101 | 0 |
| Tier A | 87 | 87 | 0 |
| Tier B | 6 | 6 | 0 |
| Tier C | 8 | 8 | 0 |
| W04 warnings | 4 | 4 | 0 |

The same four pre-existing cross-scope duplicate-URL warnings remain: **S034, S068, S084, S095**. No additional warnings or errors appeared. Baseline validation/warning evidence: `.ufo/waves/round-52/base/baseline-gates.txt:20-26`; baseline row/tier counts: `.ufo/waves/round-52/plan.md:194-200`.

Row counting used the specialized grep device with anchored pattern `^\| S` (equivalent to the requested `grep -c '^| S' corpus/SOURCES.md`): **101 matches**, S001–S101. The census script's `census` mode independently returned 101 rows and A:87/B:6/C:8, exit 0. Counts and the SOURCES.md SHA-256 are recorded in `.ufo/waves/round-52/build/ScoutCensus/census-totals.txt`. The measured source hash was `1f12e2d1b563455d3bf8dcf52320fc20788bb03791ba343502f067fe25e6c03e`.

## Frozen D52 E4 arm — high confidence

Resolved `f539a71e` to **`f539a71e236a4d66810851c1f2fb6e1abe61ec19`**, created a `mktemp -d` directory inside this seat's auxiliary directory, extracted it with `git archive f539a71e | tar -x -C <temp>` under `bash -o pipefail` (exit 0), and ran `node scripts/sources-check.mjs` with that extracted tree as cwd.

Verbatim checker output:

```text
SOURCES  info  LEGACY_NO_HEADER  count=38
SOURCES_CHECK: CLEAN (rows=101 tiers=A:87,B:6,C:8 status=queued:12,mined:73,rejected:16 entries_with_source=8 legacy=38)
```

**Exit 0: the frozen tree satisfies E4's CLEAN/exit-0 condition.** The informational legacy-header count is not a failure. Gate condition evidence: `.ufo/waves/round-52/probe/doctrine52-probe.mjs:111-115`; live E5 condition: lines 117–122. This was an isolated E4 execution, not a claim that the entire D52 counter held.

Full extraction/check transcript: `.ufo/waves/round-52/build/ScoutCensus/sources-check-freeze.txt`. The private extracted tree was removed afterward; `.ufo/waves/round-52/build/ScoutCensus/freeze-cleanup.txt` records cleanup exit 0.

## Inference and remaining boundary

- At this observation, no source-row or tier change had landed relative to the round-open baseline; S102/S103 were absent from the queried live registry. This is a wave-time snapshot, not the final Sources-section close census.
- Final integrated S102/S103 counts/tiers and E4 at the measured close revision remain unmeasured here; L1 must use the frozen close sequence. No peer artifact or tool dependency blocked this assignment.
- No tools were installed or updated. No source edits, git/jj mutations, background services, or subagents were used.

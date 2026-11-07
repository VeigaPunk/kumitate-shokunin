# K97ExecTool — final

Axes: operability, selftest clause coverage, preservation of row checks.
Candidate: `.ufo/waves/round-97/K97ExecTool/sources-check.mjs`.
SHA256 / READY: `ccbf1619baec74b32d7a2607652d3f9772a245af3b424c487da7275cf56971c4`.
Production delta: R97 raw-LF section reader and one header sentence; row handling unchanged. Added hermetic section arms and optional live census parity; all 46 original arms retained, final 68/68 PASS.
Receipts below live in `.ufo/waves/round-97/K97ExecTool/`.
Command `bash final-receipts.sh` records `selftest.txt`, `sha256.txt`, `diff.txt`, and twice the exact frozen probe invocation with TMPDIR in seat scratch:
- `score1.txt`: `C97_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=1/1 f=1/1 tool_sha256=ccbf1619baec74b32d7a2607652d3f9772a245af3b424c487da7275cf56971c4 seed=68759c13a1ed0f53`
- `score2.txt`: `C97_C1: HELD a=1/1 b=1/1 c=1/1 d=1/1 e=1/1 f=1/1 tool_sha256=ccbf1619baec74b32d7a2607652d3f9772a245af3b424c487da7275cf56971c4 seed=1e0a99d2ff96e72e`
Command `timeout 500 prlimit --as=4294967296 node teeth.mjs` applied frozen generator section blocks to candidate copies: `arm-teeth.txt` = 15/15 killed by new arms; each `teeth-<shape>.txt` retains full selftest stdout. Earlier hand-built mutation drivers accidentally ignored their split option; their outputs were discarded, and the retained driver uses the generator's exact blocks instead.
No lane implementation, frozen plan/probe/controls, or corpus files changed. cap-spawn.mjs and cap-run.mjs are unmodified run aids, not deliverables. No tools installed. LSP unavailable in mounted tool inventory; no symbol refactor needed.
Risks: this deliberately mirrors census, not CommonMark; optional parity skips only absent census / unavailable runtime (exit other than 0 or 1). Additional mutation gaps (trailing SP/TAB trim and 4-space h1/h2 transitions) were independently reported by K97Mutation and are outside the assigned fifteen shapes; no broader robustness claim.
Blockers: none. Parent owns integration/harm gates; this seat ran only requested selftest, mutation teeth, and frozen counter.
Self-evaluation: accuracy 4 (two final frozen HELD receipts; no broader grammar claim); completeness 4 (all assigned deliverables, coverage limits above); clarity 4 (exact paths/commands); actionability 5 (candidate + immutable READY); conciseness 4 (mutation provenance retained). Improvement: parent can route the additional transition coverage separately.
No candidate edits after READY. Scratch removed before yield.

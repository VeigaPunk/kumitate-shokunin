# K75ExecTipDrift

Axes: operability + coverage (orchestration/tooling).

Delivered `build/K75ExecTipDrift/K75ExecTipDrift.patch` relative to this wave, against base `c38382d547a1ec21bb7f51b4c08ef08053e7abae`. Only implementation path changed: `scripts/proxy-check.mjs`; lane implementation was never edited. Additive argument-loop mode, mandatory pin, explicit/env/legacy origin selection, read-only git, frozen LAYER_PATTERNS classification, exact text exits, JSON object, help documentation, eight hermetic CLI cases. Default terms, stanza keys and exit map unchanged. Fixture git writers now assert their own toplevel before committing.

Receipts (under `.ufo/waves/round-75/build/K75ExecTipDrift/`):
- `red-before.txt`: base `PROXY_SELFTEST: 124/124 pass`, `VERDICT: PASS`, exit 0; unknown `--tip-drift`, exit 64.
- `after-selftest.txt`: `PROXY_SELFTEST: 132/132 pass`, `VERDICT: PASS`, exit 0.
- `live-tip-drift.txt`: literal shell commands with `echo exit=$?`; MOVED `pin=31c465f15669 origin=fb7157fcf146 commits=58 changed=241 scripts=57 runtime=23 other=161`, exit 1; pinned clone IN_SYNC all zeros, exit 0; `/tmp` FAIL-CLOSED SRC_REV_UNVERIFIABLE, exit 2. `/tmp` was read-only, never a fixture location.

Commands ran from `/fast/scratch/hyaku/kumitate-r75/K75ExecTipDrift/src` with explicit `TMPDIR=/fast/scratch/hyaku/kumitate-r75/K75ExecTipDrift`: `node scripts/proxy-check.mjs --selftest`, `node scripts/proxy-check.mjs --tip-drift`, then `--tip-drift --origin /fast/scratch/hyaku/kumitate-pin/src`, then `--tip-drift --origin /tmp`. Baseline and first after run resolved Node v26.12.0 in Eval's environment, unlike shell Node v24.21.0. After-selftest and all live commands were additionally exercised using explicit `/run/user/1000/fnm_multishells/1981588_1793727763382/bin/node` (v24.21.0); both after suites pass 132/132. No installs/updates.

Pin bytes identical to base, SHA256 `e5e20505dddeb8bcba010d42a5f84855ea672e3f5a2e01a071623839e09b86e3`. Patch SHA256 `9df5ca65cb829dc3cea08750cbc3d80fcd4344a8c287827b0463a19ca538e74c`; resulting proxy SHA256 `92465ddc7ad57111e5a946f83af2788adfd63deb28ab6af49f13fde454eabf2e`.

Limits: no mounted LSP definition/reference/refactor tool was available; used file reads and anchored edits. No integrated default-mode `--strict` gate or mutation gate run by this seat: L1 owns the former after stanza/map integration; K75MutTipDrift owns the latter and received canonical patch plus seams. Removing only the non-directory refusal leaves the independent HEAD refusal; mutate the complete origin-validation unit rather than misreport an equivalent guard deletion. No SCORECARD or pin changes. Scratch removed before yield.

Self-evaluation: accuracy 4 (direct receipts, but baseline Node differs from host); completeness 4 (all scoped deliverables; integration/mutations owned elsewhere); clarity 4 (paths and commands explicit; dual Node receipts add complexity); actionability 4 (single-path patch and digests; L1 must integrate); conciseness 4 (retains necessary evidence and caveats). Overall 4.0. Improvements: retain host Node as explicit executable in all future receipt drivers; prefer environment-independent fixture executors. User-agreement check: these limits are disclosed, not presented as passing gates.

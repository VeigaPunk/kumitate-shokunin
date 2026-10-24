# SonicAudit — w1 mechanical audit (round 51)

Seat: SonicAudit (mechanical audit, wave 1). Read-only mandate: file inventory + containment
check under `.ufo/waves/round-51/` + freeze hashes of plan.md and both counters.
Audit window: 2026-10-24T02:00:15Z–02:03:56Z (UTC). The tree was **live** during the audit
(wave 1 in flight); every reading below is timestamped.

## Method

```
find /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/ -type f -printf '%s\t%p\n' | sort -k2   # snapshots 1 & 2
sha256sum plan.md probe/attest51-probe.mjs probe/doctrine51-probe.mjs                                             # three passes
stat -c '%s bytes  mtime=%y  %n' <files>; cmp w1-dispatch.json w1-validate.json
find . -type l -o -type b -o -type p -o -type s                        # symlink/device/fifo sweep: none found
git status --porcelain / git log / git show <rev>:<path> / git diff / git ls-files   # read-only git only
```

No installs performed (nothing to record under the tooling directive). No git/jj mutation run.

## 1. Inventory — snapshot 1 (2026-10-24T~02:00:20Z, 16 files)

```
3549   .ufo/waves/round-51/base/baseline-gates.txt
1149   .ufo/waves/round-51/build/ExecBaseCounter/attest-base.txt
272    .ufo/waves/round-51/build/ExecBaseCounter/doctrine-base.txt
30379  .ufo/waves/round-51/build/ScoutClockSource/clock-gettime.html
21     .ufo/waves/round-51/build/ScoutClockSource/fetch-utc.txt
255    .ufo/waves/round-51/build/ScoutClockSource/headers.txt
16466  .ufo/waves/round-51/build/ScoutRandomSource/getrandom.html
10427  .ufo/waves/round-51/plan.md
9502   .ufo/waves/round-51/probe/attest51-probe.mjs        <-- pre-repair bytes (see §4)
5875   .ufo/waves/round-51/probe/doctrine51-probe.mjs
1545   .ufo/waves/round-51/w1-assignments.json             <-- FLAGGED
79133  .ufo/waves/round-51/w1-dispatch.json                <-- FLAGGED
26458  .ufo/waves/round-51/w1-spec.json                    <-- FLAGGED
30977  .ufo/waves/round-51/w1/swarm-registry.json          <-- FLAGGED
45040  .ufo/waves/round-51/w1-taskcall.json                <-- FLAGGED
79133  .ufo/waves/round-51/w1-validate.json                <-- FLAGGED
```

## 2. Inventory — snapshot 2 (2026-10-24T02:02:47Z, 50 files)

```
429    base/attest-base.txt
3549   base/baseline-gates.txt
158    base/doctrine-base.txt
1226   build/ExecBaseCounter/attest-base-prerepair-crash.txt
485    build/ExecBaseCounter/attest-base.txt
272    build/ExecBaseCounter/doctrine-base.txt
12784  build/ExecSelftestArms/scratch/receipt-attest.mjs
2918   build/LabratClocks/labrat-clocks-addendum-2.mjs
2975   build/LabratClocks/labrat-clocks-addendum-3.mjs
2852   build/LabratClocks/labrat-clocks.mjs
2213   build/LabratClocks/transcript.txt
1253   build/ScoutBaselineHar/01-cap-run-selftest.txt
545    build/ScoutBaselineHar/02-bind-oracle-selftest.txt
1619   build/ScoutBaselineHar/03-counter-rerun-selftest.txt
10162  build/ScoutBaselineHar/04-round-gate-selftest.txt
926    build/ScoutBaselineHar/05-bindguard50-base-c90b9de9.txt
834    build/ScoutBaselineHar/06-repairs50-jj-tip.txt
920    build/ScoutBaselineHar/07-bindguard50-jj-tip.txt
311    build/ScoutBaselineHar/07-verdict-chunks.txt
841    build/ScoutBaselineHar/08-repairs50-base-c90b9de9.txt
950    build/ScoutBaselineHar/09-proxy-drift.txt
1033   build/ScoutBaselineHar/meta-before.txt
6224   build/ScoutBaselineHar/summary.json
30379  build/ScoutClockSource/clock-gettime.html
21     build/ScoutClockSource/fetch-utc.txt
255    build/ScoutClockSource/headers.txt
16466  build/ScoutRandomSource/getrandom.html
61875  build/ScoutReceiptCorpora/corpora.md
94980  build/ScoutReceiptCorpora/inventory.json
5187   build/ScoutReceiptCorpora/summary.json
11130  build/ScoutReceiptCorpora/sweep-corrected-find.out
572    build/ScoutReceiptCorpora/sweep-corrected-grep.out
116    build/ScoutReceiptCorpora/sweep-exact-find.err
10788  build/ScoutReceiptCorpora/sweep-exact-find.out
115    build/ScoutReceiptCorpora/sweep-exact-grep.err
192    build/ScoutReceiptCorpora/sweep-exact-grep.out
10427  plan.md
9533   probe/attest51-probe.mjs
5875   probe/doctrine51-probe.mjs
1545   w1-assignments.json                    <-- FLAGGED
13340  w1/CritFreeze.md
79133  w1-dispatch.json                       <-- FLAGGED
9848   w1/ExecBaseCounter.md
5135   w1/ScoutClockSource.md
5179   w1/ScoutRandomSource.md
16759  w1/ScoutSiblingLanes.md
26458  w1-spec.json                           <-- FLAGGED
32827  w1/swarm-registry.json                 <-- FLAGGED
45040  w1-taskcall.json                       <-- FLAGGED
79133  w1-validate.json                       <-- FLAGGED
```

At the final status pass (02:03:56Z) three more w1 reports existed (untracked, allowed):
`w1/CritC2.md`, `w1/CritHarm.md`, `w1/SentReceipt.md`.

## 3. Containment verdict

Allowed grammar: `{plan.md, probe/*, base/*, w1/<SeatName>.md, build/<seat-name>/*}`.

- **base/, probe/, plan.md**: 100% inside the grammar.
- **build/**: every file sits under `build/<seat-name>/` (ExecBaseCounter, ExecSelftestArms,
  LabratClocks, ScoutBaselineHar, ScoutClockSource, ScoutRandomSource, ScoutReceiptCorpora).
  The nested `build/ExecSelftestArms/scratch/` is still inside `build/<seat-name>/` → allowed.
- **w1/**: all `.md` files match `w1/<SeatName>.md` → allowed. `w1/swarm-registry.json`
  does **not** match the grammar → flagged.
- **Round-51 root**: the five `w1-*.json` dispatch artifacts sit outside the grammar → flagged.
- No symlinks, fifos, devices, or dotfiles anywhere under the audited directory.
- Snapshot 1 → snapshot 2 delta: +34 files, every one inside `build/` or `w1/<SeatName>.md`.
  **Containment held during live churn. Zero seat-attributable scope violations.**

### Flagged files (6) — severity: informational, not seat violations

`w1-assignments.json`, `w1-dispatch.json`, `w1-spec.json`, `w1-taskcall.json`,
`w1-validate.json`, `w1/swarm-registry.json`.

Evidence they are orchestrator infrastructure, not seat writes:

- All six are **git-tracked**, committed in `9d08e6b` "round-51: w1 dispatch evidence (spec v2,
  dispatch, taskCall, registry with agentIds)" (2026-10-23 22:59:19 -0300), i.e. committed
  dispatch evidence, not loose seat output.
- `w1-dispatch.json` and `w1-validate.json` are **byte-identical** (cmp: identical, both
  79133 B) — dispatch/validation mirror, mtimes 22:56:42 / 22:56:15 -0300, all pre-wave.
- `w1/swarm-registry.json` is live harness telemetry: modified between snapshots
  (30977 → 32827 B, mtime 22:59:41 -0300) and still ` M` in git status at 02:03:56Z.

Minimal fix to keep future mechanical audits clean (proposed, L1's call): either extend the
audited-set grammar to include the committed dispatch artifacts, or relocate them out of the
audited directory. Not edited by me — the audited tree is read-only for this seat.

## 4. Freeze hashes (for the close critic)

Three hash passes: 02:00:54Z, 02:02:01Z, 02:03:56Z. Final record **as of 2026-10-24T02:03:56Z**:

| File | sha256 (final) | bytes | stability during audit |
|---|---|---|---|
| `.ufo/waves/round-51/plan.md` | `dc8fbc9a53379f8ab1ead3ac75f4640c52a262f903e8e1e4578640ebf6613c2c` | 10427 | identical in all 3 passes; clean vs HEAD; mtime 2026-10-23 22:49:27 -0300 |
| `.ufo/waves/round-51/probe/attest51-probe.mjs` | `422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1` | 9533 | changed once at 02:00:23Z (pre-repair `e06be992…`, 9502 B); stable in all passes after |
| `.ufo/waves/round-51/probe/doctrine51-probe.mjs` | `f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0` | 5875 | changed once mid-audit: `0c689c51…`@02:00:54Z → `f2d27071…`@02:01:47Z; stable after |

### Counter lineage (proven via read-only git)

- `06ecbf4` 2026-10-23 22:53:14 -0300 "freeze plan, counters A51/D51, w1 spec"
  — attest `e06be992d3fece8f1dfb61c4acfc6bc3e5297c585fc04c390dea34d73bb1dc89` (9502 B),
  doctrine `0c689c51ecbfee9da8d12dad6253f1c583d08d132f76a428e0ba3997b91e9682` (5875 B).
- `1fd8ace` 2026-10-23 23:00:31 -0300 "freeze repair — comment-only fix for A51 block-comment
  termination (no check semantics changed)" — attest → `422e67b0…` (9533 B), doctrine unchanged.
  **Independently verified comment-only**: `git diff 06ecbf4 1fd8ace` shows a single JSDoc
  line rewritten (A4 sweep-scope wording), no executable change.
- `3ed875d` 2026-10-23 23:01:08 -0300 "freeze repair 2 — D51 SOURCES-row column indexes
  (status c[8], used-by c[11]) per two independent seat findings; no other semantics changed"
  — doctrine → `f2d27071…` (5875 B). **Independently verified semantic-but-minimal**: the full
  `git diff 1fd8ace HEAD` for the file is exactly one line in the D3 row check:
  `c[9] === 'mined' && c[12].includes(ENTRY)` → `c[8] === 'mined' && c[11].includes(ENTRY)`.
- Note: at 02:02:01Z `git status` transiently showed ` M doctrine51-probe.mjs` while its
  content hash already equaled the committed `f2d27071…`; by 02:02:47Z `git diff` was empty.
  [INFERENCE] jj/git colocation sync lag, not a further content change.
- Final pass 02:03:56Z: working tree of all three frozen files == HEAD; only tracked dirt in
  the audited tree is `w1/swarm-registry.json` (harness telemetry, expected).

## 5. Findings

- **F1 (for L1 adjudication at close) — freeze stability.** Both "frozen" counters were
  repaired twice during wave 1 (`1fd8ace` comment-only A51; `3ed875d` semantic one-line D51
  column-index fix, openly declared "per two independent seat findings"). I make no judgment
  and edited nothing; the close critic should pin the final hashes above, carry the repair
  lineage into the close report, and re-hash both counters at close time to confirm no drift
  after 02:03:56Z.
- **F2 (informational) — six files outside the audited grammar**, all orchestrator dispatch/
  registry infrastructure, all git-tracked in `9d08e6b`, none seat-writable (§3). Zero
  seat-attributable scope violations.
- **F3 (informational) — `w1/swarm-registry.json` is live-modified** and will legitimately
  differ at close; exclude it from byte-equality freeze checks.

## 6. Attestation

This seat wrote exactly one file: this report
(`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w1/SonicAudit.md`,
itself inside the allowed grammar). All git usage read-only
(status/log/show/diff/ls-files); the listing above excludes this report by construction
(snapshot 2 predates it).

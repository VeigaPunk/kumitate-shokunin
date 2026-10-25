VERDICT: the receipt tool's first build is forgeable 20 ways (20 report lies read CLEAN) and its own frozen P2 arm cannot pass (ids=6 < 8); a 239-line unified diff (130+/36-, `report-receipt-diff.v2.mjs`, selftest 20→42) kills all 20 while the 16 frozen controls, the round-60 DRIFT shape and the round-63 CLEAN stay byte-identical.

# Seat K64ExecReceiptForge — forge `scripts/report-receipt-diff.mjs`, then make the forgery fail

## Evidence

Lane `kumitate-shokunin` at `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` (frozen subject, unmodified). Scratch `/tmp/kumitate-r64/K64ExecReceiptForge/`.

1. First build, through one harness (`build/K64ExecReceiptForge/check.mjs`: selftest, the 16 frozen controls, my 20 forgeries, the two P3 arms):
```
$ node check.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/report-receipt-diff.mjs
SELFTEST exit=0 REPORT_RECEIPT_SELFTEST: PASS (20/20)
FROZEN controls=16
FORGERY cases=20
P3/r60 exit=1 placeholders=6 indep=6 tallyLine=true
P3/r63 exit=0 REPORT_RECEIPT: CLEAN (round=63 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef bytes=17479)
CHECK cases=36 fails=20
FAIL forge/k1-tally-spaced-eq: got=0/CLEAN want=1/TALLY_UNRECEIPTED
FAIL forge/k10-placeholder-xxxx: got=0/CLEAN want=1/PLACEHOLDER
FAIL forge/k11-placeholder-lowercase-token: got=0/CLEAN want=1/PLACEHOLDER
FAIL forge/k12-sections-in-fence: got=0/CLEAN want=1/SECTION_MISSING,SHONEN_COUNT
FAIL forge/k13-shonen-in-fence: got=0/CLEAN want=1/SECTION_MISSING,SHONEN_COUNT
FAIL forge/k14-receipt-path-escape: got=0/CLEAN want=1/RECEIPT_MISSING
FAIL forge/k15-receipt-symlink: got=0/CLEAN want=1/RECEIPT_MISSING,TALLY_UNRECEIPTED
FAIL forge/k16-receipt-empty: got=0/CLEAN want=1/RECEIPT_EMPTY
FAIL forge/k17-tally-base-only: got=0/CLEAN want=1/TALLY_UNRECEIPTED
FAIL forge/k18-tally-cited-mismatch: got=0/CLEAN want=1/TALLY_UNRECEIPTED
FAIL forge/k19-shonen-boxes-outside: got=0/CLEAN want=1/SHONEN_COUNT
FAIL forge/k2-tally-lowercase-label: got=0/CLEAN want=1/TALLY_UNRECEIPTED
FAIL forge/k20-tally-checks-mismatch: got=0/CLEAN want=1/TALLY_CHECKS_MISMATCH
FAIL forge/k3-tally-table-cell: got=0/CLEAN want=1/TALLY_UNRECEIPTED
FAIL forge/k4-tally-zero-width: got=0/CLEAN want=1/TALLY_UNRECEIPTED
FAIL forge/k5-hash-uppercase-dead: got=0/CLEAN want=1/HASH_DEAD
FAIL forge/k6-hash-39-digits: got=0/CLEAN want=1/HASH_DEAD
FAIL forge/k7-placeholder-braces: got=0/CLEAN want=1/PLACEHOLDER
FAIL forge/k8-placeholder-angle-measured: got=0/CLEAN want=1/PLACEHOLDER
FAIL forge/k9-placeholder-prose: got=0/CLEAN want=1/PLACEHOLDER
```
2. Same harness against the patched draft (`build/K64ExecReceiptForge/report-receipt-diff.v2.mjs` = full-file draft; `patch.diff` = `git apply -p1` unified diff on a scratch copy, 130+/36-):
```
SELFTEST exit=0 REPORT_RECEIPT_SELFTEST: PASS (42/42)
FROZEN controls=16
FORGERY cases=20
P3/r60 exit=1 placeholders=6 indep=6 tallyLine=true
P3/r63 exit=0 REPORT_RECEIPT: CLEAN (round=63 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef bytes=17479)
CHECK cases=36 fails=0
```
3. The frozen probe at the frozen tree (`P1..P4`; `--report` fed the round-63 bytes so P5 is not the real arm):
```
$ node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef --report /tmp/kumitate-r64/K64ExecReceiptForge/r63.md
RECEIPT64_UNMET held=3/5 checks=5 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef rule=R64 | P2 MISS ids=6 | P5 MISS exit=1 REPORT_RECEIPT: DRIFT TALLY_UNRECEIPTED (round=64 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef bytes=17479)
$ echo $?
1
```
4. The probe's P2 arm re-implemented verbatim (`p2sim.mjs`) over the frozen controls, over frozen+my 20, and over two stub tools:
```
$ node p2sim.mjs scripts/report-receipt-diff.mjs .ufo/waves/round-64/controls/receipt
P2SIM cases=16 ids=6 clean=3 honest=true FAIL
  ids=6
$ node p2sim.mjs scripts/report-receipt-diff.mjs /tmp/.../merged        # 16 frozen + 20 forge
P2SIM cases=36 ids=6 clean=3 honest=true FAIL
  k1-tally-spaced-eq:got=0/CLEAN      (… one such line per forged case, 20 in all)
  k10-placeholder-xxxx:got=0/CLEAN
$ node p2sim.mjs report-receipt-diff.v2.mjs /tmp/.../merged
P2SIM cases=36 ids=8 clean=3 honest=true PASS
$ node p2sim.mjs /tmp/.../stubs/always-clean.mjs /tmp/.../merged
P2SIM cases=36 ids=0 clean=3 honest=true FAIL
$ node p2sim.mjs /tmp/.../stubs/always-drift.mjs /tmp/.../merged
P2SIM cases=36 ids=1 clean=0 honest=false FAIL
```
5. Real data under the patch, verbatim (identical to the first build's r60 shape):
```
$ node report-receipt-diff.v2.mjs --lane . --round 60 --report /tmp/kumitate-r64/K64ExecReceiptForge/r60.md --rev dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef --fleet /home/vgpnk/Projects/shokunin
REPORT_RECEIPT: DRIFT PLACEHOLDER,TALLY_UNRECEIPTED (round=60 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef bytes=13611)
PLACEHOLDER __TIP__
PLACEHOLDER __MEASURED__
PLACEHOLDER __COMMITS__
PLACEHOLDER __MEASURED__
PLACEHOLDER __MEASURED__
PLACEHOLDER __MEASURED__
TALLY_UNRECEIPTED DISPATCH60_HELD held=10/10
$ echo $?
1
```
Round-63 report as filed under the patch: `REPORT_RECEIPT: CLEAN (round=63 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef bytes=17479)`, exit 0.
6. `k15`'s symlink survives the probe's `git archive` path (throwaway fixture repo, `git -C "$D"` only): mode `120000`, target `../../../../outside/tip.txt`; archived case → first build `REPORT_RECEIPT: CLEAN` exit 0, patch → `DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` exit 1.
7. Calibration (not a forgery — the first build already says this): six headings only as bold text → `REPORT_RECEIPT: DRIFT SECTION_MISSING,SHONEN_COUNT` exit 1.

## Findings

**K64ExecReceiptForge-1 — high — the frozen counter's P2 arm is unsatisfiable at the frozen tree (reported, not patched).**
`receipt64-probe.mjs` P2 requires `ids >= 8`; the 16 committed controls exercise 6 (`PLACEHOLDER, TALLY_UNRECEIPTED, RECEIPT_MISSING, HASH_DEAD, SECTION_MISSING, SHONEN_COUNT`). Worse, only **7** finding ids are observable in the P2 harness at all: it runs each case from a `git archive` copy in a temp dir, so the case lane is not inside a git repo, `tip` is `''` and every hash is `HASH_DEAD` — `HASH_ORPHAN` is unreachable there. With the one extra id my patch adds for a real lie (`RECEIPT_EMPTY`) the ceiling is 7, still below 8. So `RECEIPT64_HELD` cannot reach 5/5 as frozen; the ratchet must supply an 8th worktree-observable id. My patch adds `TALLY_CHECKS_MISMATCH` (k20: a report inflating `checks=`) exactly to reach 8, and `p2sim` shows `ids=8 PASS` on frozen+20. If the L1 rejects that check, the floor itself has to change — a relaxation, L1's call, declared before scoring.
Repro: `node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> dd1a3e6f... --report <any>` → `P2 MISS ids=6`.

**K64ExecReceiptForge-2 — high — the tally parser is bypassable by formatting and by substring, and never binds a claim to the receipt the report cites.** `TALLY = /\b([A-Z][A-Z0-9]*_(?:HELD|UNMET))\s+held=(\d+)\/(\d+)/` (case-sensitive, exact spacing) and a match test that accepts *any* line containing the label plus `held=x/y` anywhere. Read CLEAN: `held = 3 / 3` (k1), `x9_HELD` (k2), `| X9_HELD | held=3/3 |` (k3), a U+200B inside the label (k4), a claim whose pair only appears on a line carrying *another* label's pair (k17: base plan-target line), a claim carried by a superseded close receipt while the cited one says 1/3 (k18).
Repro: `node scripts/report-receipt-diff.mjs --lane build/K64ExecReceiptForge/cases/k18-tally-cited-mismatch/lane --round 9 --report build/K64ExecReceiptForge/cases/k18-tally-cited-mismatch/report.md` → `CLEAN` exit 0.

**K64ExecReceiptForge-3 — high — receipt identity is a string, not a file.** A citation whose valid prefix is followed by `/../../../round-8/...` passes (the path regex stops at the first `/`; k14); a receipt that is a **symlink** out of the lane is read through (`readFileSync` follows; k15 — CLEAN on the archived control too); a zero-byte receipt cited as the confirmation passes (existence is the only test; k16).
Repro: `--lane .../cases/k16-receipt-empty/lane --report .../k16-receipt-empty/report.md` → `CLEAN` exit 0.

**K64ExecReceiptForge-4 — high — the placeholder vocabulary is three tokens.** `{{MEASURED_REV}}` (k7), `<measured>` (k8), "to be filled" (k9), `XXXX` (k10) and lower-case `__measured__` (k11) all read CLEAN, i.e. the exact round-60 failure mode (`__TIP__`, `__MEASURED__`, `__COMMITS__`) recurs in five other spellings.
Repro: `--lane .../cases/k7-placeholder-braces/lane --report .../k7-placeholder-braces/report.md` → `CLEAN` exit 0.

**K64ExecReceiptForge-5 — medium — structure checks are fence-blind and section-blind.** All six headings inside one fenced block (k12) and the SHONEN block quoted in a fence (k13) satisfy `SECTION_MISSING`/`SHONEN_COUNT`; four checkboxes under a later `## Appendix` satisfy the SHONEN box count while the SHONEN section is empty (k19).
Repro: `--lane .../cases/k19-shonen-boxes-outside/lane --report .../k19-shonen-boxes-outside/report.md` → `CLEAN` exit 0.

**K64ExecReceiptForge-6 — medium — hash vocabulary is lower-case 40 only.** An upper-case dead hash (k5) and a dead hash truncated to 39 digits (k6) read CLEAN; both look like a full commit id to a reader.
Repro: `--lane .../cases/k6-hash-39-digits/lane --report .../k6-hash-39-digits/report.md` → `CLEAN` exit 0.

**K64ExecReceiptForge-7 — medium — `checks=` is never compared.** `X9_HELD held=3/3 checks=9` against a receipt stating `checks=3` reads CLEAN (k20). This is also the id that makes P2 reachable (finding -1).

### Fixes, per case (cheapest change; full text in `CASES.md` and `patch.diff`)
One normalisation (`scan()`: strip U+200B–200F/U+2060/U+FEFF, `|`→space, `\s*=\s*`→`=`, `\s*/\s*`→`/`), a case-insensitive `TALLY` and an exact `(label,x,y)` index kill k1–k4, k17, k18; `unfence()` + a section-scoped box loop kill k12, k13, k19; `RECEIPT_PATH` class `+ /` with `isPath()` rejecting `..`/dirs kills k14; `lstatSync().isFile()` (worktree) / mode-`120000` skip (rev) kills k15; `RECEIPT_EMPTY` kills k16; `HASH = /[0-9a-fA-F]{39,40}/` + lower-case before git kills k5, k6; five `PLACEHOLDER` alternations kill k7–k11; the `checks=` comparison kills k20. Nothing is relaxed (bare `held=9/10` stays unchecked; `c14-honest-templates` still CLEAN).

### Inherent (cannot be killed without a plan-target/result distinction)
k17/k18 residuals: when the report *cites* the base plan-target file or the superseded receipt that carries the pair, the tool must accept — which receipt is authoritative for a label is a target-vs-result binding, not report bytes. Also inherent: a tally with no `held=`/label form (bare `3/3`), dead hashes shorter than 39 hex (`7b0581ed`-style), a receipt that misstates itself, and a SHONEN block of four `[ ]` boxes.

## Artifacts
- `.ufo/waves/round-64/build/K64ExecReceiptForge/cases/` — 20 controls (k1…k20), frozen format, each with `note.md`; index `CASES.md`.
- `.ufo/waves/round-64/build/K64ExecReceiptForge/report-receipt-diff.v2.mjs` (full-file draft) and `patch.diff` (`diff -u a/scripts/… b/scripts/…`, verified: `git apply -p1 --check` exit 0, applied copy `cmp`-equal to the draft).
- `.ufo/waves/round-64/build/K64ExecReceiptForge/{check,p2sim,gen-cases}.mjs` — harness, P2 re-implementation, case generator. This report: `.ufo/waves/round-64/w1/K64ExecReceiptForge.md`.

## Limits
- The probe cannot run an uncommitted tool (it reads `git archive <rev>`), so P1/P2/P3 were re-run directly and P5 was not measured — the round-64 report is not mine to write; the probe's P5 line above used round-63 bytes and is meaningless.
- Regression scope: 16 frozen controls + r60/r63. The patch was not run over rounds 1–63 reports; the one known shape that could false-positive is round 52's `base/baseline-gates.txt` quoting `DOCTRINE_HELD held=5/5` (accepted if the report cites that file — not run).
- PLACEHOLDER stays fence-agnostic on purpose (c13 requires it): a report that *quotes* an unfilled token as an example is flagged. Known cost, not a lie. `RECEIPT_EMPTY`/`TALLY_CHECKS_MISMATCH` are new ids: the L1 owns the contract bump and the `expect` integration.
- Tool installs/updates: none (node v24.21.0, git, diff pre-existing; no pacman, uv or npx use).

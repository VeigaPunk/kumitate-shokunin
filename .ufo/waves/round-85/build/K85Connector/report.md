# K85Connector — Cross-Lane Overlap Scan & UFO-FSD Synthesis

- **Seat:** `K85Connector`
- **Role:** UFO-FSD connector (leaf member; no subagent dispatch)
- **Lane:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin`
- **Target Revision Base:** `a5d3e7549501ae76dbd86a6f81c5e858f1f92446` | **Freeze:** `9db0c6b5eb9111cfc5581006ba976ca2cd112792` | **Repair:** `6663b3beb4b5bd30e766e9c01f6ba4db24f5c5e8`
- **Declared Axes:** `operability` (primary) + `coverage` (secondary)
- **Tool Installs:** None (all scans executed via read-only tools)

---

## 1. Cross-Lane Overlap Scan Table

Read-only search across `/home/vgpnk/Projects/shokunin/*-shokunin` for `control`, `no-reader`, `discriminat`, `sha256=`, `derived line` in `corpus/QUALITY.md`, `corpus/lessons/`, and `scripts/`.

| Lane | File:Line | Pattern | One-Line Summary |
|---|---|---|---|
| `chousa-shokunin` | `corpus/QUALITY.md:159` (Q24) | `control`, `no-reader` | Mandates pre-data controls (do-nothing, all-false, junk, no-reader, shortcut); meeting counter forces re-design. |
| `chousa-shokunin` | `corpus/QUALITY.md:294` (Rule 38) | `sha256=` | Mandates no-harm battery output starts with `lane_revision=` and `gate_sha256=` header. |
| `chousa-shokunin` | `corpus/QUALITY.md:469` (Rule 56) | `discriminat` | Requires attack or discrimination fixtures to be shown able to fire before their cell counts. |
| `chousa-shokunin` | `corpus/QUALITY.md:986` (Q119) | `control` | Counter control matrix must run and be committed before binding data; base reaching target fails matrix. |
| `chousa-shokunin` | `corpus/lessons/round-30.md:31` | `no-reader` | Mistake where item shape carried label, allowing no-reader control to reach 104/106 without reading quote. |
| `chousa-shokunin` | `corpus/lessons/round-31.md:42` | `no-reader` | Mistake where counter checked verdict but not findings; no-reader scored 88/120 before findings were enforced. |
| `chousa-shokunin` | `corpus/lessons/round-32-verifier-spotcheck.md:104` | `no-reader`, `discriminat` | Non-author ruling: measure cannot discriminate because no-reader control meets it. |
| `kaidoku-shokunin` | `corpus/QUALITY.md:58` (Row 48) | `control`, `no-reader` | Every claim counter scored before data on do-nothing, junk, all-false, no-reader, and id-keyed shortcuts. |
| `kaidoku-shokunin` | `corpus/QUALITY.md:68` (Row 58) | `no-reader`, `control` | Repertoire-calibration counter must score empty/junk/no-reader controls before data. |
| `kaidoku-shokunin` | `corpus/QUALITY.md:71` (Row 61) | `discriminat` | Gate self-invocation must assert exit code and stable findings on isolated green and red fixtures. |
| `kaidoku-shokunin` | `corpus/lessons/round-31-verifier-spotcheck.md:81` | `no-reader`, `discriminat` | Pre-data controls (do-nothing, junk-row, all-false, no-reader, id-rotated) scored 0/12 to prove discrimination. |
| `kaidoku-shokunin` | `corpus/lessons/round-60.md:46` | `derived line` | Mandates after-arms are re-derived line-by-line against named revision; pasted integer must match observed output. |
| `mado-shokunin` | `corpus/QUALITY.md:131` (Rule 24) | `sha256=` | Sentences relying on receipts must cite receipt whose bytes name producer `tool_sha256=` and `measured_commit`. |
| `mado-shokunin` | `corpus/QUALITY.md:324` (Rule 36) | `control`, `no-reader` | Pre-data controls (do-nothing, all-false, junk, echo, label/fixture-keyed, no-reader) committed before data. |
| `mado-shokunin` | `corpus/lessons/round-27-verifier-spotcheck.md:95` | `derived line` | Evidence-verified gate run with counts re-derived line-by-line from committed receipt. |
| `kake-shokunin` | `corpus/lessons/round-36-verifier-spotcheck.md:79` | `no-reader`, `control` | Final counter scores 0 on constant clean, all-false, and 8 on no-reader control. |
| `kake-shokunin` | `corpus/lessons/round-66.md:97` | `derived line` | Rows of `corpus/knowledge/gate-status-ledger.md` derived line-for-line from committed `controls/after-c66.txt`. |
| `kama-shokunin` | `corpus/QUALITY.md:87` (KQ18) | `discriminat` | Rejection promise demonstrated by discriminating red/green pair through actual runner CLI. |
| `kama-shokunin` | `corpus/QUALITY.md:219` (KQ37) | `control`, `discriminat` | Shortcut-control receipt committed before data; discriminating against decoded echo variations. |
| `kama-shokunin` | `corpus/QUALITY.md:607` (KQ64) | `control` | Claim names shortcut control input before data and commits the landed counter's output and exit on that input. |
| `kama-shokunin` | `corpus/lessons/round-26.md:79` | `no-reader` | L1 ran do-nothing, junk, generic and no-reader controls before data dispatch. |
| `kasegi-shokunin` | `corpus/QUALITY.md:65` (R11) | `discriminat` | Counter instrument must publish discrimination against degenerate and mutated instruments in receipt. |
| `kasegi-shokunin` | `corpus/QUALITY.md:77` (R13) | `discriminat` | Counter limbs shown load-bearing by isolating fixtures; discrimination figure is a measured result. |
| `kasegi-shokunin` | `corpus/QUALITY.md:83` (R14) | `sha256=` | Control/fixture trees committed as content-addressed tarball with sha256 in receipt. |
| `kotoba-shokunin` | `corpus/QUALITY.md:48` (Q37) | `control` | Before data, shortcut controls include cheapest real-input shortcut running under frozen predicate. |
| `kotodama-shokunin` | `corpus/QUALITY.md:83` | `sha256=` | Counter config line carries `# config sha256 (frozen claims.json): <h>` and ledger sha256. |
| `kotodama-shokunin` | `corpus/lessons/round-59.md:119` (R59-M4) | `no-reader`, `control` | Loopback no-reader control met weak counter at revision 0; fixed in revision 1. |
| `mori-shokunin` | `corpus/QUALITY.md:721` (Row 98) | `control` | Pre-data controls must be committed in an ancestor revision of the first data commit. |
| `souji-shokunin` | `corpus/QUALITY.md:255` (Q99) | `sha256=` | Preregistration block must carry `Counter:` and `Population:` paths with `sha256=<64 hex>`. |
| `souji-shokunin` | `corpus/QUALITY.md:256` (Q100) | `control` | Rejecting shape-only counters; requires substance check or execution-count shim. |
| `souji-shokunin` | `corpus/QUALITY.md:257` (Q101) | `derived line` | Derived value states scope in prose; block must name path and revision; value re-derived line-by-line. |
| `souji-shokunin` | `corpus/QUALITY.md:258` (Q102) | `discriminat` | Hidden-case audit runs scenarios counter does not hold to ensure discrimination against memorizing controls. |
| `tabi-shokunin` | `corpus/lessons/round-30-verifier-spotcheck.md:52` | `derived line`, `sha256=` | Only path-derived line predates round; gate pins bytes by SHA-256 without catalog mutant IDs. |
| `tsukuroi-shokunin` | `corpus/QUALITY.md:153` (Row 78) | `control` | Pre-data controls scored under frozen predicate before any seat produces data. |
| `tsukuroi-shokunin` | `corpus/QUALITY.md:157` (Row 81) | `control`, `no-reader` | Pre-data controls include a scripted fetch-and-fill non-reader writer to defeat mechanical format checks. |
| `game-dev-2d-shokunin` | `corpus/QUALITY.md:19` (Q7) | `discriminat`, `control` | Discriminating control requiring negative twin to start/end in empty scratch and fail at distinguishing assertion. |
| `kumitate-shokunin` | `corpus/QUALITY.md:483` (Q29) | `control`, `no-reader` | Operability counter must reject named skip-work controls (absent, constant, junk, no-reader, shortcut) before data. |
| `kumitate-shokunin` | `.ufo/waves/round-85/plan.md:26` | `derived line`, `sha256=` | C1 asserts exit code, verdict line, and input-derived `RECEIPT: bytes= rows= held= findings= sha256=` line. |

---

## 2. Analysis of the Three Capabilities

### (a) Pre-data control-class bar for claims
- **Verdict:** **DUPLICATE / EXISTING FLEET GROUND**
- **Analysis:** A pre-data control-class bar is already widely owned across the fleet:
  - `chousa-shokunin` Q24 & Q119
  - `kaidoku-shokunin` Row 48 & Row 50
  - `mado-shokunin` Row 36
  - `mori-shokunin` Row 98
  - `kotoba-shokunin` Q37
  - `tsukuroi-shokunin` Row 78 & Row 81
  - `kumitate-shokunin` itself owned Q29 since round 44.
  Kumitate round 85's planned Q78 specializes Q29 by specifying the exact quadruple of pre-data control classes: absent tool (`controls/base.txt`), constant printer (`controls/stub.txt`), label-keyed no-reader (`controls/noreader.txt`), and same-path content variation (`controls/cv-*.txt`), each requiring exact unique verdict assertions. The meta-rule is duplicate; the 4-class bar with content variation is kumitate's local hardening against the round-84 vacuous failure.

### (b) Input-derived / digest line on an evidence receipt
- **Verdict:** **GENUINELY NEW**
- **Analysis:** No sibling lane owns an evidence-receipt checker that inspects an arbitrary receipt file and produces a standardized, machine-parseable, input-derived digest line binding the audit to the cryptographic hash and structure of the file:
  `RECEIPT: bytes=<n> rows=<r> held=<h>/<d> findings=<token|none> sha256=<64hex|->`
  While sibling lanes require static headers (`tool_sha256=` in `mado`, `gate_sha256=` in `chousa`, or prose derivations in `souji` Q101), kumitate's round-85 C1 contract `kumitate-counter-receipt-v2` is the first to implement an automated receipt auditor (`counter-receipt.mjs`) whose output cannot be produced by a canned printer because every run asserts dynamic nonces, byte counts, and exact sha256 digests over the receipt bytes.

### (c) Counter / selftest discrimination rule
- **Verdict:** **DUPLICATE / EXISTING FLEET GROUND**
- **Analysis:** Sibling lanes already own explicit rules governing counter instrument discrimination and selftest rigor:
  - `kasegi-shokunin` R11 and R13 require publishing discrimination against degenerate and mutated instruments with isolating fixtures proving each limb load-bearing.
  - `kaidoku-shokunin` Row 61 requires CLI self-invocation on isolated green and red fixtures asserting exit code and stable findings.
  - `souji-shokunin` Q102 enforces hidden-case audits to prevent memorizing controls.
  Kumitate round 85's `--selftest` and probe discrimination suite follow these established fleet-wide patterns.

---

## 3. Lane Boundary Analysis (`PROVINCE.md`)

- **Verdict:** **NO LANE BOUNDARY CROSSED**
- **Evidence:**
  - `kumitate-shokunin/PROVINCE.md:1-16` defines Kumitate Core as orchestration & tooling, explicitly encompassing origin scripts/runtime, OMP agent-plane members, and *"The lane's own instruments `scripts/*.mjs` (registry: `SKILL.md` §Gate registry)"*.
  - Round 79 amendment (`PROVINCE.md:41-48`) clarified that cross-lane report-pointer checking is `kotoba`'s ground, but resolving pointers and checking receipts of **this lane's own round report before filing** is kumitate's own instrument ground.
  - `scripts/counter-receipt.mjs` operates exclusively on kumitate's own receipt files (`close/*.txt`, fixture receipts) and historical evidence. It does not inspect or govern sibling lanes.
  - The instrument remains strictly within Kumitate Core.

---

## 4. Proposal in `considerthese/`

- **Matching Proposal:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/considerthese/2026-10-25.md:59-61`
- **Quote:**
  > `1. **Try to forge each new gate.** When a round adds an evidence gate, read its probe and ask whether a hand-written fixture could pass it (worktree reads, substring matches, file counts). R61-V2 shows the verifier can do this, and I could flag it a round earlier.`
- **Context:** This proposal directly anticipated the round-84 failure where a 6-line constant printer forged the `C84_C1: HELD held=16/16` banner. Additionally, `2026-10-25.md:62-63` proposal 2 proposed diffing reports against receipts (`Diff reports against receipts. Compare each report's held=x/y and placeholder tokens against the committed close/* receipts...`).

---

## 5. Non-Obvious Move (UFO-FSD Connector Synthesis)

### Evidence
1. **The Round-84 Failure Mode:** `counter-receipt` v1 evaluated only high-level summary tokens, allowing a vacuous no-reader to score 16/16.
2. **The Standing Gate Gap:** `scripts/report-receipt-diff.mjs` (introduced in r64) currently diffs report markdown against `close/*.txt` using only a naive regular expression matching `held=X/Y`. It performs **zero structural or cryptographic integrity checks** on `close/*.txt`. A corrupted receipt with malformed arm lines, duplicate arms, or wrong arm prefixes still passes `report-receipt-diff.mjs` as long as its final summary line matches the report table.
3. **Synthesis with Sibling Practice:** `souji-shokunin` Q100/Q101 and `kasegi-shokunin` R11 show that shape-only checks without substance or digest validation permit fabricated evidence.

### Affected Axes
- `operability`: Improved (deepens pre-file verification by connecting the newly admitted v2 receipt discriminator to the round-gating workflow).
- `coverage`: Unharmed (governs existing `close/` receipts without expanding out of province).
- No axis harmed.

### Contradiction Stated Explicitly
Universal retroactive verification of all historical receipts (`close/*.txt`) under v2 rules would fail, because historical receipts legitimately contain historical defects (e.g. r83 `close/c1-probe.txt` has `DRIFT ARMS_TOTAL` with 28 arm rows and `held=27/27`). Smoothing this contradiction by relaxing v2 checks would destroy discrimination; forcing historical rewrites would violate append-only immutability.

### Proposed Move
**Pre-register `report-receipt-diff.mjs` v5 integration with `counter-receipt.mjs` v2 for Round 86.**
- Extend `scripts/report-receipt-diff.mjs` so that before comparing report tallies against receipts, it invokes `node scripts/counter-receipt.mjs --receipt <path>` on all current-round `close/*.txt` files.
- Any receipt returning `DRIFT` or `FAIL-CLOSED` causes `report-receipt-diff.mjs` to halt with exit 1 (`RECEIPT_INTEGRITY_DRIFT`), preventing the round report from being filed with fabricated, vacuous, or corrupted receipts.
- Scope strict v2 validation to the current round's newly generated receipts, maintaining historical receipts under explicit historical exemption flags.

### Second-Order Effects
- **Runtime Surface:** Minimal overhead (~5–10ms per receipt in `close/`) executed during the pre-file verification gate.
- **Contract Surface:** Upgrades `report-receipt-diff` from scalar regex scraping to verified receipt validity.
- **Substrate Surface:** Pure Node ESM execution using explicit scratch roots (`$HYAKU_SCRATCH`); no hardcoded `/tmp` or network dependencies.
- **Verification Surface:** Provides an automated, machine-checkable guarantee against the r60/r61/r84 defect class (fabricated, malformed, or vacuous receipts) before commit and push.

### Verification
- Run `node scripts/counter-receipt.mjs --receipt <receipt>` across round-85 receipts; verify `COUNTER_RECEIPT: CLEAN`.
- Inject a corrupted arm or modified nonce in a test clone; confirm `report-receipt-diff.mjs` fails-closed immediately.

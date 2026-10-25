# Round 64 Integration Map — Kumitate Lane

## 1. Overview and Base Proxy Drift Repair

At round-64 base (`6825a51425e91908f019ed65aa2f4209acbd7087`), `scripts/proxy-check.mjs` and `scripts/readme-map.mjs` fail with:
- `C2_TOTAL_DRIFT`: declared `C2_total=153`, computed `154` (delta = +1).
- `AXES_DRIFT`: coverage `## Axes` row `10`, derived `9`.
- `README_MAP: DRIFT`: `files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md`.

**Root cause:** Hyaku closure committed `corpus/lessons/round-63-verifier-spotcheck.md` at round-63 close without adding its row to `corpus/README.md` or pinning it in `.ufo/pins/readme-map.json`. Consequently, `notes.length` became 154 while `C2` remained 153. The ratio `153/154 = 0.9935` floored `coverageOf` to `9`, drifting from `10`.

**Maintenance repair:**
1. Add row `| \`lessons/round-63-verifier-spotcheck.md\` | ... |` to `corpus/README.md`.
2. Add `"lessons/round-63-verifier-spotcheck.md"` to `.ufo/pins/readme-map.json` `covered`.
3. Update `C2=154`, `C2_total=154` in `SCORECARD.md:292-293`.
This restores `C2=154/154=1.0` and derived `coverage=10`.

---

## 2. Round 64 Additions & Number Transitions

When the round lands (a) `scripts/report-receipt-diff.mjs`, (b) `scripts/jj-seat-demo.sh`, (c) `corpus/knowledge/jj-workspace-seat-containment.md` with S198–S200 and captures, (d) `corpus/lessons/round-64.md` and the round-63 spot-check map row:

| Metric / Term | Base Value | Clean HEAD / Target | Cause / Derivation |
|---|---|---|---|
| `A` (runnables) | 257 | 263 | +6 committed runnables (`scripts/report-receipt-diff.mjs`, `scripts/jj-seat-demo.sh`, 4 probe scripts under `.ufo/waves/round-64/probe/`). |
| `C` (checklist) | 30 | 30 | Lines matching `/^\s*- \[/` in `SKILL.md:698-727`. Unchanged unless checklist item added. |
| `C1` / `C1_total` | 19 / 19 | 19 / 19 | Registry rows S1–S8, R1–R11 in `SCORECARD.md` (unchanged). |
| `C2` (README rows) | 153 | 156 | +3 rows: `round-63-verifier-spotcheck.md`, `jj-workspace-seat-containment.md`, `round-64.md`. |
| `C2_total` (notes) | 153 (declared) / 154 (base disk) | 156 | 58 knowledge notes + 98 lessons notes on disk. |
| `operability` | 9 | 9 | `floor(10 * (263 + 30) / (263 + 30 + 3)) = floor(10 * 293 / 296) = 9` (terminal integer). |
| `coverage` | 9 (drift) | 10 | `floor(10 * (19/19) * (156/156)) = 10` (matches `## Axes`). |
| `SOURCES` rows | 136 | 139 | S198, S199, S200 added to `corpus/SOURCES.md` (mined 104 -> 107). |
| `source-captures` | 29 | 32 | S198, S199, S200 bound in `.ufo/pins/source-captures.json`. |
| `source-dupes` | 6 groups | 6 groups | Unchanged (S198–S200 URLs are distinct from existing sources). |
| `readme-map` | 153 covered | 156 covered | Bimap over all 156 regular markdown files in `corpus/`. |
| `SKILL.md` gates | 22 | 23 | `report-receipt-diff` enters `## Gate registry`. |

---

## 3. Ordered Edit List with Exact Line Anchors

To ensure **no gate fails at any intermediate step**, apply edits in this strict order:

### Step 1: Commit Source Captures on Disk
- Files: write 3 capture files for S198, S199, S200.
- Command: `ls -l <capture paths>`

### Step 2: Bind Captures in `.ufo/pins/source-captures.json` & Register in `corpus/SOURCES.md`
- **File:** `kumitate-shokunin/.ufo/pins/source-captures.json`
  - **Anchor:** Line 206 (before `],` closing `captures`).
  - **Edit:** Insert capture records for S198, S199, S200 with exact byte count and sha256.
- **File:** `kumitate-shokunin/corpus/SOURCES.md`
  - **Anchor:** Line 149 (after `| S197 | ...`).
  - **Edit:** Insert 3 rows for S198, S199, S200 (status `mined`, opened `2026-10-25`, used-by `corpus/knowledge/jj-workspace-seat-containment.md`).
- **Gate Proof:**
  - `node scripts/source-capture.mjs` -> `SOURCE_CAPTURE: CLEAN captures=32 exemptions=107` (exit 0).
  - `node scripts/source-dupes.mjs` -> `SOURCE_DUPES: CLEAN groups=6 known=6` (exit 0).

### Step 3: Land Knowledge Entry, Isolation Substrates Amendment, and Province Line
- **File (new):** `kumitate-shokunin/corpus/knowledge/jj-workspace-seat-containment.md`
  - Header: `source: S198 S199 S200`, `verified-at: 2026-10-25`, `recheck: 90d`.
  - Sections: `## Located quotes` (>=4 bullets), `## Demo outcomes` (>=12 keys matching `jj-seat-demo.sh`).
- **File:** `kumitate-shokunin/corpus/knowledge/agent-isolation-substrates.md`
  - **Anchor:** Line 299 (EOF).
  - **Edit:** Append `## Amendment 2026-10-25` referencing M7 and `corpus/knowledge/jj-workspace-seat-containment.md` (append-only, preserves exact base bytes).
- **File:** `kumitate-shokunin/PROVINCE.md`
  - **Anchor:** Line 21 (`- Isolation substrates for parallel agents...`).
  - **Edit:** Update line 21 to name `corpus/knowledge/jj-workspace-seat-containment.md` on the frontier ground.
- **Gate Proof:**
  - `node scripts/sources-check.mjs` -> `SOURCES_CHECK: CLEAN (rows=139 ...)` (exit 0).
  - `bash scripts/sources-census.sh validate --file corpus/SOURCES.md` -> exit 0.

### Step 4: Land Lessons Note and Update README Bimap
- **File (new):** `kumitate-shokunin/corpus/lessons/round-64.md`
- **File:** `kumitate-shokunin/corpus/README.md`
  - **Anchor:** Line 188 (after `| lessons/round-63.md | ...`).
  - **Edit:** Insert 3 rows:
    - `| `lessons/round-63-verifier-spotcheck.md` | ... | S196, S197; corpus/lessons/round-63-verifier-spotcheck.md |`
    - `| `knowledge/jj-workspace-seat-containment.md` | ... | S198, S199, S200; scripts/jj-seat-demo.sh |`
    - `| `lessons/round-64.md` | ... | S198, S199, S200; .ufo/waves/round-64/plan.md |`
- **File:** `kumitate-shokunin/.ufo/pins/readme-map.json`
  - **Anchor:** Line 157 (in `covered` array).
  - **Edit:** Add `"lessons/round-63-verifier-spotcheck.md"`, `"knowledge/jj-workspace-seat-containment.md"`, `"lessons/round-64.md"`.
- **Gate Proof:**
  - `node scripts/readme-map.mjs` -> `README_MAP: CLEAN files=156 rows=156 covered=156` (exit 0).
  - `node scripts/cite-sources.mjs` -> `CITE_SOURCES: CLEAN cited=...` (exit 0).

### Step 5: Update `proxy-check.mjs` GATE_PINS, SKILL.md Registry, and SCORECARD.md
- **File:** `kumitate-shokunin/scripts/proxy-check.mjs`
  - **Anchor:** Line 481 (`'pin.plan-before-ready': ...`).
  - **Edit:** Insert `'pin.report-receipt-diff': 'scripts/report-receipt-diff.mjs', // round 64: report receipt comparison gate (C1)`.
- **File:** `kumitate-shokunin/SKILL.md`
  - **Anchor:** Line 589 (`Twenty-two are gates...`) -> `Twenty-three are gates...`.
  - **Anchor:** Line 594 (`Verdict map for all twenty-two...`) -> `Verdict map for all twenty-three...`.
  - **Anchor:** Line 628 (after `plan-before-ready` row).
  - **Edit:** Insert row for `report-receipt-diff` (kind `gate`, entry `node scripts/report-receipt-diff.mjs --report <path> [--round N] [--lane <path>] [--rev REV]`, selftest `--selftest`).
- **File:** `kumitate-shokunin/SCORECARD.md`
  - **Anchor:** Lines 288, 292, 293:
    - `A=257` -> `A=263`
    - `C2=153` -> `C2=156`
    - `C2_total=153` -> `C2_total=156`
  - **Anchor:** Line 308:
    - Update `pin.proxy-check=<new sha256 of scripts/proxy-check.mjs>`.
  - **Anchor:** Line 332 (after `pin.plan-before-ready=...` in `kumitate-gate-pins-v1` block):
    - Insert `pin.report-receipt-diff=<sha256 of scripts/report-receipt-diff.mjs>`.
  - **Anchor:** Line 1798 (after `inline-dispatch-evidence` in `## Capabilities`):
    - Insert capability row for `report-receipt-diff` (`kumitate-report-receipt-diff-v1`).
- **Gate Proof:**
  - `node scripts/proxy-check.mjs --strict` -> `PROXY: MATCH (A=263 C=30 operability=9; C1=19/19 C2=156/156 coverage=10; ...; pins=6 match)` (exit 0).
  - `node scripts/proxy-check.mjs --selftest` -> `PROXY_SELFTEST: 122/122 pass` (exit 0).

### Step 6: Verify Probe Verdicts
- `node scripts/report-receipt-diff.mjs --selftest` -> `REPORT_RECEIPT_SELFTEST: PASS (N/N)` exit 0.
- `bash scripts/jj-seat-demo.sh` -> exit 0 with `JJ_SEAT: ...` outputs.
- `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M> --report <file>` -> `RECEIPT64_HELD held=5/5` (exit 0).
- `node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>` -> `JJ64_HELD held=8/8` (exit 0).

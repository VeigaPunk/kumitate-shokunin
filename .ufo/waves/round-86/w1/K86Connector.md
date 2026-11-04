# K86Connector — Sibling-Overlap Scan & Proposal Synthesis (Round 86)

Seat: `K86Connector` (leaf connector).
Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Base tip: `232350995d3001e606609aaf22ba1b58168d3655`. Freeze commit: `e7228850690c6bd48400140964cbaf18667fbc06`.
Write scope: `.ufo/waves/round-86/build/K86Connector/` and this report (`.ufo/waves/round-86/w1/K86Connector.md`). Read-only on all production lane files and all 20 sibling lanes.

---

## 1. Executive Summary & Statement of Uniquely Owned Surface

The round touches two distinct surfaces:
- **Surface (a):** A gate that binds an instrument's derived answer to a digest of the bytes it read (`scripts/counter-receipt.mjs`, capability acquisition claim C1 `counter-receipt` v3).
- **Surface (b):** A corpus index gate that is section-blind (counts `|` rows anywhere) (`scripts/readme-map.mjs`, routed defect R85-V12).

### Explicit Statement of Uniquely Owned Surface
**Surface (a) — `counter-receipt` v3 (reconciling arm counter transcripts against counter source call sites and binding both halves to SHA-256 byte digests) — is uniquely this lane's ground.**

**Evidence & Rationale:**
1. Under `kumitate-shokunin/PROVINCE.md:3,15`, Kumitate exclusively governs orchestration & tooling (`OMP` task/hub, `ufo-fsd` scripts & runtime) and owns its own instruments `scripts/*.mjs`.
2. The arm counter transcript grammar (`COUNTER_RECEIPT: CLEAN | DRIFT <T> | FAIL-CLOSED <T> | USAGE`, `RECEIPT: bytes=<n> rows=<r> held=<h>/<d> findings=<T|none> sha256=<hex|->`, `SOURCE: sites=<n> declared=<n|absent> receipt=<r> sha256=<hex|->`) is exclusive to Kumitate's test harness architecture (`probe##-c#.mjs`).
3. While multiple sibling lanes (`souji`, `tameshi`, `tabi`, `chousa`, `tsukuroi`) have developed digest-binding gates, every sibling instrument binds *that sibling's own domain artifacts* (census outputs, context captures, measurement manifests, browser test receipts, or git object blobs). Not a single sibling lane validates or reconciles counter transcripts, arm call sites, or counter source code. Kumitate's C1 capability claim is completely uncontested.
4. Conversely, **Surface (b)** (corpus index validation of `corpus/README.md`) is a **fleet-wide, ubiquitous surface** shared by all 21 lanes. Sibling lanes have long encountered section-scoping challenges:
   - `kotodama-shokunin` resolved it via 6-partition heading spans (`tools/check-corpus-index.py`).
   - `kaidoku-shokunin` resolved it via explicit string splitting on `## Coverage map\n` (`tools/round-44/c2-rubric.json`).
   - `kama-shokunin` resolved it via heading constants (`tools/round35-coverage-audit.py`).
   - `souji-shokunin` resolved it via column header filtering (`tools/souji-coverage-agreement.py`).
   - `kengaku-shokunin` implemented the exact same section-blind table row counter in `plans/round75_c1_index_parity.py`.
   Kumitate's `scripts/readme-map.mjs` is this lane's local implementation (`PROVINCE.md:56`), but the problem space of section-blind corpus index validation is shared fleet ground, not uniquely Kumitate's.

---

## 2. Table of Findings Across Sibling Lanes

All paths below are absolute, verified on disk across `/home/vgpnk/Projects/shokunin/*-shokunin/`.

| Surface | Lane | File Path | Mechanism | Ground | Contested Scope Verdict |
|---|---|---|---|---|---|
| **(a) Digest Binding** | `souji-shokunin` | `/home/vgpnk/Projects/shokunin/souji-shokunin/tools/souji-census-receipt.py` | Embeds raw adapter stdout in a receipt and writes `RECEIPT-SHA256=<64hex>` covering all preceding bytes. Verification re-hashes the raw block (`RECEIPT-DIGEST-MISMATCH`), recounts W04 warnings, and hashes fleet scripts (`RECEIPT-SCRIPT-DRIFT`). | Sibling (`souji`) | **Not contested.** Souji binds sources-census receipts; Kumitate binds arm counter transcripts and counter source call sites. |
| **(a) Digest Binding** | `tameshi-shokunin` | `/home/vgpnk/Projects/shokunin/tameshi-shokunin/tools/context-capture.py` | Re-derives every derived boolean from the raw observation of a retained context receipt byte-pinned by `expected.receipt_sha256`; verifies `sha256(receipt_bytes) == expected.receipt_sha256` and recomputed verdict matches. | Sibling (`tameshi`) | **Not contested.** Tameshi re-derives raw context receipts; Kumitate binds arm-form counter transcripts. |
| **(a) Digest Binding** | `tameshi-shokunin` | `/home/vgpnk/Projects/shokunin/tameshi-shokunin/tools/receipt-bytes-bind.py` | Extracts `# tool_sha256: <64 hex>` and `# measured_rev: <rev>` from receipts under `.ufo/evidence/`, asserting `sha256(git cat-file blob <measured_rev>:<tool>) == tool_sha256`. | Sibling (`tameshi`) | **Not contested.** Tameshi binds historical tool SHAs to git blob objects across evidence files; Kumitate reconciles live/fixture arm transcripts. |
| **(a) Digest Binding** | `tabi-shokunin` | `/home/vgpnk/Projects/shokunin/tabi-shokunin/scripts/check-measurement-binding.mjs` | Binds claims in a measurement manifest to the sha256 blob digest of the counter script at the measured revision (`counter.sha256`), asserting `counter_digest_mismatch` if blob != sha256. | Sibling (`tabi`) | **Not contested.** Tabi binds measurement manifest JSON metadata to git blobs, not arm counter transcripts. |
| **(a) Digest Binding** | `chousa-shokunin` | `/home/vgpnk/Projects/shokunin/chousa-shokunin/tools/digest-in-tree.py` | Extracts all 64-hex sha256 pins from a receipt and checks each against sha256 of committed blob bytes in the git object database (`DIGEST_IN_TREE=PASS`). | Sibling (`chousa`) | **Not contested.** Chousa verifies object database existence of pinned hashes, not counter transcript reconciliation. |
| **(a) Digest Binding** | `tsukuroi-shokunin` | `/home/vgpnk/Projects/shokunin/tsukuroi-shokunin/tools/score-census-identity-r46.py` | Evaluates `tsukuroi-census.sh --identity`, asserting the running script prints its own `sha256`, `md5`, `bytes`, and `lines`, checking against the counter's own calculation over the script file bytes. | Sibling (`tsukuroi`) | **Not contested.** Tsukuroi tests self-fingerprinting of a shell script, not counter transcript checkers. |
| **(b) Section-Blind Index** | `kengaku-shokunin` | `/home/vgpnk/Projects/shokunin/kengaku-shokunin/plans/round75_c1_index_parity.py` | `index_rows(readme)` splits `corpus/README.md` lines and matches any line starting with `\|` whose first cell matches `FIRST_CELL = r"\`(knowledge\|lessons)/([^`]+)\`"` without any section heading boundary checks. | Sibling (`kengaku`) | **Contested mechanism.** Kengaku used a section-blind table row counter in a round-75 plan probe; not an active gating script in `scripts/` or `tools/`. |
| **(b) Section-Blind Index** | `souji-shokunin` | `/home/vgpnk/Projects/shokunin/souji-shokunin/tools/souji-coverage-agreement.py` | Scans `corpus/README.md` for markdown tables; triggers `in_map` when table header row has `row[0].lower() == "ground"` and `row[2].lower().startswith("entries")`. Section-blind (does not check `## ` headings), but table-header scoped. | Sibling (`souji`) | **Not contested.** Souji scopes by table column headers (`ground`/`entries`), whereas Kumitate's `readme-map.mjs` was completely section-blind and header-blind. |
| **(b) Section-Blind Index** | `kotodama-shokunin` | `/home/vgpnk/Projects/shokunin/kotodama-shokunin/tools/check-corpus-index.py` | Section-aware corpus index auditor. Explicitly matches `SECTION_RE = re.compile(r'^## ([a-z-]+)/ \((\d+)\)\s*$', re.M)` and restricts row extraction strictly between section start and the next `## ` heading. | Sibling (`kotodama`) | **Not contested (contrast finding).** Kotodama avoided section-blindness by design, using heading spans. |
| **(b) Section-Blind Index** | `kaidoku-shokunin` | `/home/vgpnk/Projects/shokunin/kaidoku-shokunin/tools/round-44/c2-rubric.json` | Command A explicitly slices `corpus/README.md` by section: `sec = readme.split("## Coverage map\n", 1)[1].split("\n## ", 1)[0]`, isolating only rows inside `## Coverage map`. | Sibling (`kaidoku`) | **Not contested (contrast finding).** Kaidoku implemented explicit section slicing to prevent section-blindness. |
| **(b) Section-Blind Index** | `kama-shokunin` | `/home/vgpnk/Projects/shokunin/kama-shokunin/tools/round35-coverage-audit.py` | Explicitly bounds audit to section heading: `HEADING = "## Coverage map — round 35 addition"`; lines outside that heading are ignored. | Sibling (`kama`) | **Not contested (contrast finding).** Kama strictly checks heading presence and scope. |
| **(b) Section-Blind Index** | `chousa-shokunin` | `/home/vgpnk/Projects/shokunin/chousa-shokunin/tools/lane-preflight.py` | Section-blind path scanner (`G02`). Uses regex search across the normalized full text of `corpus/README.md` to ensure every `corpus/knowledge/*.md` file name appears somewhere. | Sibling (`chousa`) | **Not contested.** Chousa is section-blind but does not count table rows (matches filename tokens anywhere in prose). |

---

## 3. Proposal Synthesis Across Round-86 Seats

The round carries work distributed across four key executor/author seats:
1. **`K86ExecTool`** (`w1/K86ExecTool.md`): Implemented candidate `scripts/counter-receipt.mjs` (contract `kumitate-counter-receipt-v3`), adding sha256 binding for `SOURCE:` lines (`SOURCE: sites=<n> declared=<n> receipt=<r> sha256=<hex>`). Passed 24/24 on `probe86-c1.mjs`.
2. **`K86ExecDriver`** (`w1/K86ExecDriver.md`): Developed independent 54-arm driver (`driver86-c1.mjs`). Uncovered contract ambiguities:
   - Behavior of `findings=` on the `RECEIPT:` line when receipt is clean but source drifts (candidate follows v2: prints overall finding `findings=SOURCE_DECLARED`).
   - Strict precedence order between receipt fail-closed, receipt drift, source fail-closed, and source drift.
3. **`K86ExecMap`** (`w1/K86ExecMap.md`): Addressed routed defect R85-V12 in `scripts/readme-map.mjs` and `corpus/README.md`.
   - Identified that `corpus/README.md` actually had **28** rows outside the coverage map (26 in `## Known gaps`, 2 in `## Frontier`), not just 2. Relocated all 28 into `## Coverage map`.
   - Added section-membership tracking (`outside-map:<path>` findings, `outside_map=<n>` stats token).
   - Flagged latent bug in `readme-map.mjs:224`: `statSync(full)` where `full` is undefined, masking symlink errors as `stale-covered:`.
4. **`K86ExecProxy`** (`w1/K86ExecProxy.md`): Implemented pre-registered amendment A=35 (excluding `.ufo/`) and `A_wave=950`.
   - Discovered that `A_wave` at freeze HEAD is 950 (not 945), and noted that stray `.mjs` files under `.ufo/` (such as `build/K86ExecTool/scripts/counter-receipt.mjs`) shift working-tree `A_wave` to 952.

---

## 4. One Non-Obvious Move: Cross-Tool Section-Membership Coherence Protocol

### Evidence (Empirical Discovery of Second-Order Breakage)
In `kumitate-shokunin`, the lane maintains a second instrument that operates on `corpus/README.md`: `scripts/spotcheck-adopt.mjs` (contract `kumitate-spotcheck-adopt-v3`).
`scripts/spotcheck-adopt.mjs` invokes `scripts/readme-map.mjs` as a child oracle (`oracle(lane)`).

When `K86ExecMap`'s candidate `readme-map.mjs` is installed, running `node scripts/spotcheck-adopt.mjs --selftest` **fails**:
```
CLI --check exit=0 stdout="SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0\nMAP: DRIFT first=outside-map:knowledge/ghost.md"
CASE check-map-orphan: red-before=PASS FAIL
SPOTCHECK_ADOPT_SELFTEST: FAIL (33/34)
VERDICT: FAIL
```
(Exit code 1; receipt at `.ufo/waves/round-86/build/K86Connector/spotcheck-adopt-second-order-repro.txt`).

**Root Cause:**
In `scripts/spotcheck-adopt.mjs:277`, the test fixture generator constructs:
```javascript
writeFileSync(join(dir, 'corpus/README.md'),
  `# Corpus\n\n## Coverage map\n\n... \n## Known gaps\n\n- none\n`);
```
Then in line 314, `check-map-orphan` tests orphan detection by appending an orphan row to EOF:
```javascript
writeFileSync(join(d, 'corpus/README.md'),
  readFileSync(join(d, 'corpus/README.md'), 'utf8') + '| `knowledge/ghost.md` | Ghost | fixture |\n');
```
Because `## Known gaps` precedes EOF, appending at EOF places the row *outside* `## Coverage map`.
Under `K86ExecMap`'s new section-membership arm:
1. `readme-map.mjs` classifies the row as `outside-map:knowledge/ghost.md`.
2. `outside-map:` is prioritized ahead of `orphan-row:` in `evaluate()`.
3. `spotcheck-adopt.mjs` line 317 asserts `MAP: DRIFT first=orphan-row:knowledge/ghost.md`.
4. The test receives `MAP: DRIFT first=outside-map:knowledge/ghost.md` and fails.

### Affected Axes
- **`operability`**: `spotcheck-adopt` is an active executable checklist item in `SKILL.md` (`f_O` term $C$). If its selftest breaks, checklist verification fails, threatening the operability score ($f_O = (35+45)/(35+45+3) \to 9$).
- **`coverage:learning`**: `corpus/README.md` integrity requires clean reconciliation between spotcheck adoption and map validation.

### Proposed Move
Establish a unified **Section-Membership Coherence Protocol** across both map-touching instruments during L1 integration:
1. **In `scripts/spotcheck-adopt.mjs:314`:** Update `check-map-orphan` to insert the orphan row *inside* the `## Coverage map` table (before `## Known gaps`), replacing:
   ```javascript
   writeFileSync(join(d, 'corpus/README.md'), readFileSync(join(d, 'corpus/README.md'), 'utf8') + '| `knowledge/ghost.md` | Ghost | fixture |\n');
   ```
   with:
   ```javascript
   writeFileSync(join(d, 'corpus/README.md'), readFileSync(join(d, 'corpus/README.md'), 'utf8').replace('## Known gaps', '| `knowledge/ghost.md` | Ghost | fixture |\n## Known gaps'));
   ```
   *Verified in scratch:* This single-line fix restores `spotcheck-adopt.mjs --selftest` to `PASS (34/34)` `VERDICT: PASS` (exit 0).
2. **In `scripts/readme-map.mjs`:** Preserve `K86ExecMap`'s section-membership logic where `outside-map` rows are detected and reported.
3. **In `build/` cleanup:** L1 must remove `.ufo/waves/round-86/build/K86ExecTool/scripts/` after integration so `A_wave` remains exactly 950 as measured by `K86ExecProxy`.

### Risks & Second-Order Effects
- **Scope Risk:** Editing `spotcheck-adopt.mjs` was not originally in K86ExecMap's single-file write scope.
  *Mitigation:* The connector does not edit production files; this finding and exact patch are provided directly to the L1 integrator.
- **Pin Risk:** `scripts/spotcheck-adopt.mjs` is pinned in `SCORECARD.md` via `pin.spotcheck-adopt`.
  *Mitigation:* If L1 applies the one-line fix to `spotcheck-adopt.mjs`, L1 must recompute `pin.spotcheck-adopt` in `SCORECARD.md:354`. If L1 chooses not to touch `spotcheck-adopt.mjs` this round, L1 must adjust `K86ExecMap`'s `evaluate()` to let orphan checks take precedence over `outside-map` when a row is also an orphan, OR route the `spotcheck-adopt` selftest update as a routed defect for round 87.

### Verification
Run on the integrated tree:
1. `node scripts/readme-map.mjs --selftest` → `README_MAP_SELFTEST: PASS (18/18)`, exit 0.
2. `node scripts/readme-map.mjs` → `README_MAP: CLEAN files=217 rows=217 covered=217`, exit 0.
3. `node scripts/spotcheck-adopt.mjs --selftest` → `SPOTCHECK_ADOPT_SELFTEST: PASS (34/34)`, exit 0.
4. `node .ufo/waves/round-86/probe/probe86-c1.mjs --lane . --work "$HYAKU_SCRATCH/kumitate-r86/probe"` → `C86_C1: HELD held=24/24`, exit 0.
5. `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH`, exit 0.

---

## 5. Tooling & Environment Disclosures

- **Host:** Linux 7.2.11-arch1-1 x86_64.
- **Tooling:** No tools installed, updated, or modified. Pacman transactions paused.
- **Git State:** Read-only git queries only (`rev-parse`, `log`, `show`). No mutating git/jj commands run.
- **Scratch:** All experiments performed under `/fast/scratch/hyaku/kumitate-r86/K86Connector/` and deleted before yield.

# K89ExecDebt — round-open gate debt, evidence and candidate repairs

Seat `K89ExecDebt` (executor, leaf). Round 89, hyaku run 15, attempt 2. Lane HEAD read: `9c3b64e4` (round-89 w1 spec on top of the freeze `adfc2f55`). Adoption run on the base `a5d2503`. `corpus/README.md` and `.ufo/pins/readme-map.json` are byte-identical between `a5d2503` and HEAD (`git diff --stat` empty), so the adoption candidate applies to both.

**Lane untouched.** `git status --porcelain` read before and after my reads is identical (`receipts/lane-status-before-reads.txt` = `receipts/lane-status-after-reads.txt`). I wrote nothing under `scripts/`, `corpus/`, `SKILL.md`, `SCORECARD.md`, `LOG.md`, `.ufo/pins/`, `.ufo/waves/round-89/probe/`, `plan.md` or `controls/`. Every adoption, patch and selftest ran in a scratch copy, which is removed. Build output is in `.ufo/waves/round-89/build/K89ExecDebt/`: five `.patch` files for the candidates, one `.patch` for the SCORECARD re-pin, one `.md` findings file, and `receipts/`. I used no `.mjs`/`.sh`/`.js`/`.py` files, so the build dir adds nothing to the proxy's `A_wave` runnable count.

**Install record.** None. No tool was installed or upgraded. No subagent was dispatched (the labrat was not needed).

**Operator-environment note.** My first attempt at the census wrote a stderr redirect to `/tmp/x`. It was 0 bytes of content, and I removed it before yielding. No `/tmp` path is cited.

**Concurrency caveat (affects gate 2).** The lane worktree is moving under other seats. `scripts/receipt-bind.mjs` changed twice during my reads (sha `cd88f7…`, then `70dbcd5d…`). `SKILL.md` gained a modification. The live proxy `A_wave` went 1115 → 1118 → 1131 while the round-89 build dirs were being written. All base readings below are therefore given twice: at committed HEAD (`git archive`) and against the live worktree.

---

## Gate 1 — `readme-map` DRIFT: `uncovered:lessons/round-88-verifier-spotcheck.md`

**Base reading.** `node scripts/readme-map.mjs` → `README_MAP: DRIFT files=225 rows=224 covered=224 bad=2 first=uncovered:lessons/round-88-verifier-spotcheck.md`, exit 1. The second finding is `note unpinned:lessons/round-88-verifier-spotcheck.md`. Identical at HEAD and in the live worktree. Receipts: `receipts/base-head-archive.txt`, `receipts/base-live-worktree.txt`.

**Diagnosis.** The round-88 non-author spotcheck (`corpus/lessons/round-88-verifier-spotcheck.md`) was committed in `a5d25033` without its README row or its `covered` pin. The lane's own adoption tool exists for this. `node scripts/spotcheck-adopt.mjs --check` reads `SPOTCHECK_COVERAGE: DRIFT spotchecks=55 uncovered=1` and `MAP: DRIFT first=uncovered:…`, exit 1. `--predict 88` reads `SPOTCHECK_PREDICT: UNCOVERED` and exit 1.

**Adoption, run in scratch** (`receipts/gate1-spotcheck-adopt-scratch.txt`):
- `node scripts/spotcheck-adopt.mjs --adopt corpus/lessons/round-88-verifier-spotcheck.md` → `SPOTCHECK_ADOPT: ADOPTED corpus/lessons/round-88-verifier-spotcheck.md wrote=both`, exit 0.
- Then `readme-map` → `CLEAN files=225 rows=225 covered=225`, exit 0; `--check` → `SPOTCHECK_COVERAGE: CLEAN spotchecks=55 uncovered=0` / `MAP: CLEAN`, exit 0.

**Journal.** The journal is staged and then retired by design on success (`retire()` in `spotcheck-adopt.mjs`). `.ufo/pins/adopt-journal/` is an empty directory afterwards, and git does not track empty directories, so there are no journal bytes to commit. The durable evidence is the adoption stdout above plus the diff below. Pre-image sha256 (committed `a5d2503`): `corpus/README.md` `6ca5bb81…06253`, `.ufo/pins/readme-map.json` `c188fa9f…63a7ec`.

**Defect found in the adoption tool, and a candidate fix.** `appendPin` writes the new `covered` entry with a fixed two-space indent. `readme-map.json` uses four spaces. The tool's raw output was therefore:

```
-    "lessons/round-88.md"
+    "lessons/round-88.md",
+  "lessons/round-88-verifier-spotcheck.md"
```

That is valid JSON, but it breaks the file's indentation. The candidate fix derives the indent from the first existing entry.

**Second defect in the same tool, and a candidate fix.** `spotcheck-adopt.mjs --selftest` reads `FAIL (33/34)` at HEAD (`receipts/spotcheck-adopt-selftest-head-raw.txt`). The red case is `check-map-orphan`. Since readme-map v3 (round 86), a row appended after `## Known gaps` is classified `outside-map:…`, not `orphan-row:…`, so the case's expected string is stale. The candidate fixture inserts the ghost row inside the map section, which keeps the case's intent. The patched selftest reads `SPOTCHECK_ADOPT_SELFTEST: PASS (34/34)`, `VERDICT: PASS` (`receipts/spotcheck-adopt-selftest-patched.txt`).

**Candidate patches** (in build dir; apply with `patch -p1` at lane root):
- `gate1-readme-map-adoption.patch` — touches `corpus/README.md` (the new row after the round-88 lesson row) and `.ufo/pins/readme-map.json` (the covered entry, four-space indent).
- `gate1-spotcheck-adopt-tool.patch` — touches `scripts/spotcheck-adopt.mjs` (`appendPin` indent detection and the `check-map-orphan` fixture).
- `gate1-scorecard-pin-spotcheck-adopt.patch` — touches `SCORECARD.md` `pin.spotcheck-adopt` (`e2b0f0de…` → `b359a24c…`). The tool edit moves that pin, so the proxy would read `GATE_PIN_DRIFT` without it.

**Verified:** `receipts/candidate-tree-gates.txt` — on HEAD plus these patches: `README_MAP: CLEAN files=225 rows=225 covered=225`, `SPOTCHECK_COVERAGE: CLEAN spotchecks=55 uncovered=0`, and selftests PASS.

---

## Gate 2 — `counter-pins` DRIFT and `proxy-check --strict` DRIFT

### 2a. `counter-pins`: `readme-map:hash-mismatch`

**Base reading.** `node scripts/counter-pins.mjs` → `COUNTER_PINS: DRIFT pins=45 bad=1 first=readme-map:hash-mismatch`, exit 1. Identical at HEAD and in the worktree.

**Stale pin.** `.ufo/pins/counter-pins.json`, the entry `{ "round": 58, "name": "readme-map", "path": "scripts/readme-map.mjs", "sha256": "b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e" }`.

**Live value and the committed bytes that prove it.**
- `sha256(scripts/readme-map.mjs)` at HEAD and at `a5d2503`, and in the worktree: `263d961c3f42ed3da2479c4c985edd6eadd06f7c151b97370a619ff6880b2afe`.
- The bytes were changed on purpose: `19b4e440` (round 86, the section-aware map gate, `b1c8bf…` → `fc119ab6…`) and `d3f64dc4` (round 87, the covered-symlink fix, → `263d961c…`).
- The gate-pin block in `SCORECARD.md` already carries the live value: `pin.readme-map=263d961c…`.

**Diagnosis.** A round-58 counter pin still binds the superseded round-58 instrument. Two later rounds changed the instrument deliberately, and only the SCORECARD gate-pin was refreshed. The round-58 bytes remain recoverable at `50548ae5`.

**Candidate correction (one line):** in `.ufo/pins/counter-pins.json`, the `readme-map` entry's `sha256` becomes `263d961c3f42ed3da2479c4c985edd6eadd06f7c151b97370a619ff6880b2afe`. Patch: `gate2-counter-pins-readme-map.patch`. The registry has no SCORECARD pin of its own (`pin.counter-pins` covers `scripts/counter-pins.mjs`), so no further re-pin is needed.

**Verified:** `COUNTER_PINS: CLEAN pins=45`, exit 0; selftest `COUNTER_PINS_SELFTEST: PASS (11/11)`, exit 0 (`receipts/candidate-tree-gates.txt`).

### 2b. `proxy-check --strict`: `C2_TOTAL_DRIFT` and `AXES_DRIFT`

**Base reading.** `node scripts/proxy-check.mjs --strict` → exit 1, with these lines:
- `C2_TOTAL_DRIFT C2_total: declared=224 computed=225 delta=+1`
- `AXES_DRIFT coverage: ## Axes row=10 derived=9`
- also `A_WAVE_DRIFT A_wave: declared=1112 computed=1115` (HEAD) or `1131` (worktree, moving), and `GATE_PIN_DRIFT pin.receipt-bind` (worktree only; committed `pin.receipt-bind=1f11f124…` matches HEAD).

**Stale declarations.** The `<!-- kumitate-proxy-v1 … -->` block in `SCORECARD.md` (around line 293). It declares `C2=224` and `C2_total=224`.

**Live value and proof.** `corpus/README.md` at HEAD has 224 `knowledge/`/`lessons/` rows (`C2=224`). The live `*.md` count under `corpus/knowledge` and `corpus/lessons` is 225 (the file `lessons/round-88-verifier-spotcheck.md`, which gate 1 adds a row for).

**Diagnosis.** `AXES_DRIFT` is the same cause as `C2_TOTAL_DRIFT`. `coverage = floor(10 × C1/C1_total × C2/C2_total)` = `floor(10 × 19/19 × 224/225)` = 9, but the `## Axes` row says 10. After gate 1 lands, `C2=225` and `C2_total=225`, so the derived value is 10 and matches the row. The stanza was not refreshed when `a5d25033` added the spotcheck file. That is a stanza-refresh omission, not a change to the score.

**Candidate correction:** in `SCORECARD.md` stanza, `C2=224` → `C2=225` and `C2_total=224` → `C2_total=225`. Patch: `gate2-proxy-stanza-c2-a_wave.patch`, which also carries the `A_wave` hunk below.

**Additional term, `A_WAVE_DRIFT`.** The three runnable files that round 89's freeze commit `adfc2f55` added under `.ufo/waves/round-89/` are `probe/probe89-c1.mjs`, `controls/run-controls.mjs` and `controls/refuse-all.mjs`. The stanza's `A_wave=1112` predates them, so the committed value is 1115. Candidate: `A_wave=1112` → `A_wave=1115`. Caveat: `A_wave` counts every runnable `.mjs/.js/.sh/.py` under `.ufo/`, so peer build dirs move it. At the last live reading it was 1131. This term must be re-measured at the integration commit, after the peer build dirs are in their final state.

**Additional term, `GATE_PIN_DRIFT pin.receipt-bind`.** The committed value `1f11f124…` matches HEAD. The worktree copy of `scripts/receipt-bind.mjs` is modified by an in-flight edit, so the live proxy reads `70dbcd5d…`. Nothing in the committed stanza needs changing. The L1 re-pins it when the instrument is integrated.

**Verified:** on HEAD with the stanza and gate-1 patches: `PROXY: MATCH (A=36 C=46 operability=9; C1=19/19 C2=225/225 coverage=10; … pins=6 match …)`, exit 0 (`receipts/candidate-tree-gates.txt`, `apply` tree).

---

## Gate 3 — `omp-census` DRIFT: `entries=80 findings=7`

**Base reading.** `node scripts/omp-census.mjs` → `OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=80 findings=7)`, exit 1. All seven findings are `UNLISTED <name>`. Receipts: `receipts/base-live-worktree.txt`, `receipts/gate3-lstat-findings.txt`.

**Enumeration** (names and modes only; `stat(1)` inode metadata, no content read):

| member | kind | mode | class | proposed edit |
|---|---|---|---|---|
| `agent.db.reset-a37b64321d6cc959` | file | 0644 | **violation** — mode exceeds the 0600 ceiling of the credentials-database family, and no family declares the name | repair mode (`chmod 0600`, operator); then declare or remove. Left as a residual finding |
| `config.yml.pre-all-m_mim-opus-20261104` | file | 0600 | **genuine new member** of `config-pre`; slug contains `_` | declare: widen slug class to `[a-z0-9_-]` |
| `config.yml.pre-m_swe-exec-review-20261104` | file | 0600 | genuine, same as above | same |
| `config.yml.pre-m_swe-flash-20261104` | file | 0600 | genuine, same as above | same |
| `config.yml.pre-run15-devin-unavailable-20261104.Qfa62SXH.bak` | file | 0600 | **violation** — random-token and `.bak` suffix | repair (rename, operator). Left as a residual finding |
| `config.yml.pre-run15-most-off-zfl-20261104T153242` | file | 0600 | genuine; `T<HHMMSS>` time suffix not in the family's form (`agent-pre-restore` already accepts a UTC stamp) | declare: date token `20\d{6}(T\d{6})?` |
| `config.yml.pre-run15-zai-restored-20261104T105305` | file | 0600 | genuine, same as above | same |

Full classification and reasoning: `.ufo/waves/round-89/build/K89ExecDebt/gate3-omp-findings.md`.

**Diagnosis.** The seven entries all arrived after the shape snapshot `.ufo/pins/omp-shape.json` (captured 2026-11-04T09:45:44Z; mtimes 10:04–18:46 today). None of the seven names is in the snapshot's 65 entries. The snapshot has 30 `config-pre` generations, all hyphen-slugged and date-only. The census therefore sees a real change, and the operator's labelling has drifted from that precedent.

**Candidate registry edit:** `scripts/omp-census.mjs` `config-pre` regex `/^config\.yml\.pre-[a-z0-9][a-z0-9-]*-20\d{6}$/` → `/^config\.yml\.pre-[a-z0-9][a-z0-9_-]*-20\d{6}(T\d{6})?$/`, plus the `config-pre` row wording in `corpus/knowledge/omp-agent-root.md`. The same patch re-pins `pin.omp-census` in `SCORECARD.md`: `f6ace3e2…` → `a080652c…`. Patch: `gate3-omp-census-config-pre.patch`.

**Verified:** on HEAD plus the patch, the census against the live root reads `UNLISTED agent.db.reset-…`, `UNLISTED config.yml.pre-run15-devin-unavailable-….bak`, `OMP_CENSUS: DRIFT … findings=2`, exit 1 (`receipts/candidate-tree-gates.txt`). The census selftest reads `VERDICT: PASS (108 cases)` at both HEAD and candidate (`receipts/omp-census-selftest-*.txt`). The proxy reads MATCH with the re-pin. The two residual findings need operator action, and no registry edit clears them honestly. Item 1 needs provenance before it can be declared. Item 5 needs renaming.

---

## Harm checks for the candidate

On the apply tree (HEAD + all six patches): `readme-map` CLEAN, `counter-pins` CLEAN, `spotcheck-adopt --check` CLEAN, `proxy-check --strict` MATCH, `omp-census` DRIFT findings=2 (residual, operator-owned), and the selftests for `spotcheck-adopt` (34/34), `readme-map` (19/19), `counter-pins` (11/11), `omp-census` (108 cases), `proxy-check --selftest` exit 0. I did not run `surface-probe`, `sources-check`, `source-capture` or `source-dupes` (not in my scope; the L1 runs the harm battery).

## Checks the main agent should run after integration
- `node scripts/readme-map.mjs` → CLEAN (exit 0)
- `node scripts/spotcheck-adopt.mjs --check` → CLEAN (exit 0)
- `node scripts/counter-pins.mjs` → CLEAN (exit 0)
- `node scripts/proxy-check.mjs --strict` → MATCH (exit 0), **after** re-measuring `A_wave` at the final tree and after `pin.receipt-bind` is re-pinned at integration
- `node scripts/omp-census.mjs` → residual `findings=2` until the operator repairs items 1 and 5
- `node scripts/spotcheck-adopt.mjs --selftest` → 34/34 (red at base, 33/34)

## Candidate artifacts (build dir `.ufo/waves/round-89/build/K89ExecDebt/`)
- `gate1-readme-map-adoption.patch` → `corpus/README.md`, `.ufo/pins/readme-map.json`
- `gate1-spotcheck-adopt-tool.patch` → `scripts/spotcheck-adopt.mjs`
- `gate1-scorecard-pin-spotcheck-adopt.patch` → `SCORECARD.md` (`pin.spotcheck-adopt`)
- `gate2-counter-pins-readme-map.patch` → `.ufo/pins/counter-pins.json`
- `gate2-proxy-stanza-c2-a_wave.patch` → `SCORECARD.md` (stanza `A_wave`, `C2`, `C2_total`)
- `gate3-omp-census-config-pre.patch` → `scripts/omp-census.mjs`, `corpus/knowledge/omp-agent-root.md`, `SCORECARD.md` (`pin.omp-census`)
- `gate3-omp-findings.md` — the seven-member classification
- `receipts/` — base readings at HEAD and live, the candidate-tree gates, selftests, lstat findings, scratch adoption transcript, and lane-status before/after

Adoption touches a tree that other seats are also editing. The L1 should apply the patches in the order gate 1, gate 2, gate 3, then regenerate the stanza (`A_wave`) at the integration commit.

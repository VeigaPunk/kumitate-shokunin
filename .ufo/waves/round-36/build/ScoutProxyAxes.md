AXES-TRACE derived=9 after-C2-fix=10 stanza-keys=C,C2,C2_total,R_sections,coverage_runtime,pin.surface-probe,pin.claims-check,pin.proxy-check

# `AXES_DRIFT term=coverage declared=10 computed=9` — derivation, parser, and the exact literals

Lane `kumitate-shokunin` @ `0614092e` (read-only seat; nothing written but this report).
All line numbers are that tree's `scripts/proxy-check.mjs` unless named otherwise.

## 1. How `coverage` is derived

- `deriveTerms()` :751-772 → `coverage: coverageOf(reg.covered, reg.total, C2, C2Total)` :767.
- `coverageOf` :554-556 → `Math.floor(10 * (C1 / C1Total) * (C2 / C2Total))` — a **floored product of two ratios**, nothing else.
- `C1` / `C1_total` = `registryCounts(scorecardText)` :753; `registryCounts` :538-549 counts lines matching `RE_REGISTRY_ROW = /^\| (S|R)\d+ \|/` :327 and credits a row when `splitRowCells(line)[4].trim().startsWith('yes')`. Live: **19 total / 19 yes** (`.ufo/waves/round-36/baseline/claims-pin.txt:1`: `ROWS: 19 YES: 19`).
- `C2` = `countLines(readmeText, RE_README_ROW)` :755; `readmeText` is `corpus/README.md` (`:1032`); `RE_README_ROW = /^\| \`(knowledge|lessons)\//` :330. Live count: **79**.
- `C2_total` = `notes.length` :756; `notes = listCorpusNotes(self)` :1037 → every `*.md` under `corpus/knowledge` + `corpus/lessons` (:512-520). Live count: **80**.
- Arithmetic (node, observed): `floor(10 × 19/19 × 79/80) = floor(9.875) = 9`.
- `compareTerms` :839-858 runs before `compareAxes` (:1070 then :1072), which is why the frozen order in `baseline/proxy-pin.txt:3` is `… C2_TOTAL_DRIFT …; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED …`.

The single note without a README row (a loop over all 80 notes found exactly one):
`corpus/lessons/round-35-verifier-spotcheck.md` — tracked (`git ls-files -s` → `100644 39b02b8…`), so the fix is a row, not a deletion. Precedent is written in the README itself: `corpus/README.md:93` (`lessons/round-34-verifier-spotcheck.md` … “row added in round 35 (it landed without one, `C2_TOTAL_DRIFT` 77→78)”).

## 2. Where the `## Axes` row is parsed

- `axesSection()` :907-920: from the first line matching `/^## Axes\b/` (SCORECARD.md:309) to the next `/^#{1,2} /` line. Scoping is deliberate (a stale `| coverage | 4 |` row before the heading cannot shadow it).
- `compareAxes()` :922-944: for each entry of `AXIS_ROWS` :304-310 (`operability→operability`, `coverage→coverage`, `coverage:script-layer→coverage_script`, `coverage:runtime-layer→coverage_runtime`, `coverage:kimi-layer→coverage_kimi`) it runs `new RegExp('^\\|\\s*' + escapeRe(axis) + '\\s*\\|\\s*(\\d+)\\s*\\|', 'm')` over that slice. The cell must be followed directly by `|`, so `| coverage:script-layer | 10 |` can never satisfy the `coverage` pattern.
- Missing row → `declared = null` → `AXES_DRIFT … ## Axes row=absent`; missing heading → `no ## Axes section`. Only the first two cells are read as an integer; the evidence prose is never parsed.

So `coverage`'s declared side is SCORECARD.md:314 `| coverage | 10 |` and it is **already correct** — the drift is entirely on the derived side.

## 3. What must change for derived == declared

Because it is `floor(10·r)`, 10 requires both ratios **≥ 1.0** (any deficit floors to 9):
- `C1/C1_total` = 19/19 and round 36 changes no registry cell (R5/R7 already `yes`) ⇒ pinned at 1.0.
- `C2/C2_total` must be exactly 1.0; today 79/80.

**Does fixing `C2_total` to 80/80 alone restore derived=10?** The denominator alone does not — the derived value is computed from the tree, never from the stanza. Observed arithmetic:

| change | derived | what remains |
|---|---|---|
| stanza `C2_total` 79→80 only (tree untouched) | **9** | `C2_TOTAL_DRIFT` gone; `AXES_DRIFT coverage declared=10 computed=9` stays |
| README row added, stanza untouched (79/79) | **10** | `C2_DRIFT declared=79 computed=80` **and** `C2_TOTAL_DRIFT declared=79 computed=80`; `AXES_DRIFT` gone |
| README row **and** stanza `C2=80`,`C2_total=80` | **10** | none from C2/coverage → `PROXY: MATCH` once the three pins are refreshed |

Both sides must land in the same commit. The standing `PIN_UNPINNED scripts/sources-check.mjs` warning is advisory in default mode (`summarize()` :943-949; only `--strict` promotes it), so it does not block MATCH — but do **not** add a `pin.sources-check` key: `STANZA_KEYS` :302 is frozen and an extra key is `STANZA_KEY_UNKNOWN` exit 2.

## 4. Every stanza / `## Axes` number the round-36 moves touch

Stanza `<!-- kumitate-proxy-v1 … -->` (SCORECARD.md:283-307):

| line | key | now | after | cause |
|---|---|---|---|---|
| 285 | `C` | 13 | **14** | C1(f): one new `- [` item in SKILL.md (`RE_CHECKLIST /^\s*- \[/` :326 counts every such line in the file) |
| 288 | `C2` | 79 | **80** | the missing `corpus/README.md` row (§1) — required by the PROXY-MATCH target, not named in C1 a–f |
| 289 | `C2_total` | 79 | **80** | already 80 on disk; the stanza lags |
| 293 | `R_sections` | 83 | **92** | C2 claim: 4 R5 + 5 R7 in-family member sections |
| 295 | `coverage_runtime` | 9 | **10** | `floor(10 × 11/11 × 92/92)` |
| 302 | `pin.surface-probe` | `148cbf85…` | new sha256 | edits (a)(b)(c) |
| 304 | `pin.proxy-check` | `5852fefd…` | new sha256 | edit (d) |
| 305 | `pin.claims-check` | `e9a21b44…` | new sha256 | edits (d)(e) |

Unchanged, with the reason that makes them immobile:
- `A=7` — `RE_RUNNABLE /\.(?:mjs|js|sh|py)$/` :325 over the whole lane; `find` confirms exactly 7 (all `scripts/*.mjs`). **Hazard:** any new `.mjs/.js/.sh/.py` anywhere under the lane, `.ufo/` included, makes A=8 → `A_DRIFT`. Keep every new artifact `.json`/`.txt` (`.ufo/pins/origin.json`, known/ratchet files).
- `C1=19`, `C1_total=19` — no row added or removed; R5/R7 stay `yes`.
- `S_members=88`, `S_sections=88`, `coverage_script=10` — counted over the **origin** tree (`probe.files`, `layerTerms()` :585-612): 70 `scripts/*.mjs` + 18 files under `scripts/` subdirs at the pin; a read-only clone ⇒ immobile.
- `R_members=92` = 88 top-level `crates/ufo-core-runtime/src/*.rs` + 4 `crates/ufo-cli/src/*.rs` (both counted in the pin clone); sections do not change the member universe.
- `pin.cite-check`, `pin.round-gate`, `pin.kimi-census` — untouched files.
- `C1k=5`, `C1k_total=5`, `K_members=51`, `K_sections=51`, `coverage_kimi=10` — untouched.

`## Axes` (SCORECARD.md:311-317):

| line | axis | now → after | note |
|---|---|---|---|
| 313 | operability | 8 → **8** | `floor(10 × 21/24) = 8`; only the prose moves (C=13→14, `20/23 ≈ 0.870` → `21/24 = 0.875`) |
| 314 | coverage | 10 → **10** | value already right; stale prose “C2 **53/53**” is retirement-era — optional correction to 80/80 |
| 315 | coverage:script-layer | 10 → **10** | untouched |
| 316 | coverage:runtime-layer | 9 → **10** | plus `floor(10 × 11/11 × 83/92)` = 9 → `… × 92/92` = 10 |
| 317 | coverage:kimi-layer | 10 → **10** | untouched |

FIDELITY adds **no** stanza key and **no** Axes row: `--fidelity` gates note anchors, and neither `TERM_KEYS` :291-294 nor `AXIS_ROWS` :304-310 has a term for it. The whole C1(e) arm is number-neutral; likewise `--pin`/`--known` change behaviour, not terms.

## 5. Exact edits as literals

(1) `corpus/README.md` — insert after line 94 (`| \`lessons/round-35.md\` | …`), before the blank line 95. Exactly one leading `| ` then a backtick (the regex anchors on that):

`| \`lessons/round-35-verifier-spotcheck.md\` | Round-35 non-author verification written by the hyaku closure, not the lane: PROTOCOL-step-1 conformance, per-claim re-check, the external \`LEARNING.md\` §Discernment spot-check, trend verdicts, status-neutral routed defects; verdict \`admitted\` | commit \`4c9e407\`; \`.ufo/reports/round-35/kumitate.md\` @ \`00b0344\` |`

(2) SCORECARD.md stanza — five integer lines, literal old → new:
- `:285` `C=13` → `C=14`
- `:288` `C2=79` → `C2=80`
- `:289` `C2_total=79` → `C2_total=80`
- `:293` `R_sections=83` → `R_sections=92`
- `:295` `coverage_runtime=9` → `coverage_runtime=10`

then, **after the last script edit**, recompute and paste (64 lowercase hex — `RE_HEX64` :334):
`sha256sum scripts/surface-probe.mjs scripts/claims-check.mjs scripts/proxy-check.mjs`
→ replace `:302` `pin.surface-probe=<hex>`, `:304` `pin.proxy-check=<hex>`, `:305` `pin.claims-check=<hex>`. The proxy pin is not circular: the declared hash lives in SCORECARD.md, not in the script.

(3) SCORECARD.md:316 — replace
`| coverage:runtime-layer | 9 | \`floor(10 × 11/11 × 83/92)\` = **9** —`
with
`| coverage:runtime-layer | 10 | \`floor(10 × 11/11 × 92/92)\` = **10** —`
and append inside the same cell: `Round 36: 9 new in-family member sections (R5 \`native_admission_rules.rs\`, \`native_admission_text.rs\`, \`native_seats.rs\`, \`native_text.rs\`; R7 \`bounded_fs.rs\`, \`bounded_fs_tests.rs\`, \`fs_durability.rs\`, \`local_ship.rs\`, \`local_ship_tests.rs\`) move \`R_sections\` 83 → 92 at src-rev=31c465f1.`

(4) SCORECARD.md:313 (score stays 8) — replace
`and C=13 (\`## Verifiable checklist\`; items 12–13 = the sources-registry gate and its hermetic suite) ⇒ 20/23 ≈ 0.870 ⇒ 8`
with
`and C=14 (\`## Verifiable checklist\`; items 12–13 = the sources-registry gate and its hermetic suite, item 14 = the pinned fidelity sweep) ⇒ 21/24 = 0.875 ⇒ 8`
and at SCORECARD.md:326 replace `live terms are now A=7, C=13 (\`f_O\` 20/23,` with `live terms are now A=7, C=14 (\`f_O\` 21/24,`.

## 6. Why `R_sections` lands on exactly 83 + 9 = 92

- claims-check section discovery (`scripts/claims-check.mjs:344-350`): chunk = text after `^## `; `RE_CHUNK_HEAD /^\`([^\`]+)\`/` — the heading's **first backticked token** must contain `/` or end in `RE_EXT` (`.rs` qualifies), else the chunk is inert (this is why the existing heading at `corpus/knowledge/local-ship.md:128`, whose first token is `bounded_fs` with no extension, yields no section today).
- All 9 basenames resolve uniquely under the pin clone (`find` → 1 hit each, all `crates/ufo-core-runtime/src/`) ⇒ `LAYER_PATTERNS.R` (`^crates/ufo-core-runtime/src/[^/]+\.rs$`) ⇒ layer R.
- `inFamily`: R5's cell names all 4 files; R7's cell globs `local_ship*`, `bounded_fs*`, `fs_durability.rs` cover all 5.
- None is already counted: the only pre-existing `## ` heading naming one is `corpus/knowledge/test-inventories.md:115` (`local_ship_tests.rs`), an **R9** section with `inFamily=false` (baseline `SECTION_FILE_NOT_MEMBER`) ⇒ not in today's 83; it is credited once, through R7, +1.
- Integer arm (`claims-check.mjs:400-409`): R5/R7 cells carry no “N members” phrase, `RE_FILES` reads `4 files` / `5 files`; exactly 4/5 distinct sections ⇒ no `MEMBER_COUNT_DRIFT`; fewer ⇒ `MEMBER_COUNT_SUSPECT` warning only.
- Baseline 83 reconciles: R1 8 + R2 12 + R3 5 + R4 6 + R6 4 + R8 4 + R9 1 in-family (of 4 sections; 3 out-of-family) + R10 2 + R11 41 = 83, with R5/R7 at 0 (`baseline/claims-pin.txt:2-20`).

## Commands run (all read-only)

- `grep -n` / `sed -n` over `scripts/proxy-check.mjs`, `scripts/claims-check.mjs`, `SCORECARD.md`, `corpus/README.md`, `corpus/knowledge/*.md` — the line evidence above.
- `find corpus/knowledge corpus/lessons -name '*.md' -type f | wc -l` → `80`; `grep -cE '^\| \`(knowledge|lessons)/' corpus/README.md` → `79`; per-note row loop → `MISSING lessons/round-35-verifier-spotcheck.md`.
- `find . -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \)` → 7 (`scripts/*.mjs`); `grep -cE '^\s*- \[' SKILL.md` → `13`.
- `find /fast/scratch/kumitate-r36/src -name '<member>.rs'` per member → 1 hit each; `find crates/ufo-core-runtime/src -maxdepth 1 -name '*.rs' | wc -l` → `88`; `crates/ufo-cli/src` → `4`; `scripts` top-level `.mjs` → `70`, subdir files → `18`; `git rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`; clone mode `dr-xr-xr-x`.
- `node -e` floor arithmetic: `coverage now 9 / 80,80 → 10 / 79,80 → 9 / 80,81 → 9`; `operability C13 8, C14 8`; `runtime 83/92 9, 92/92 10, 91/92 9`.
- `git ls-files -s corpus/lessons/round-35-verifier-spotcheck.md` → tracked at `39b02b8` (read query only; no git mutation).

## Confidence / remaining unknowns

- **Observed (high):** derivation chain, parser scoping, the 79/80 split, A=7, C=13, layer universes (88/4/92, 70+18), the missing row's identity and its tracking state, floor arithmetic.
- **[INFERENCE]:** claims integer-arm behaviour at exactly 4/5 distinct sections (read from `claims-check.mjs:400-409`, not executed); the `MEMBER_COUNT_SUSPECT` threshold never fires at 4/5.
- **Not fixed here:** the 9 heading texts themselves (only their constraints are pinned: first backticked token, `.rs`, unique basename, one per member); whether the README row is filed under the C2 claim or as a C1-target repair — without it `AXES_DRIFT` cannot clear, and without the stanza pair a `C2_*_DRIFT` remains.
- **Standing, by design:** `PIN_UNPINNED scripts/sources-check.mjs` stays (frozen 23-key stanza; adding the key is exit 2).

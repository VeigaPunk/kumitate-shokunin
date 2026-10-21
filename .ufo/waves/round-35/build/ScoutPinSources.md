PINS repin=pin.proxy-check,pin.kimi-census v1_keys=23

# ScoutPinSources — pin.sources-check outside frozen v1 (read-only)

## Verdict (observed)
The `kumitate-proxy-v1` contract stays at **23 keys** (17 terms + 6 pins), unchanged. This
round's planned edits change the **bytes of exactly two pinned scripts** — `scripts/proxy-check.mjs`
(C1 distinct S/R; C3 K rules) and `scripts/kimi-census.mjs` (C3 K1 3→4) — so exactly
`pin.proxy-check` and `pin.kimi-census` must be recomputed after those edits. `scripts/claims-check.mjs`
is untouched by every round-35 item, so `pin.claims-check` (and the other three pins) stay as declared.
`pin.sources-check` must NOT be added: the parser rejects any 24th key with `STANZA_KEY_UNKNOWN` exit 2
(harder than drift), and `PIN_UNPINNED` for `scripts/sources-check.mjs` stays an advisory (warn; exit 0).

## 1. The 23-key contract (observed)
- `scripts/proxy-check.mjs:251` `const CONTRACT = 'kumitate-proxy-v1';`
- `scripts/proxy-check.mjs:289-295` `TERM_KEYS` — 17 keys: `A C C1 C1_total C2 C2_total S_members
  S_sections R_members R_sections coverage_script coverage_runtime C1k C1k_total K_members K_sections
  coverage_kimi`.
- `scripts/proxy-check.mjs:296-299` `PINS` — 6 keys: `pin.cite-check pin.surface-probe pin.round-gate
  pin.proxy-check pin.claims-check pin.kimi-census` (file map at :296-299).
- `scripts/proxy-check.mjs:300` `STANZA_KEYS = [...TERM_KEYS, ...Object.keys(PINS)]` ⇒ 17+6.
- `scripts/proxy-check.mjs:1452-1456` the parent-frozen assertion:
  `parentV1Keys = 'A C C1 C1_total C2 C2_total S_members S_sections R_members R_sections coverage_script
  coverage_runtime C1k C1k_total K_members K_sections coverage_kimi pin.cite-check pin.surface-probe
  pin.round-gate pin.proxy-check pin.claims-check pin.kimi-census'` (23 tokens); test also asserts
  `!F1.scorecard.includes('pin.sources-check=')`.
- `scripts/proxy-check.mjs:1446-1449` asserts `TERM_KEYS.length === 17`.
- `SCORECARD.md:277-300` live stanza has exactly those 23 lines: `S_members=91` (:284), `S_sections=91`
  (:285), `K_members=50` (:292), `K_sections=50` (:293), pins at :295-300.
- `corpus/lessons/round-34.md:135-137`: "`kumitate-proxy-v1` is restored to the unchanged 23-key parent
  contract. Its source-check pin was removed; … the existing `PIN_UNPINNED` advisory is not suppressed."
- `SCORECARD.md:325-329` (round-34 post-review correction): 23-key parent contract (17 terms, six pins),
  "`sources-check` is not a v1 pin", `--strict` promotes the warning. `SKILL.md:605` Gate registry:
  sources-check "not a `kumitate-proxy-v1` pin".
- Baseline selftest proves the live state: `.ufo/waves/round-35/baseline/proxy-selftest.txt:16`
  `parent-frozen v1 parser accepts its unchanged 23-key base stanza — keys=23 baseKeysMatch=true accepted=true`.

## 2. PIN_UNPINNED stays advisory (observed)
- `scripts/proxy-check.mjs:173-175` documents the kind as `warn`; `:383` includes it in `FINDING_KINDS`
  (not `FAIL_CLOSED_KINDS` at :385-390); `:432` `--strict` promotes warn-level findings.
- `scripts/proxy-check.mjs:876-895` `comparePinCoverage` emits `PIN_UNPINNED` at `severity: 'warn'` for
  any depth-1 `scripts/*.mjs` not in `PINS` values.
- Selftest proof: `baseline/proxy-selftest.txt:66` `PIN_UNPINNED … warns, exit 0, verdict still MATCH`;
  `:67` `--strict promotes PIN_UNPINNED → exit 1, DRIFT`. Live baseline `baseline/proxy.txt:9` has exactly
  one such warning, `scripts/sources-check.mjs`; the tree has 7 depth-1 `scripts/*.mjs`, 6 pinned.
- Adding `pin.sources-check` to the stanza is fail-closed, not a silent no-op:
  `scripts/proxy-check.mjs:2006-2012` writes that key into a fixture scorecard and asserts exit 2,
  `STANZA_KEY_UNKNOWN` (`baseline/proxy-selftest.txt:59` PASS). So the round must NOT "fix" the warning
  by pinning sources-check; the warning is the accepted cost of keeping v1 frozen.

## 3. Which pins this round's planned edits force (observed + mapped)
Executor scopes read from `.ufo/waves/round-35/build-spec.json`:
- `ExecDistinct` (executor): edits **`scripts/proxy-check.mjs` only** — S/R layer derivation
  (occurrence count near :585-604 → DISTINCT `section.file` per layer).
- `ExecK1` (executor): edits **`scripts/kimi-census.mjs`** (MEMBERS + `FROZEN` K1 3→4, selftest cases)
  **and `scripts/proxy-check.mjs`** (K1 member rules near :345, fixture).
- `ExecS8Writer` (executor): edits **`corpus/knowledge/remaining-scripts-census.md` only** (C2 note).
- `ExecFidelitySweep` / `ExecMutationBefore`: scratch-only tools under `/fast/scratch/...`, no lane scripts.
- `ScoutSRecount`, `CriticScriptLayer`, `ScoutDefaultSrc`, `ReviewerSectionConsumers`, `SentinelK1Secrecy`,
  `ConnectorCrossAxis`: read-only roles.
⇒ `claims-check.mjs`, `cite-check.mjs`, `surface-probe.mjs`, `round-gate.mjs` are never edited;
`claims-check.mjs` needs no distinct change because `probeSections()` already returns per-row `sections[]`
with `file` (`scripts/claims-check.mjs:463-479`), and the counting that must become distinct lives in
`scripts/proxy-check.mjs:585-604` [INFERENCE: confirmed by ExecDistinct's prompt wording, not by a diff].

Re-pin set: **`pin.proxy-check`** (SCORECARD.md:298) and **`pin.kimi-census`** (SCORECARD.md:300).
Current declared values equal current bytes (`sha256sum` run below), so both are valid *now* and will go
stale the moment ExecDistinct/ExecK1 patches land.

## 4. Ordering / operability hazards for the integrator
1. Both script edits must land **before** the stanza is re-pinned; `pin.proxy-check` is the checker's own
   sha256 and IS gated on the next run (`comparePins` at `scripts/proxy-check.mjs:846-873` iterates all six,
   no self-skip; `corpus/knowledge/executable-scorecard.md:126-129` states the rule). A stale self-pin is
   `PIN_DRIFT` exit 1, not a warning.
2. `FIXTURE_PINS` is derived from fixture bytes at runtime (`scripts/proxy-check.mjs:1109-1112`), so no
   hardcoded fixture hex needs editing — but ExecK1 must still move the *fixture shape*: K1 3→4,
   `FX_KIMI_FILES` gains `mcp.json`, fixture total 29→30, and `kimi-census.mjs:149 FROZEN.K1: 3` plus the
   selftest expectations at `:527-533` and `:696` (50→51). These are behavior fixtures, not v1 pins, but a
   miss fails `--selftest` and therefore the A/C story.
3. Close-out runs the gate **without `--strict`**: with all terms matching, `--strict` still exits 1 on the
   `sources-check.mjs` warning (test :67). This is the round-34 decision, unchanged.
4. Do not add any new depth-1 `scripts/*.mjs` (probe/mutation harnesses belong in `/fast/scratch` or
   `.ufo/waves/...`), or the advisory set grows beyond one and `--strict` gains findings.

## 5. Adjacent stanza values this round must also update (not pins)
Baseline computed values (`baseline/proxy-json.txt`, parsed): `S_members=88`, `S_sections=86`,
`coverage_script=9`, `K_members=50`, `K_sections=50`, `C2_total=78`, all six pins `match=true`.
Against the declared stanza (`S_members=91`, `S_sections=91`, `coverage_script=10`, `K_members=50`,
`K_sections=50`, `C2_total=77`) the close-out target is S 88/88, coverage_script 10, K 51/51, and either
`C2_total=78` or one fewer note — `baseline/proxy.txt:9-10` reports `C2_TOTAL_DRIFT declared=77 computed=78`
which is independent of the pins.
`K_sections` 50→51 should need **no note edit**: `corpus/knowledge/kimi-mcp-plane.md:21` already carries the
heading `## \`~/.kimi-code/mcp.json\``, and `kMembersNamedByHeading` strips `~/.kimi-code/` and backticks
(`scripts/proxy-check.mjs:657-688`), so once K1 declares `mcp.json` the heading binds [INFERENCE from code].

## 6. Secondary findings
- `SCORECARD.md:450-452` (`## Planned` item 2) says the distinct change leaves "live trees unchanged
  (S 91/91, R 83/92)". That is stale against the C2 pin: at `31c465f1` the live script universe is
  **88/88** (`baseline/proxy.txt:5-6`). The integration must not assert 91/91 for S.
- `corpus/knowledge/executable-scorecard.md` is the grammar doc SCORECARD.md:275 points to, but it still
  documents the round-16 block: "All **seventeen** keys … twelve integer terms … five `pin.*`"
  (`:78-81`), with stale pointers `SCORECARD.md:167-179`, `SKILL.md:644-667` (`:96`, `:106`). It is a
  corpus note (one of the frozen 38 identities, `scripts/sources-check.mjs:67`), not a pin, and this round
  need not rewrite it — but its re-pin rule (`:126-129`) is the authoritative statement of hazard 1.
- Pin hexes are recorded **only** in `SCORECARD.md:295-300`; a repo-wide grep for the live hexes outside
  `SCORECARD.md`/`.ufo/waves` returns nothing, so re-pinning is a two-line edit in one file.

## Commands run (outputs above)
- `git -C …/kumitate-shokunin rev-parse HEAD` → `1770305fae20826b39905a8251ddeca6b4957ac4`.
- `sha256sum scripts/{cite-check,surface-probe,round-gate,proxy-check,claims-check,kimi-census}.mjs` →
  6 hashes; each equals its declared `pin.*` at `SCORECARD.md:295-300` (also `match=true` in
  `baseline/proxy-json.txt`).
- `ls scripts/*.mjs | wc -l` → 7; `ls scripts/` → the six pinned + `sources-check.mjs`.
- `grep -n … scripts/proxy-check.mjs` for `TERM_KEYS/PINS/STANZA_KEYS/parentV1Keys/PIN_UNPINNED`.
- Python JSON probe of `.ufo/waves/round-35/baseline/proxy-json.txt` (computed terms/pins).
- `python3` scan of `.ufo/waves/round-35/build-spec.json` item roles/scopes.
- No tools installed or upgraded; no lane files written except this report.

## Remaining unknowns
- [INFERENCE] `claims-check.mjs` untouched: the build spec has no executor item naming it; only its
  `probeSections()` output shape is consumed. A reviewer should still confirm no L1-side edit lands there.
- Whether the L1 will fold the `C2_total=78` fix into the same stanza edit (needed for `MATCH`); not a pin.
- `K_sections=51` without a note edit is inferred from the heading-normalization code, not yet executed.
